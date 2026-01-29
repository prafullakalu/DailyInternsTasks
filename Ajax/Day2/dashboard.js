let fromCompanyTransactions = [];
let toCompanyTransactions = [];
let matchRows = [];
let refreshInterval = null;
let selectedTransactions = [];
let selectedTransactionColumns = {}; 

$(document).ready(function() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    $('#userInfo').text(localStorage.getItem('userEmail') || 'User');
    loadTransactions();
 
    refreshInterval = setInterval(checkAndRefreshAvailableC2, 30000);
});

function checkAndRefreshAvailableC2() {
    const reconciledData = JSON.parse(localStorage.getItem('reconciledTransactions') || '[]');
    const excludedCompany2 = JSON.parse(localStorage.getItem('excludedCompany2') || '[]');
    const reconciledIds = reconciledData.flatMap(r => 
        [String(r.company1Id), ...(r.company2Ids || []).map(String)]
    );

    const c2Available = toCompanyTransactions.filter((t, i) => 
        !reconciledIds.includes(String(t.transactionId || i)) &&
        !excludedCompany2.includes(String(t.transactionId || i))
    );

    if (c2Available.length === 0) {
        console.log('Available C2 is empty, refreshing...');
        loadTransactions();
    }
}

function loadTransactions() {
    const token = localStorage.getItem('authToken');

    $.ajax({
        url: 'http://trainingsampleapi.satva.solutions/api/Reconciliation/GetTransaction',
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            console.log('API Response:', response);
            localStorage.setItem('transactions', JSON.stringify(response));
            
            fromCompanyTransactions = response.fromCompanyTransaction || [];
            toCompanyTransactions = response.toCompanyTransaction || [];
            
            console.log('📊 Company 1:', fromCompanyTransactions.length);
            console.log('📊 Company 2:', toCompanyTransactions.length);
            
            initializeMatchRows();
            renderGrid();
        },
        error: function(xhr) {
            const cached = localStorage.getItem('transactions');
            if (cached) {
                const data = JSON.parse(cached);
                fromCompanyTransactions = data.fromCompanyTransaction || [];
                toCompanyTransactions = data.toCompanyTransaction || [];
                initializeMatchRows();
                renderGrid();
            } else if (xhr.status === 401) {
                alert('Session expired');
                logout();
            }
        }
    });
}

function initializeMatchRows() {
    // Get reconciled and excluded data
    const reconciledData = JSON.parse(localStorage.getItem('reconciledTransactions') || '[]');
    const excludedCompany1 = JSON.parse(localStorage.getItem('excludedCompany1') || '[]').map(String);
    const excludedCompany2 = JSON.parse(localStorage.getItem('excludedCompany2') || '[]').map(String);
    
    const reconciledIds = reconciledData.flatMap(r => 
        [String(r.company1Id), ...(r.company2Ids || []).map(String)]
    );

    // Filter available transactions (exclude reconciled and excluded ones)
    const c1Available = fromCompanyTransactions.filter(t => 
        !reconciledIds.includes(String(t.transactionId)) &&
        !excludedCompany1.includes(String(t.transactionId))
    );
    const c2Available = toCompanyTransactions.filter(t => 
        !reconciledIds.includes(String(t.transactionId)) &&
        !excludedCompany2.includes(String(t.transactionId))
    );

    console.log('Available C1:', c1Available.length, 'C2:', c2Available.length);
    console.log('Excluded C1:', excludedCompany1.length, 'C2:', excludedCompany2.length);

    // Create rows - one for each C1 transaction
    matchRows = c1Available.map((c1Trans, index) => ({
        id: index,
        c1Transactions: [c1Trans],
        c2Transactions: [],
        isSelected: false
    }));

    // Add empty rows for unmatched C2 transactions
    if (c2Available.length > c1Available.length) {
        for (let i = c1Available.length; i < c2Available.length; i++) {
            matchRows.push({
                id: i,
                c1Transactions: [],
                c2Transactions: [],
                isSelected: false
            });
        }
    }

    updateTotals();
}

function renderGrid() {
    const grid = $('#reconciliationGrid');
    
    if (matchRows.length === 0) {
        grid.html('<div class="empty-state">No transactions available</div>');
        return;
    }

    // Create four columns: C1, Matching, C2, Available C2
    let c1Html = '<div id="c1-container">';
    let matchingHtml = '<div id="matching-container" class="matching-column">';
    let c2Html = '<div id="c2-container">';
    let c2AvailableHtml = '<div id="c2-available-container"><div id="c2Source" style="display: flex; flex-direction: column; gap: 15px;"></div></div>';
    
    matchRows.forEach((row, index) => {
        const c1Total = row.c1Transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
        const c2Total = row.c2Transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
        const isMatched = Math.abs(c1Total - c2Total) < 0.01 && c1Total > 0 && c2Total > 0;
        
        // Determine border color based on status
        let borderColor = '#7ebad4'; // Default blue
        let borderStyle = 'border: 3px solid ' + borderColor;
        let bgStyle = '';
        let statusLabel = '';
        
        if (row.c2Transactions.length > 0) {
            // Has C2 transactions dropped
            if (isMatched) {
                borderColor = '#10b981'; // Green - valid for reconciliation
                bgStyle = 'background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);';
                statusLabel = '<div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-align: center; margin-bottom: 8px;">✓ READY TO RECONCILE</div>';
            } else {
                borderColor = '#ef4444'; // Red - invalid (amounts don't match)
                bgStyle = 'background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);';
                statusLabel = '<div style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-align: center; margin-bottom: 8px;">⚠ AMOUNTS DON\'T MATCH</div>';
            }
            borderStyle = 'border: 3px solid ' + borderColor + '; ' + bgStyle;
        }

        // Row number badge
        const rowBadge = `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; margin-bottom: 10px; text-align: center; box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);">Row ${index + 1}</div>`;

        c1Html += `<div class="match-row" data-row="${index}" id="c1-row-${index}">
            ${rowBadge}
            ${row.c1Transactions.length === 0 
                ? '<div class="drop-zone">Drop here</div>'
                : row.c1Transactions.map(t => createTransactionCard(t, 'c1', index)).join('')
            }
        </div>`;
        
        
        matchingHtml += `<div style="display: flex; align-items: center; justify-content: center; background: ${isMatched ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 100%)'}; border-radius: 10px; padding: 12px; min-height: 120px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: relative;">
            <div style="position: absolute; top: 8px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.1); color: rgba(0,0,0,0.5); padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700;">Row ${index + 1}</div>
            <div style="text-align: center; font-size: 36px; color: ${isMatched ? '#10b981' : '#667eea'}; font-weight: 700;">${isMatched ? '✓' : '⇄'}</div>
        </div>`;
        
      
        c2Html += `<div class="match-row" data-row="${index}" id="c2-row-${index}" style="${borderStyle}">
            ${rowBadge}
            ${statusLabel}
            ${row.c2Transactions.length === 0 
                ? `<div class="drop-zone" style="min-height: 60px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px;">
                    <div style="font-size: 14px; color: #667eea; font-weight: 600;">Drop Row ${index + 1} matches here</div>
                    <div style="font-size: 11px; color: #999;">Drag from Available C2 →</div>
                   </div>`
                : row.c2Transactions.map(t => createTransactionCard(t, 'c2', index)).join('')
            }
            ${row.c2Transactions.length > 0 ? `<div style="margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 6px; font-size: 12px; display: flex; justify-content: space-between;">
                <span style="font-weight: 600;">C1 Total:</span> <span style="color: #667eea; font-weight: 700;">$${c1Total.toFixed(2)}</span>
            </div>
            <div style="padding: 8px; background: rgba(0,0,0,0.05); border-radius: 6px; font-size: 12px; display: flex; justify-content: space-between;">
                <span style="font-weight: 600;">Stack Total:</span> <span style="color: ${isMatched ? '#10b981' : '#ef4444'}; font-weight: 700;">$${c2Total.toFixed(2)}</span>
            </div>
            <div style="padding: 8px; background: ${isMatched ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 6px; font-size: 12px; display: flex; justify-content: space-between; border: 1px solid ${isMatched ? '#10b981' : '#ef4444'};">
                <span style="font-weight: 700;">Difference:</span> <span style="color: ${isMatched ? '#10b981' : '#ef4444'}; font-weight: 700;">$${Math.abs(c1Total - c2Total).toFixed(2)}</span>
            </div>` : ''}
        </div>`;
    });
    
    c1Html += '</div>';
    matchingHtml += '</div>';
    c2Html += '</div>';
    
    grid.html(c1Html + matchingHtml + c2Html + c2AvailableHtml);

    initializeDragDrop();
}

function createTransactionCard(t, company, rowIndex) {
    const id = t.transactionId || Math.random().toString(36).substr(2, 9);
    const type = t.transactionType || 'Transaction';
    const date = t.date || 'N/A';
    const amount = Math.abs(Number(t.amount || 0));
    const uniqueId = `${company}-${id}-${rowIndex}`;

    let detailsHtml = '';
    if (t.lines && t.lines.length > 0) {
        detailsHtml = `
            <div class="details-grid">
                <div class="details-header"></div>
                <div class="details-header" style="text-align: right;">Debit</div>
                <div class="details-header" style="text-align: right;">Credit</div>
        `;
        
        t.lines.forEach(line => {
            const name = line.accountName || line.account || 'Account';
            const amt = Math.abs(Number(line.amount || 0));
            const isDebit = Number(line.amount || 0) < 0;
            
            detailsHtml += `
                <div class="details-cell">${name}</div>
                <div class="details-cell debit-val">${isDebit ? amt.toFixed(2) : ''}</div>
                <div class="details-cell credit-val">${!isDebit ? amt.toFixed(2) : ''}</div>
            `;
        });
        
        detailsHtml += '</div>';
    }

    return `
        <div class="transaction-card" 
             data-id="${id}"
             data-company="${company}"
             data-amount="${amount}"
             data-type="${type}">
            <div class="card-header" style="display: flex; gap: 8px; align-items: center;">
                <input type="checkbox" 
                       class="transaction-checkbox" 
                       data-tx-id="${id}" 
                       data-company="${company}" 
                       onchange="toggleTransactionSelection(this, '${id}')" 
                       style="flex-shrink: 0;">
                <div style="flex: 1;">
                    <span class="card-type">${type}: ${date}</span>
                </div>
                <span class="card-amount">$${amount.toFixed(2)}</span>
            </div>
            ${detailsHtml ? `
                <button class="expand-btn" onclick="toggleDetails(event, '${uniqueId}')">▼ Details</button>
                <div id="details-${uniqueId}" class="card-details">
                    ${detailsHtml}
                </div>
            ` : ''}
        </div>
    `;
}

function toggleDetails(event, id) {
    event.stopPropagation();
    $(`#details-${id}`).toggleClass('show');
}

function initializeDragDrop() {
   
    const reconciledData = JSON.parse(localStorage.getItem('reconciledTransactions') || '[]');
    const excludedCompany2 = JSON.parse(localStorage.getItem('excludedCompany2') || '[]').map(String);
    
    const reconciledIds = reconciledData.flatMap(r => 
        [String(r.company1Id), ...(r.company2Ids || []).map(String)]
    );

    const c2Available = toCompanyTransactions.filter(t => 
        !reconciledIds.includes(String(t.transactionId)) &&
        !excludedCompany2.includes(String(t.transactionId))
    );

    // Populate the 4th column with available C2 transactions
    const c2SourceContainer = $('#c2Source');
    c2SourceContainer.html(c2Available.map(t => createDraggableCard(t)).join(''));
    
    // Initialize source list for dragging (Available C2)
    new Sortable(document.getElementById('c2Source'), {
        group: { name: 'c2Transactions', pull: 'clone', put: false },
        animation: 150,
        sort: false,
        ghostClass: 'dragging'
    });

    
    $('#c2-container .match-row').each(function(index) {
        const rowIndex = parseInt($(this).attr('data-row'));
        new Sortable(this, {
            group: 'c2Transactions',
            animation: 150,
            ghostClass: 'dragging',
            onAdd: function(evt) {
                handleDrop(evt, rowIndex);
            }
        });
    });
    
    // Add hover effect to highlight connected rows
    addRowHighlighting();
}

function addRowHighlighting() {
    // When hovering over any element in a row, highlight all connected elements
    $('.match-row').on('mouseenter', function() {
        const rowIndex = $(this).data('row');
        $(`[data-row="${rowIndex}"]`).addClass('row-highlighted');
    }).on('mouseleave', function() {
        $('.match-row').removeClass('row-highlighted');
    });
}

function createDraggableCard(t) {
    const id = t.transactionId || Math.random().toString(36).substr(2, 9);
    const type = t.transactionType || 'Transaction';
    const date = t.date || 'N/A';
    const amount = Math.abs(Number(t.amount || 0));
    
    return `
        <div class="transaction-card" 
             data-id="${id}"
             data-company="c2-available"
             data-amount="${amount}"
             data-type="${type}">
            <div class="card-header" style="display: flex; gap: 8px; align-items: center;">
                <input type="checkbox" 
                       class="transaction-checkbox" 
                       data-tx-id="${id}" 
                       data-company="c2-available" 
                       onchange="toggleTransactionSelection(this, '${id}')" 
                       style="flex-shrink: 0;">
                <div style="flex: 1;">
                    <span class="card-type">${type}: ${date}</span>
                </div>
                <span style="font-weight: 700;">$${amount.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function handleDrop(evt, rowIndex) {
    const droppedId = evt.item.getAttribute('data-id');
    const droppedAmount = parseFloat(evt.item.getAttribute('data-amount'));
    const droppedType = evt.item.getAttribute('data-type');

    // Find the transaction in toCompanyTransactions
    const transaction = toCompanyTransactions.find(t => 
        String(t.transactionId) === String(droppedId)
    );

    if (transaction && matchRows[rowIndex] !== undefined) {
        // Avoid duplicates - check if already added
        const isDuplicate = matchRows[rowIndex].c2Transactions.some(t => 
            String(t.transactionId) === String(droppedId)
        );
        
        if (!isDuplicate) {
            matchRows[rowIndex].c2Transactions.push(transaction);
        }
        
        renderGrid();
        updateTotals(); // Update Credit total after dropping
    }
}

function reconcileAll() {
    const reconciledData = JSON.parse(localStorage.getItem('reconciledTransactions') || '[]');
    let reconciledCount = 0;
    let reconciledIndices = [];

    // Identify which rows will be reconciled
    matchRows.forEach((row, index) => {
        const c1Total = row.c1Transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
        const c2Total = row.c2Transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
        
        if (Math.abs(c1Total - c2Total) < 0.01 && c1Total > 0 && c2Total > 0) {
            reconciledData.push({
                company1Id: row.c1Transactions[0].transactionId,
                company2Ids: row.c2Transactions.map(t => t.transactionId),
                amount: c1Total,
                reconciledDate: new Date().toISOString()
            });
            reconciledCount++;
            reconciledIndices.push(index);
        }
    });

    if (reconciledCount > 0) {
      
        localStorage.setItem('reconciledTransactions', JSON.stringify(reconciledData));
        
       
        reconciledIndices.reverse().forEach(index => {
            matchRows.splice(index, 1);
        });
        
       
        renderGrid();
        
       
        alert(`✅ ${reconciledCount} transaction(s) reconciled successfully!`);
    } else {
        alert('⚠️ No balanced transactions to reconcile. Make sure amounts match.');
    }
}

function updateTotals() {
    // Live tracker: Start at 0,0
    // Only count rows where BOTH C1 and C2 have been matched (C2 dropped in Stack)
    // This way it tracks what's actually being reconciled in real-time
    let totalDebit = 0;
    let totalCredit = 0;
    
    matchRows.forEach(row => {
        // Only count if C2 has been dropped in this row's Stack column
        if (row.c2Transactions.length > 0) {
            // Count C1 amount for this row
            totalDebit += row.c1Transactions.reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);
            // Count C2 amount for this row
            totalCredit += row.c2Transactions.reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0);
        }
    });
    
    $('#totalDebit').text(totalDebit.toFixed(2));
    $('#totalCredit').text(totalCredit.toFixed(2));
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function toggleTransactionSelection(checkbox, transactionId) {
    const companyAttr = $(checkbox).data('company');
    
    if (checkbox.checked) {
        if (!selectedTransactions.includes(transactionId)) {
            selectedTransactions.push(transactionId);
            selectedTransactionColumns[transactionId] = companyAttr;
        }
    } else {
        selectedTransactions = selectedTransactions.filter(id => id !== transactionId);
        delete selectedTransactionColumns[transactionId];
    }
    updateExcludeButton();
}

function updateExcludeButton() {
    const excludeBtn = document.getElementById('excludeBtn');
    if (excludeBtn) {
        if (selectedTransactions.length > 0) {
            excludeBtn.style.display = 'inline-block';
            excludeBtn.textContent = `Exclude (${selectedTransactions.length})`;
        } else {
            excludeBtn.style.display = 'none';
        }
    }
}

function excludeTransactions() {
    if (selectedTransactions.length === 0) {
        alert('Please select transactions to exclude');
        return;
    }

    const excludedCompany1 = JSON.parse(localStorage.getItem('excludedCompany1') || '[]');
    const excludedCompany2 = JSON.parse(localStorage.getItem('excludedCompany2') || '[]');

    selectedTransactions.forEach(txId => {
        const selectedCompany = selectedTransactionColumns[txId];

        // c1 = Company 1, should go to excludedCompany1
        // c2 or c2-available = Company 2, should go to excludedCompany2
        if (selectedCompany === 'c1') {
            if (!excludedCompany1.includes(String(txId))) {
                excludedCompany1.push(String(txId));
            }
        } else if (selectedCompany === 'c2' || selectedCompany === 'c2-available') {
            if (!excludedCompany2.includes(String(txId))) {
                excludedCompany2.push(String(txId));
            }
        }
    });

    
    localStorage.setItem('excludedCompany1', JSON.stringify(excludedCompany1));
    localStorage.setItem('excludedCompany2', JSON.stringify(excludedCompany2));
    
    alert(`✅ ${selectedTransactions.length} transaction(s) excluded successfully!`);
    
  
    selectedTransactions = [];
    selectedTransactionColumns = {};
    $('input[type="checkbox"]').prop('checked', false);
    
   
    loadTransactions();
}
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
    const reconciledIds = reconciledData.flatMap(r => 
        [String(r.company1Id), ...(r.company2Ids || []).map(String)]
    );

    const c2Available = toCompanyTransactions.filter((t, i) => 
        !reconciledIds.includes(String(t.transactionId || i))
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
    const excludedCompany1 = JSON.parse(localStorage.getItem('excludedCompany1') || '[]');
    const excludedCompany2 = JSON.parse(localStorage.getItem('excludedCompany2') || '[]');
    
    const reconciledIds = reconciledData.flatMap(r => 
        [String(r.company1Id), ...(r.company2Ids || []).map(String)]
    );

    // Filter available transactions (exclude reconciled and excluded ones)
    const c1Available = fromCompanyTransactions.filter((t, i) => 
        !reconciledIds.includes(String(t.transactionId || i)) &&
        !excludedCompany1.includes(String(t.transactionId || i))
    );
    const c2Available = toCompanyTransactions.filter((t, i) => 
        !reconciledIds.includes(String(t.transactionId || i)) &&
        !excludedCompany2.includes(String(t.transactionId || i))
    );

    console.log('Available C1:', c1Available.length, 'C2:', c2Available.length);

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
        

        c1Html += `<div class="match-row" data-row="${index}" id="c1-row-${index}">
            ${row.c1Transactions.length === 0 
                ? '<div class="drop-zone">Drop here</div>'
                : row.c1Transactions.map(t => createTransactionCard(t, 'c1', index)).join('')
            }
        </div>`;
        
        
        matchingHtml += `<div style="display: flex; align-items: center; justify-content: center; background: #e3f2fd; border-radius: 8px; padding: 10px; min-height: 120px;">
            <div style="text-align: center; font-size: 36px; color: #2196f3;">${isMatched ? '✓' : '⇄'}</div>
        </div>`;
        
      
        c2Html += `<div class="match-row" data-row="${index}" id="c2-row-${index}">
            ${row.c2Transactions.length === 0 
                ? '<div class="drop-zone">Drop here</div>'
                : row.c2Transactions.map(t => createTransactionCard(t, 'c2', index)).join('')
            }
        </div>`;
    });
    
    c1Html += '</div>';
    matchingHtml += '</div>';
    c2Html += '</div>';
    
    grid.html(c1Html + matchingHtml + c2Html + c2AvailableHtml);

    initializeDragDrop();
}

function createMatchRow(row, rowIndex) {
    const c1Total = row.c1Transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
    const c2Total = row.c2Transactions.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
    const isMatched = Math.abs(c1Total - c2Total) < 0.01 && c1Total > 0 && c2Total > 0;

    return `
        <div class="match-row" data-row="${rowIndex}">
            <div class="column c1-column" id="c1-row-${rowIndex}">
                ${row.c1Transactions.length === 0 
                    ? '<div class="drop-zone">Drop here</div>'
                    : row.c1Transactions.map(t => createTransactionCard(t, 'c1', rowIndex)).join('')
                }
            </div>
            
            <div class="middle-column">
                <div class="match-indicator">${isMatched ? '✓' : '⇄'}</div>
            </div>
            
            <div class="column c2-column" id="c2-row-${rowIndex}">
                ${row.c2Transactions.length === 0 
                    ? '<div class="drop-zone">Drop here</div>'
                    : row.c2Transactions.map(t => createTransactionCard(t, 'c2', rowIndex)).join('')
                }
            </div>
        </div>
    `;
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
            const isDebit = company === 'c1';
            
            detailsHtml += `
                <div class="details-cell">${name}</div>
                <div class="details-cell debit-val">${isDebit ? amt.toFixed(0) : ''}</div>
                <div class="details-cell credit-val">${!isDebit ? amt.toFixed(0) : ''}</div>
            `;
        });
        
        detailsHtml += '</div>';
    }

    return `
        <div class="transaction-card" 
             data-id="${id}" 
             data-company="${company}"
             data-row="${rowIndex}"
             data-amount="${amount}"
             data-unique-id="${uniqueId}">
            <div class="card-header">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <input type="checkbox" class="transaction-checkbox" data-tx-id="${id}" onchange="toggleTransactionSelection(this, '${id}')">
                    <div>
                        <span class="card-type">${type}: ${date}</span>
                    </div>
                </div>
                <span class="card-amount">$${amount.toFixed(2)}</span>
            </div>
            ${detailsHtml ? `
                <button class="expand-btn" onclick="toggleDetails(event, '${uniqueId}')">
                    ▼ Details
                </button>
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
    const excludedTransactions = JSON.parse(localStorage.getItem('excludedTransactions') || '[]');
    
    const reconciledIds = reconciledData.flatMap(r => 
        [String(r.company1Id), ...(r.company2Ids || []).map(String)]
    );

    const c2Available = toCompanyTransactions.filter((t, i) => 
        !reconciledIds.includes(String(t.transactionId || i)) &&
        !excludedTransactions.includes(String(t.transactionId || i))
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
}

function createDraggableCard(t) {
    const id = t.transactionId || Math.random().toString(36).substr(2, 9);
    const type = t.transactionType || 'Transaction';
    const date = t.date || 'N/A';
    const amount = Math.abs(Number(t.amount || 0));
    
    return `
        <div class="transaction-card" 
             data-id="${id}"
             data-company="c2"
             data-amount="${amount}"
             data-type="${type}">
            <div class="card-header" style="display: flex; gap: 8px; align-items: center;">
                <input type="checkbox" class="transaction-checkbox" data-tx-id="${id}" data-company="c2" onchange="toggleTransactionSelection(this, '${id}')" style="flex-shrink: 0;">
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
        
       
        alert(`✅ ${reconciledCount} transaction(s) reconciled!`);
    } else {
        alert('No balanced transactions to reconcile');
    }
}

function updateTotals() {
    const c1Total = matchRows.reduce((sum, row) => 
        sum + row.c1Transactions.reduce((s, t) => s + Math.abs(Number(t.amount || 0)), 0), 0
    );
    $('#totalDebit').text(c1Total.toFixed(0));
    $('#totalCredit').text('0');
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function toggleTransactionSelection(checkbox, transactionId) {
    if (checkbox.checked) {
        if (!selectedTransactions.includes(transactionId)) {
            selectedTransactions.push(transactionId);
            
          
            const companyAttr = $(checkbox).data('company');
            const card = $(checkbox).closest('.transaction-card');
            const company = companyAttr || card.data('company');
            selectedTransactionColumns[transactionId] = company; 
        }
    } else {
        selectedTransactions = selectedTransactions.filter(id => id !== transactionId);
        delete selectedTransactionColumns[transactionId]; // Remove column info
    }
    updateExcludeButton();
}

function updateExcludeButton() {
    const excludeBtn = document.getElementById('excludeBtn');
    if (excludeBtn) {
        if (selectedTransactions.length > 0) {
            excludeBtn.style.display = 'inline-block';
            excludeBtn.textContent = `Exclude `;
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

        if (selectedCompany === 'c2') {
            if (!excludedCompany1.includes(String(txId))) {
                excludedCompany1.push(String(txId));
            }
        } else if (selectedCompany === 'c1') {
            if (!excludedCompany2.includes(String(txId))) {
                excludedCompany2.push(String(txId));
            }
        }
    });

    
    localStorage.setItem('excludedCompany1', JSON.stringify(excludedCompany1));
    localStorage.setItem('excludedCompany2', JSON.stringify(excludedCompany2));
    
    alert(`✅ ${selectedTransactions.length} transaction(s) excluded!`);
    
  
    selectedTransactions = [];
    selectedTransactionColumns = {};
    $('input[type="checkbox"]').prop('checked', false);
    
   
    loadTransactions();
}

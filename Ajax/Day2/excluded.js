$(document).ready(function () {
    const authToken = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');

    if (!authToken || !userEmail) {
        alert('Authentication required. Please login first.');
        window.location.href = 'login.html';
        return;
    }

    loadExcludedTransactions();
});


function loadExcludedTransactions() {
    try {
        $('#c1ExcludedList').empty();
        $('#c2ExcludedList').empty();

        const excludedCompany1Ids = JSON.parse(localStorage.getItem('excludedCompany1') || '[]').map(String);
        const excludedCompany2Ids = JSON.parse(localStorage.getItem('excludedCompany2') || '[]').map(String);
        const transactionsData = JSON.parse(localStorage.getItem('transactions') || '{}');

        const fromCompany = transactionsData.fromCompanyTransaction || [];
        const toCompany = transactionsData.toCompanyTransaction || [];

        const excludedCompany1Transactions = fromCompany
            .filter(t => excludedCompany1Ids.includes(String(t.transactionId || t.id)))
            .map(t => ({ ...t, source: 'Company 1' }));

        const excludedCompany2Transactions = toCompany
            .filter(t => excludedCompany2Ids.includes(String(t.transactionId || t.id)))
            .map(t => ({ ...t, source: 'Company 2' }));

        if (!excludedCompany1Transactions.length && !excludedCompany2Transactions.length) {
            displayEmptyState();
            updateStats(0);
            return;
        }

        displayExcludedTransactions(excludedCompany1Transactions, excludedCompany2Transactions);
        updateStats(excludedCompany1Ids.length + excludedCompany2Ids.length);

    } catch (error) {
        console.error(error);
        displayEmptyState();
    }
}


function displayEmptyState() {
    $('#c1ExcludedList').html(emptyHtml('Company 1'));
    $('#c2ExcludedList').html(emptyHtml('Available C2'));
}

function emptyHtml(label) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">📪</div>
            <h3>No Excluded</h3>
            <p>Transactions from ${label}</p>
        </div>
    `;
}



function displayExcludedTransactions(c1, c2) {
    const c1Container = $('#c1ExcludedList');
    const c2Container = $('#c2ExcludedList');

    c1.length ? c1.forEach(t => c1Container.append(createExcludedTransactionCard(t))) : c1Container.html(emptyHtml('Company 1'));
    c2.length ? c2.forEach(t => c2Container.append(createExcludedTransactionCard(t))) : c2Container.html(emptyHtml('Available C2'));
}


function createExcludedTransactionCard(transaction) {
    const txId = String(transaction.transactionId || transaction.id);
    const amount = Number(transaction.amount || 0).toFixed(2);
    const date = transaction.date || new Date().toLocaleDateString();
    const type = transaction.transactionType || 'Transaction';
    const source = transaction.source;
    const referenceNo = transaction.referenceNo || 'N/A';
    const btnColor = source === 'Company 1' ? '#10b981' : '#3b82f6';

    let detailsHtml = '';

    if (transaction.lines?.length) {
        detailsHtml = `
            <div class="details-grid">
                <div class="details-header">Account</div>
                <div class="details-header" style="text-align:right;">Amount</div>
                ${transaction.lines.map(l => `
                    <div class="details-cell">${l.accountName || l.account}</div>
                    <div class="details-cell" style="text-align:right;">${Math.abs(Number(l.amount || 0)).toFixed(2)}</div>
                `).join('')}
            </div>
        `;
    }

    return `
        <div class="excluded-item" data-tx-id="${txId}">
            <input type="checkbox" class="excluded-item-checkbox"
                data-tx-id="${txId}" onchange="toggleExcludedSelection(this)">
            <div class="excluded-item-content">
                <div class="excluded-item-header">
                    <span class="card-type">${type}: ${date}</span>
                    <span class="excluded-item-amount">$${amount}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Reference:</span> ${referenceNo}
                </div>
                ${detailsHtml ? `
                    <button class="expand-details-btn"
                        onclick="toggleExcludedDetails(event,'${txId}')"
                        style="background:${btnColor};color:#fff;width:100%;margin-top:8px;">
                        ▼ Details
                    </button>
                    <div id="details-${txId}" class="excluded-details" style="display:none;">
                        ${detailsHtml}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}


function toggleExcludedDetails(e, txId) {
    e.stopPropagation();
    $(`#details-${txId}`).slideToggle();
}



let selectedExcludedTransactions = [];
let selectedCompany1Transactions = [];
let selectedCompany2Transactions = [];

function toggleExcludedSelection(cb) {
    const txId = String($(cb).data('tx-id'));
    const excludedItem = $(cb).closest('.excluded-item');
    const container = excludedItem.closest('.excluded-list');
    const isCompany1 = container.attr('id') === 'c1ExcludedList';

    if (cb.checked) {
        if (!selectedExcludedTransactions.includes(txId)) {
            selectedExcludedTransactions.push(txId);
        }
        if (isCompany1) {
            if (!selectedCompany1Transactions.includes(txId)) {
                selectedCompany1Transactions.push(txId);
            }
        } else {
            if (!selectedCompany2Transactions.includes(txId)) {
                selectedCompany2Transactions.push(txId);
            }
        }
    } else {
        selectedExcludedTransactions = selectedExcludedTransactions.filter(i => i !== txId);
        selectedCompany1Transactions = selectedCompany1Transactions.filter(i => i !== txId);
        selectedCompany2Transactions = selectedCompany2Transactions.filter(i => i !== txId);
    }

    updateIncludeButtons();
}



function updateIncludeButtons() {
    $('#c1IncludeBtn').toggle(selectedCompany1Transactions.length)
        .text(`Include (${selectedCompany1Transactions.length})`);

    $('#c2IncludeBtn').toggle(selectedCompany2Transactions.length)
        .text(`Include (${selectedCompany2Transactions.length})`);
}



function includeFromCompany1() {
    includeTransactionsGeneric('excludedCompany1', selectedCompany1Transactions, '#c1ExcludedList');
}

function includeFromCompany2() {
    includeTransactionsGeneric('excludedCompany2', selectedCompany2Transactions, '#c2ExcludedList');
}

function includeTransactionsGeneric(storageKey, selectedIds, container) {
    if (!selectedIds.length) return alert('Please select transactions');

    try {
        let excluded = JSON.parse(localStorage.getItem(storageKey) || '[]').map(String);
        excluded = excluded.filter(id => !selectedIds.includes(String(id)));
        localStorage.setItem(storageKey, JSON.stringify(excluded));

   
        selectedIds.forEach(id => {
            $(container).find(`[data-tx-id="${id}"]`).fadeOut(300, function() {
                $(this).remove();
            });
        });

        selectedExcludedTransactions = selectedExcludedTransactions.filter(id => !selectedIds.includes(id));
        selectedCompany1Transactions = selectedCompany1Transactions.filter(id => !selectedIds.includes(id));
        selectedCompany2Transactions = selectedCompany2Transactions.filter(id => !selectedIds.includes(id));

        updateIncludeButtons();
        setTimeout(() => loadExcludedTransactions(), 300);

        alert(`✅ ${selectedIds.length} transaction(s) included successfully!`);
    } catch (error) {
        console.error('Error including transactions:', error);
        alert('Error including transactions. Please try again.');
    }
}


function updateStats(count) {
    $('#totalExcluded').text(count);
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function viewReconciled() {
    window.location.href = 'reconciled.html';
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

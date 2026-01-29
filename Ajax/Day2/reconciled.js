let allTransactions = [];
let reconciledData = [];
let selectedItems = [];

$(document).ready(function() {
    // Check authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Load transactions and reconciled data
    loadData();
});

function loadData() {
    // Load reconciled data directly from localStorage
    reconciledData = JSON.parse(localStorage.getItem('reconciledTransactions') || '[]');
    
    displayReconciledTransactions();
    updateStats();
}

function displayReconciledTransactions() {
    const container = $('#reconciledList');

    // Get reconciled data directly from localStorage
    reconciledData = JSON.parse(localStorage.getItem('reconciledTransactions') || '[]');

    if (reconciledData.length === 0) {
        container.html(`
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No Reconciled Transactions Yet</h3>
                <p>Reconciled transaction pairs will appear here</p>
                <button class="empty-state-btn" onclick="goToDashboard()">Go to Dashboard</button>
            </div>
        `);
        return;
    }

    let html = '';
    reconciledData.forEach((reconciled, index) => {
        html += createReconciledCard(reconciled, index);
    });

    container.html(html);
}

function createReconciledCard(reconciled, index) {
    const reconciledDate = new Date(reconciled.reconciledDate);
    const formattedDate = reconciledDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const amount = parseFloat(reconciled.amount || 0).toFixed(2);
    const company1Id = reconciled.company1Id;
    const company2Ids = (reconciled.company2Ids || []);

    return `
        <div class="reconciled-item" data-index="${index}">
            <div class="reconciled-header">
                <div>
                    <span class="reconciled-badge">✓ RECONCILED</span>
                    <div style="margin-top: 8px; font-size: 12px; color: #666;">Record #${index + 1}</div>
                </div>
            </div>
            
            <div class="reconciled-info">
                <div class="transaction-card">
                    <div class="card-title">Company 1 Details</div>
                    <div class="card-content">
                        <div class="detail-row">
                            <span class="detail-label">Transaction ID:</span>
                            <span class="detail-value">${company1Id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value" style="color: #10b981; font-weight: 700;">Reconciled</span>
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <div class="transaction-card">
                    <div class="card-title">Company 2 Details</div>
                    <div class="card-content">
                        <div class="detail-row">
                            <span class="detail-label">Transaction Count:</span>
                            <span class="detail-value">${company2Ids.length}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Transaction ID(s):</span>
                            <span class="detail-value">${company2Ids.join(', ')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Match Status:</span>
                            <span class="detail-value" style="color: #10b981; font-weight: 700;">Matched</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="reconciled-meta">
                <div style="flex: 1;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Reconciliation Amount</div>
                    <div class="amount-value">$${amount}</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Reconciliation Date & Time</div>
                    <div style="font-weight: 600; color: #333;">${formattedDate}</div>
                </div>
                <div style="flex: 1;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Reference ID</div>
                    <div style="font-weight: 600; color: #667eea;">REC-${index + 1}</div>
                </div>
            </div>
        </div>
    `;
}

function toggleSelection(index) {
    const item = $(`.reconciled-item[data-index="${index}"]`);
    const checkbox = item.find('.reconciled-checkbox');

    if (checkbox.prop('checked')) {
        item.addClass('selected');
        selectedItems.push(index);
    } else {
        item.removeClass('selected');
        selectedItems = selectedItems.filter(i => i !== index);
    }

    // Show/hide unreconcile button
    if (selectedItems.length > 0) {
        $('#unreconcileBtn').show();
    } else {
        $('#unreconcileBtn').hide();
    }

    // Update selected count
    $('#selectedCount').text(selectedItems.length);
}



function updateStats() {
    $('#totalReconciled').text(reconciledData.length);
    
    const totalAmount = reconciledData.reduce((sum, item) => sum + item.amount, 0);
    $('#totalAmount').text('$' + totalAmount.toFixed(2));
    
    $('#selectedCount').text(selectedItems.length);
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

function goToExcluded() {
    window.location.href = 'excluded.html';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}
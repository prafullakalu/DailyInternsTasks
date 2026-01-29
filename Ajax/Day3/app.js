// ========================================
// GLOBAL VARIABLES & STATE
// ========================================
const AppState = {
    masterData: [],
    destinationData: [],
    currentCategory: 'Assets',
    mappings: {}, // Structure: { category: { sourceAccountCode: { mostLikely, likely, possible } } }
    hasUnsavedChanges: false,
    destinationFilter: 'All',
    searchQuery: '',
    destinationScrollPosition: 0
};
// Category mapping - now correctly mapped to Excel Type values
const CATEGORY_MAPPINGS = {
    'Assets': ['Assets'],
    'Liability': ['Liabilities'],
    'Equity/Capital': ['Equity'],
    'Revenue': ['Revenue'],
    'CoGS': ['COGS'],
    'G&A Expenses': ['Expense'],
    'Other Revenue & Expense': ['Other Rev & Exp']
};
// Destination category tabs configuration
const DESTINATION_CATEGORIES = [
    'All',
    'Assets',
    'Liability',
    'Equity/Capital',
    'Revenue',
    'Product Costs',
    'Labor Expense',
    'Outside Professional Services',
    'G&A Expenses',
    'Other'
];
let destinationCategoryIndex = 0;
// ========================================
// INITIALIZATION
// ========================================
$(document).ready(function() {
    console.log('Initializing Chart of Accounts Standardizer...');
   
    // Load saved mappings from localStorage
    loadMappingsFromLocalStorage();
   
    // Load Excel files automatically
    loadExcelFiles();
   
    // Initialize event listeners
    initializeEventListeners();
   
    // Update last updated date
    updateLastUpdatedDate();
   
    // Warn on page leave if unsaved changes
    setupBeforeUnloadWarning();
});
// ========================================
// EXCEL FILE LOADING
// ========================================
async function loadExcelFiles() {
    try {
        console.log('Loading Excel files...');
       
        // Load both files in parallel
        const [masterData, destData] = await Promise.all([
            loadExcelFile('./Master Chart of account.xlsx'),
            loadExcelFile('./destination chart of account.xlsx')
        ]);
       
        AppState.masterData = processMasterData(masterData);
        AppState.destinationData = processDestinationData(destData);
       
        console.log('Master data loaded:', AppState.masterData.length, 'records');
        console.log('Destination data loaded:', AppState.destinationData.length, 'records');
       
        // Render the initial view
        renderCurrentCategory();
       
    } catch (error) {
        console.error('Error loading Excel files:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error Loading Files',
            text: 'Could not load the Excel files. Please check the console for details.',
            confirmButtonColor: '#28a745'
        });
    }
}
async function loadExcelFile(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
   
    const worksheet = workbook.worksheets[0];
    const data = [];
   
    // Get headers from first row
    const headers = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value;
    });
   
    // Process data rows
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                rowData[header] = cell.value;
            });
            data.push(rowData);
        }
    });
   
    return data;
}
function processMasterData(data) {
    // Filter out:
    // 1. Rows without account numbers (these are headers/section titles)
    // 2. Rows where Number is not a number
    return data.filter(row => {
        return row.Number && typeof row.Number === 'number' && row.Number > 0;
    });
}
function processDestinationData(data) {
    // Map the destination data to match expected structure
    return data.map(row => ({
        AccountCode: row.AccountCode,
        AccountName: row.AccountName,
        AccountTypeName: row.AccountTypeName,
        SubAccountName: row.SubAccountName,
        Group: row.AccountTypeName // Use AccountTypeName as Group
    })).filter(row => row.AccountCode); // Filter out any without account code
}
// ========================================
// EVENT LISTENERS
// ========================================
function initializeEventListeners() {
    // Main menu tab changes
    $('#mainMenuTabs button').on('click', function() {
        const category = $(this).data('category');
        if (AppState.currentCategory !== category) {
            AppState.currentCategory = category;
            // Sync destination filter with main category
            syncDestinationFilter(category);
            renderCurrentCategory();
        }
    });
   
    // Destination category navigation
    $(document).on('click', '#destCategoryPrev', function() {
        if (destinationCategoryIndex > 0) {
            destinationCategoryIndex--;
            updateDestinationCategoryDisplay();
            renderDestinationAccounts();
        }
    });
   
    $(document).on('click', '#destCategoryNext', function() {
        if (destinationCategoryIndex < DESTINATION_CATEGORIES.length - 5) {
            destinationCategoryIndex++;
            updateDestinationCategoryDisplay();
            renderDestinationAccounts();
        }
    });
   
    // Destination category tabs
    $(document).on('click', '#destinationTabs button', function() {
        const destCategory = $(this).data('dest-category');
        AppState.destinationFilter = destCategory;
        $(this).addClass('active').siblings().removeClass('active');
        renderDestinationAccounts();
    });
   
    // Destination search
    $('#destinationSearch').on('input', function() {
        AppState.searchQuery = $(this).val().toLowerCase();
        renderDestinationAccounts();
    });
   
    // Submit button
    $('#submitBtn').on('click', handleSubmit);
}
function syncDestinationFilter(category) {
    if (category === 'CoGS') {
        AppState.destinationFilter = 'Product Costs';
    } else if (category === 'Other Revenue & Expense') {
        AppState.destinationFilter = 'Other';
    } else {
        AppState.destinationFilter = category;
    }
    // Update tab index if needed
    destinationCategoryIndex = Math.max(0, DESTINATION_CATEGORIES.indexOf(AppState.destinationFilter) - 2);
    updateDestinationCategoryDisplay();
}
function updateDestinationCategoryDisplay() {
    const visibleCategories = DESTINATION_CATEGORIES.slice(destinationCategoryIndex, destinationCategoryIndex + 5);
    const container = $('#destinationTabs');
   
    let html = '';
    visibleCategories.forEach(category => {
        const isActive = category === AppState.destinationFilter ? 'active' : '';
        html += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${isActive}" data-dest-category="${category}" type="button">
                    ${category}
                </button>
            </li>
        `;
    });
   
    container.html(html);
   
    // Update arrow button states
    $('#destCategoryPrev').prop('disabled', destinationCategoryIndex === 0);
    $('#destCategoryNext').prop('disabled', destinationCategoryIndex >= DESTINATION_CATEGORIES.length - 5);
}
// ========================================
// RENDERING FUNCTIONS
// ========================================
function renderCurrentCategory() {
    console.log('Rendering category:', AppState.currentCategory);
   
    // Render all three sections
    renderSourceAccounts();
    renderMappingArea();
    renderDestinationAccounts();
}
function renderSourceAccounts() {
    const container = $('#sourceAccountsList');
    container.empty();
   
    // Filter master data by current category
    const filteredData = getSourceAccountsByCategory(AppState.currentCategory);
   
    if (filteredData.length === 0) {
        container.html(`
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No accounts found for this category</p>
            </div>
        `);
        return;
    }
   
    // Add main category header
    container.append(`
        <div class="account-category-header main-header">
            ${AppState.currentCategory}
        </div>
    `);
   
    // Group by Sub-Group
    const grouped = {};
    filteredData.forEach(account => {
        const subGroup = account['Sub-Group'] || 'Other';
        if (!grouped[subGroup]) {
            grouped[subGroup] = [];
        }
        grouped[subGroup].push(account);
    });
   
    // Render groups
    Object.keys(grouped).forEach(subGroupName => {
        const accounts = grouped[subGroupName];
       
        // Add sub-group header
        container.append(`
            <div class="destination-category-header">
                ${subGroupName}
            </div>
        `);
       
        // Add accounts
        accounts.forEach(account => {
            const isMapped = isSourceAccountMapped(account.Number);
            const mappedIcon = isMapped ? 'fa-check-circle text-success' : 'fa-circle text-muted';
           
            container.append(`
                <div class="account-item" data-account-code="${account.Number}">
                    <div class="d-flex align-items-center flex-grow-1">
                        <span class="account-code">${account.Number}</span>
                        <span class="account-name">${account.Name}</span>
                    </div>
                    <div class="account-icons">
                        <i class="fas ${mappedIcon}" title="${isMapped ? 'Mapped' : 'Not Mapped'}"></i>
                        <i class="fas fa-info-circle" title="Info"></i>
                    </div>
                </div>
            `);
        });
    });
}
function getSourceAccountsByCategory(category) {
    const masterData = AppState.masterData;
    const typeMapping = CATEGORY_MAPPINGS[category];
   
    if (!typeMapping) {
        console.warn('No mapping found for category:', category);
        return [];
    }
   
    // Filter by Type field matching the mapping
    const filtered = masterData.filter(account => {
        return typeMapping.includes(account.Type);
    });
   
    console.log(`Category ${category}: Found ${filtered.length} accounts`);
    return filtered;
}
function isSourceAccountMapped(sourceCode) {
    const mapping = getMappingForAccount(sourceCode);
    return mapping.mostLikely || mapping.likely || mapping.possible;
}
function renderMappingArea() {
    const container = $('#mappingArea');
    container.empty();
   
    // Filter master data by current category
    const filteredData = getSourceAccountsByCategory(AppState.currentCategory);
   
    if (filteredData.length === 0) {
        container.html(`
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No mapping available</p>
            </div>
        `);
        return;
    }
   
    // Render mapping row for each account
    filteredData.forEach(account => {
        const sourceCode = account.Number;
        const savedMapping = getMappingForAccount(sourceCode);
       
        const row = $(`
            <div class="mapping-row" data-source-code="${sourceCode}">
                <div class="mapping-columns">
                    <div class="mapping-column most-likely" data-zone="mostLikely">
                        <span class="column-header">Most Likely</span>
                        <div class="drop-zone" data-source-code="${sourceCode}" data-zone="mostLikely">
                            ${savedMapping.mostLikely ? createMappedAccountHTML(savedMapping.mostLikely, sourceCode, 'mostLikely', 94) : ''}
                        </div>
                    </div>
                    <div class="mapping-column likely" data-zone="likely">
                        <span class="column-header">Likely</span>
                        <div class="drop-zone" data-source-code="${sourceCode}" data-zone="likely">
                            ${savedMapping.likely ? createMappedAccountHTML(savedMapping.likely, sourceCode, 'likely', 85) : ''}
                        </div>
                    </div>
                    <div class="mapping-column possible" data-zone="possible">
                        <span class="column-header">Possible</span>
                        <div class="drop-zone" data-source-code="${sourceCode}" data-zone="possible">
                            ${savedMapping.possible ? createMappedAccountHTML(savedMapping.possible, sourceCode, 'possible', 60) : ''}
                        </div>
                    </div>
                </div>
            </div>
        `);
       
        container.append(row);
    });
   
    // Initialize drag and drop
    initializeDragAndDrop();
}
function createMappedAccountHTML(account, sourceCode, zone, probability) {
    const probabilityClass = probability >= 85 ? 'high' : probability >= 70 ? 'medium' : 'low';
   
    return `
        <div class="mapped-account" draggable="true"
             data-source-code="${sourceCode}"
             data-zone="${zone}"
             data-account-code="${account.AccountCode}">
            <div class="mapped-account-info">
                <span class="mapped-account-code">${account.AccountCode}</span>
                <span class="mapped-account-name">${account.AccountName}</span>
            </div>
            <div class="probability-badge ${probabilityClass}">${probability}</div>
        </div>
    `;
}
function renderDestinationAccounts() {
    const container = $('#destinationAccountsList');
    container.empty();

    let filteredData = AppState.destinationData;

    // ── Category filter ────────────────────────────────────────
    if (AppState.destinationFilter !== 'All') {
        filteredData = filteredData.filter(acc => {
            const filter = AppState.destinationFilter;
            if (filter === 'Assets')               return acc.AccountTypeName === 'ASSETS';
            if (filter === 'Liability')            return acc.AccountTypeName === 'LIABILITIES';
            if (filter === 'Equity/Capital')       return acc.AccountTypeName === 'EQUITY/CAPITAL';
            if (filter === 'Revenue')              return acc.AccountTypeName === 'Professional Services Revenue' || acc.AccountTypeName === 'Product Revenue';
            if (filter === 'Product Costs')        return acc.AccountTypeName === 'Product Costs';
            if (filter === 'Labor Expense')        return acc.AccountTypeName === 'Labor Expense';
            if (filter === 'Outside Professional Services')
                return acc.AccountTypeName === 'Outside (or "1099") Professional Services Costs';
            if (filter === 'G&A Expenses') {
                return acc.AccountTypeName && ![
                    'ASSETS','LIABILITIES','EQUITY/CAPITAL',
                    'Professional Services Revenue','Product Revenue','Product Costs','Labor Expense',
                    'Outside (or "1099") Professional Services Costs'
                ].includes(acc.AccountTypeName);
            }
            if (filter === 'Other') {
                return !acc.AccountTypeName || acc.AccountTypeName.includes('Other');
            }
            return true;
        });
    }

    // ── Search filter ──────────────────────────────────────────
    if (AppState.searchQuery) {
        const q = AppState.searchQuery.toLowerCase();
        filteredData = filteredData.filter(acc => {
            return (
                (acc.AccountCode + '').toLowerCase().includes(q) ||
                (acc.AccountName || '').toLowerCase().includes(q) ||
                (acc.AccountTypeName || '').toLowerCase().includes(q) ||
                (acc.SubAccountName || '').toLowerCase().includes(q)
            );
        });
    }

    if (filteredData.length === 0) {
        container.html(`
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No accounts found</p>
            </div>
        `);
        return;
    }

    // ── Group: AccountType → SubAccount → items ────────────────
    const typeGroups = {};
    filteredData.forEach(acc => {
        const type  = acc.AccountTypeName || 'Uncategorized';
        const sub   = acc.SubAccountName   || 'General Accounts';
        typeGroups[type] = typeGroups[type] || {};
        typeGroups[type][sub] = typeGroups[type][sub] || [];
        typeGroups[type][sub].push(acc);
    });

    // Render
    Object.keys(typeGroups).sort().forEach(typeName => {
        container.append(`
            <div class="account-category-header">
                ${typeName}
            </div>
        `);

        Object.keys(typeGroups[typeName]).sort().forEach(subName => {
            const accounts = typeGroups[typeName][subName];

            container.append(`
                <div class="destination-category-header">
                    ${subName}
                </div>
            `);

            accounts.forEach(acc => {
                const isMapped = isAccountMapped(acc.AccountCode);
                const cls = isMapped ? 'mapped' : '';

                container.append(`
                    <div class="destination-account-item ${cls}"
                         draggable="${!isMapped}"
                         data-account-code="${acc.AccountCode}"
                         data-account-name="${(acc.AccountName||'').replace(/"/g,'&quot;')}">
                        <div class="d-flex align-items-center flex-grow-1">
                            <span class="destination-account-code">${acc.AccountCode}</span>
                            <span class="destination-account-name text-truncate">${acc.AccountName || ''}</span>
                        </div>
                        ${isMapped ? '<i class="fas fa-check-circle text-success"></i>' : ''}
                    </div>
                `);
            });
        });
    });
}
// ========================================
// DRAG AND DROP
// ========================================
function initializeDragAndDrop() {
    // Make destination accounts draggable
    $('.destination-account-item:not(.mapped)').attr('draggable', true);
   
    // Drag start from destination
    $(document).off('dragstart', '.destination-account-item');
    $(document).on('dragstart', '.destination-account-item:not(.mapped)', function(e) {
        const accountCode = $(this).data('account-code');
        const accountName = $(this).data('account-name');
       
        e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({
            source: 'destination',
            accountCode: accountCode,
            accountName: accountName
        }));
       
        $(this).addClass('dragging');
    });
   
    // Drag start from mapped accounts (for moving/undoing)
    $(document).off('dragstart', '.mapped-account');
    $(document).on('dragstart', '.mapped-account', function(e) {
        const sourceCode = $(this).data('source-code');
        const zone = $(this).data('zone');
        const accountCode = $(this).data('account-code');
       
        e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({
            source: 'mapped',
            sourceCode: sourceCode,
            zone: zone,
            accountCode: accountCode
        }));
       
        $(this).addClass('dragging');
    });
   
    // Drag end
    $(document).off('dragend', '.destination-account-item, .mapped-account');
    $(document).on('dragend', '.destination-account-item, .mapped-account', function(e) {
        $(this).removeClass('dragging');
        $('.drop-zone').removeClass('drag-over');
    });
   
    // Drop zone events
    $(document).off('dragover', '.drop-zone');
    $(document).on('dragover', '.drop-zone', function(e) {
        e.preventDefault();
        $(this).addClass('drag-over');
    });
   
    $(document).off('dragleave', '.drop-zone');
    $(document).on('dragleave', '.drop-zone', function(e) {
        $(this).removeClass('drag-over');
    });
   
    $(document).off('drop', '.drop-zone');
    $(document).on('drop', '.drop-zone', function(e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
       
        const dataStr = e.originalEvent.dataTransfer.getData('text/plain');
        const data = JSON.parse(dataStr);
       
        const targetSourceCode = $(this).data('source-code');
        const targetZone = $(this).data('zone');
       
        if (data.source === 'destination') {
            // Dropping from destination list
            handleDropFromDestination(data, targetSourceCode, targetZone);
        } else if (data.source === 'mapped') {
            // Moving between zones or undoing
            if (data.sourceCode === targetSourceCode) {
                // Moving within same source account
                handleMoveWithinSource(data, targetSourceCode, targetZone);
            } else {
                // Moving to different source account
                handleDropFromMapped(data, targetSourceCode, targetZone);
            }
        }
       
        // Mark as unsaved
        AppState.hasUnsavedChanges = true;
       
        // Re-render
        renderCurrentCategory();
    });
   
    // Allow dropping on destination list to remove (undo)
    $(document).off('dragover', '#destinationAccountsList');
    $(document).on('dragover', '#destinationAccountsList', function(e) {
        e.preventDefault();
        $(this).addClass('drag-over-remove');
    });
   
    $(document).off('dragleave', '#destinationAccountsList');
    $(document).on('dragleave', '#destinationAccountsList', function(e) {
        $(this).removeClass('drag-over-remove');
    });
   
    $(document).off('drop', '#destinationAccountsList');
    $(document).on('drop', '#destinationAccountsList', function(e) {
        e.preventDefault();
        $(this).removeClass('drag-over-remove');
       
        const dataStr = e.originalEvent.dataTransfer.getData('text/plain');
        const data = JSON.parse(dataStr);
       
        if (data.source === 'mapped') {
            // Remove mapping (undo)
            handleUndo(data);
            AppState.hasUnsavedChanges = true;
            renderCurrentCategory();
        }
    });
}
function handleDropFromDestination(data, targetSourceCode, targetZone) {
    const destAccount = AppState.destinationData.find(acc => acc.AccountCode == data.accountCode);
    if (!destAccount) return;
   
    const currentMapping = getMappingForAccount(targetSourceCode);
   
    // Implement cascade logic
    if (targetZone === 'mostLikely') {
        // Cascade: mostLikely -> likely -> possible -> removed
        if (currentMapping.mostLikely) {
            if (currentMapping.likely) {
                if (currentMapping.possible) {
                    // Remove possible (it goes back to destination)
                    currentMapping.possible = null;
                }
                currentMapping.possible = currentMapping.likely;
            }
            currentMapping.likely = currentMapping.mostLikely;
        }
        currentMapping.mostLikely = destAccount;
    } else if (targetZone === 'likely') {
        // Cascade: likely -> possible -> removed
        if (currentMapping.likely) {
            if (currentMapping.possible) {
                currentMapping.possible = null;
            }
            currentMapping.possible = currentMapping.likely;
        }
        currentMapping.likely = destAccount;
    } else if (targetZone === 'possible') {
        // Replace possible
        currentMapping.possible = destAccount;
    }
   
    // Save mapping
    saveMappingForAccount(targetSourceCode, currentMapping);
}
function handleMoveWithinSource(data, targetSourceCode, targetZone) {
    const currentMapping = getMappingForAccount(targetSourceCode);
    const movedAccount = currentMapping[data.zone];
   
    if (!movedAccount) return;
   
    // Remove from old zone
    currentMapping[data.zone] = null;
   
    // Add to new zone with cascade
    if (targetZone === 'mostLikely') {
        if (currentMapping.mostLikely) {
            if (currentMapping.likely) {
                if (currentMapping.possible) {
                    currentMapping.possible = null;
                }
                currentMapping.possible = currentMapping.likely;
            }
            currentMapping.likely = currentMapping.mostLikely;
        }
        currentMapping.mostLikely = movedAccount;
    } else if (targetZone === 'likely') {
        if (currentMapping.likely) {
            if (currentMapping.possible) {
                currentMapping.possible = null;
            }
            currentMapping.possible = currentMapping.likely;
        }
        currentMapping.likely = movedAccount;
    } else if (targetZone === 'possible') {
        currentMapping.possible = movedAccount;
    }
   
    saveMappingForAccount(targetSourceCode, currentMapping);
}
function handleDropFromMapped(data, targetSourceCode, targetZone) {
    // Remove from source location
    const sourceMapping = getMappingForAccount(data.sourceCode);
    const movedAccount = sourceMapping[data.zone];
    sourceMapping[data.zone] = null;
    saveMappingForAccount(data.sourceCode, sourceMapping);
   
    // Add to target location (with cascade)
    const destAccount = AppState.destinationData.find(acc => acc.AccountCode == data.accountCode);
    if (destAccount) {
        handleDropFromDestination({
            accountCode: data.accountCode,
            accountName: destAccount.AccountName
        }, targetSourceCode, targetZone);
    }
}
function handleUndo(data) {
    // Remove mapping when dragged back to destination
    const sourceMapping = getMappingForAccount(data.sourceCode);
    sourceMapping[data.zone] = null;
    saveMappingForAccount(data.sourceCode, sourceMapping);
   
    Swal.fire({
        icon: 'info',
        title: 'Mapping Removed',
        text: 'The account has been returned to the destination list.',
        timer: 1500,
        showConfirmButton: false
    });
}
// ========================================
// MAPPING MANAGEMENT
// ========================================
function getMappingForAccount(sourceCode) {
    if (!AppState.mappings[AppState.currentCategory]) {
        AppState.mappings[AppState.currentCategory] = {};
    }
   
    if (!AppState.mappings[AppState.currentCategory][sourceCode]) {
        AppState.mappings[AppState.currentCategory][sourceCode] = {
            mostLikely: null,
            likely: null,
            possible: null
        };
    }
   
    return AppState.mappings[AppState.currentCategory][sourceCode];
}
function saveMappingForAccount(sourceCode, mapping) {
    if (!AppState.mappings[AppState.currentCategory]) {
        AppState.mappings[AppState.currentCategory] = {};
    }
   
    AppState.mappings[AppState.currentCategory][sourceCode] = mapping;
    saveMappingsToLocalStorage();
}
function isAccountMapped(destAccountCode) {
    const categoryMappings = AppState.mappings[AppState.currentCategory];
    if (!categoryMappings) return false;
   
    for (const sourceCode in categoryMappings) {
        const mapping = categoryMappings[sourceCode];
        if (mapping.mostLikely?.AccountCode == destAccountCode ||
            mapping.likely?.AccountCode == destAccountCode ||
            mapping.possible?.AccountCode == destAccountCode) {
            return true;
        }
    }
   
    return false;
}
// ========================================
// LOCAL STORAGE
// ========================================
function loadMappingsFromLocalStorage() {
    try {
        const saved = localStorage.getItem('coaMappings');
        if (saved) {
            AppState.mappings = JSON.parse(saved);
            console.log('Loaded mappings from localStorage:', AppState.mappings);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}
function saveMappingsToLocalStorage() {
    try {
        localStorage.setItem('coaMappings', JSON.stringify(AppState.mappings));
        console.log('Saved mappings to localStorage');
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}
// ========================================
// SUBMIT HANDLER
// ========================================
function handleSubmit() {
    // Count total mappings
    let totalMappings = 0;
    Object.values(AppState.mappings).forEach(categoryMappings => {
        Object.values(categoryMappings).forEach(mapping => {
            if (mapping.mostLikely) totalMappings++;
            if (mapping.likely) totalMappings++;
            if (mapping.possible) totalMappings++;
        });
    });
   
    Swal.fire({
        title: 'Save Mappings?',
        html: `
            <p>You have <strong>${totalMappings}</strong> mappings across all categories.</p>
            <p>This will save all your work to local storage.</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Save',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            const success = saveMappingsToLocalStorage();
           
            if (success) {
                AppState.hasUnsavedChanges = false;
                updateLastUpdatedDate();
               
                Swal.fire({
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Your mappings have been saved successfully.',
                    confirmButtonColor: '#28a745',
                    timer: 2000
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save mappings. Please try again.',
                    confirmButtonColor: '#28a745'
                });
            }
        }
    });
}
// ========================================
// UTILITY FUNCTIONS
// ========================================
function updateLastUpdatedDate() {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    $('#lastUpdatedDate').text(formatted);
}
function setupBeforeUnloadWarning() {
    $(window).on('beforeunload', function(e) {
        if (AppState.hasUnsavedChanges) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    });
}
// ========================================
// EXPORT FUNCTIONALITY (OPTIONAL)
// ========================================
function exportMappingsToJSON() {
    const dataStr = JSON.stringify(AppState.mappings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
   
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'coa_mappings_export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
// Add export button functionality if needed
if ($('#exportBtn').length) {
    $('#exportBtn').on('click', exportMappingsToJSON);
}
// ========================================
// CONSOLE HELPERS FOR DEBUGGING
// ========================================
window.AppState = AppState;
window.exportMappings = exportMappingsToJSON;
window.clearMappings = function() {
    if (confirm('Are you sure you want to clear all mappings?')) {
        AppState.mappings = {};
        saveMappingsToLocalStorage();
        renderCurrentCategory();
        console.log('All mappings cleared');
    }
};
console.log('Chart of Accounts Standardizer loaded successfully!');
console.log('Available commands:');
console.log('- AppState: View current application state');
console.log('- exportMappings(): Export mappings to JSON file');
console.log('- clearMappings(): Clear all mappings');
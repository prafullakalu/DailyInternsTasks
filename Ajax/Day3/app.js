const AppState = {
    masterData: [],
    destinationData: [],
    currentCategory: 'Assets',
    mappings: {}, 
    hasUnsavedChanges: false,
    destinationFilter: 'All',
    searchQuery: '',
    destinationScrollPosition: 0,
    currentUser: null,
    visibleHeaders: {
        source: { main: '', sub: '' },
        mapping: { main: '', sub: '' },
        destination: { main: '', sub: '' }
    }
};


const CATEGORY_MAPPINGS = {
    'Assets': ['Assets'],
    'Liability': ['Liabilities'],
    'Equity/Capital': ['Equity'],
    'Revenue': ['Revenue'],
    'CoGS': ['COGS'],
    'Labor Expense': ['Expense'],
    'Other Revenue & Expense': ['Other Rev & Exp']
};


const DESTINATION_CATEGORIES = [
    'All',
    'Assets',
    'Liability',
    'Equity/Capital',
    'Revenue',
    'Outside Services Costs',
    'Product Costs',
    'Labor Expense',
    'Other'
];



let destinationCategoryIndex = 0;


function initializeLogin() {
    const currentUser = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');
    
  
    $('#passwordInput').val('');
    $('#emailInput').val('');
    
    if (currentUser && authToken) {
       
        verifyToken(authToken, currentUser);
    } else {
        
        $('#loginContainer').show();
        $('#mainApp').hide();
        setupLoginForm();
    }
}

function verifyToken(token, email) {
    $.ajax({
        url: 'http://trainingsampleapi.satva.solutions/api/auth/verify',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
        
            AppState.currentUser = email;
            showMainApp(email);
        },
        error: function() {
         
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            AppState.currentUser = null;
            $('#loginContainer').show();
            $('#mainApp').hide();
            $('#passwordInput').val('');
            $('#emailInput').val('');
            setupLoginForm();
        }
    });
}

function setupLoginForm() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#emailInput').val().trim();
        const password = $('#passwordInput').val().trim();
        
   
        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Please enter both email and password',
                confirmButtonColor: '#667eea'
            });
            return;
        }
        
  
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalBtnText = $submitBtn.html();
        $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Logging in...');
        
       
        $.ajax({
            url: 'http://trainingsampleapi.satva.solutions/api/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                Email: email,
                Password: password
            }),
            success: function(response) {
             
                if (response.token) {
                    localStorage.setItem('authToken', response.token);
                    localStorage.setItem('currentUser', email);
                    AppState.currentUser = email;
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful',
                        text: `Welcome, ${email}!`,
                        timer: 1500,
                        showConfirmButton: false,
                        confirmButtonColor: '#667eea'
                    }).then(() => {
                        showMainApp(email);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: 'No token received from server',
                        confirmButtonColor: '#667eea'
                    });
                    $submitBtn.prop('disabled', false).html(originalBtnText);
                }
            },
            error: function(xhr, status, error) {
                let errorMsg = 'Login failed. Please try again.';
                
             
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.status === 401) {
                    errorMsg = 'Invalid email or password';
                } else if (xhr.status === 0) {
                    errorMsg = 'Network error. Please check your connection.';
                }
                
                Swal.fire({
                    icon: 'error',
                    title: 'Login Error',
                    text: errorMsg,
                    confirmButtonColor: '#667eea'
                });
                $submitBtn.prop('disabled', false).html(originalBtnText);
            }
        });
    });
}


function setupAjaxTokenHeader() {
    
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const token = localStorage.getItem('authToken');
            if (token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            }
        },
        statusCode: {
            401: function() {
           
                console.warn('Token expired or invalid');
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                AppState.currentUser = null;
                
              
                $('#passwordInput').val('');
                $('#emailInput').val('');
             
                Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Your session has expired. Please login again.',
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    location.reload();
                });
            }
        }
    });
}

function showMainApp(email) {
    $('#loginContainer').hide();
    $('#mainApp').show();
    $('#userDisplay').text(email);
    

    setupAjaxTokenHeader();
    
  
    initializeApp();
}

function handleLogout() {
    Swal.fire({
        title: 'Confirm Logout',
        text: 'Are you sure you want to logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Logout'
    }).then((result) => {
        if (result.isConfirmed) {
         
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            AppState.currentUser = null;
            
          
            $('#passwordInput').val('');
            $('#emailInput').val('');
            
            location.reload();
        }
    });
}


$(document).ready(function() {
    console.log('Initializing Chart of Accounts Standardizer...');
    initializeLogin();
});

function initializeApp() {
    console.log('App initialized for user:', AppState.currentUser);
   
   
    loadMappingsFromLocalStorage();
   

    loadExcelFiles();
   
    
    initializeEventListeners();
   
   
    updateLastUpdatedDate();
   
  
    setupBeforeUnloadWarning();
    
   
    $('#logoutBtn').on('click', handleLogout);
}
// ========================================
// EXCEL FILE LOADING
// ========================================
async function loadExcelFiles() {
    try {
        console.log('Loading Excel files...');
       
       
        const [masterData, destData] = await Promise.all([
            loadExcelFile('./Master Chart of account.xlsx'),
            loadExcelFile('./destination chart of account.xlsx')
        ]);
       
        AppState.masterData = processMasterData(masterData);
        AppState.destinationData = processDestinationData(destData);
       
        console.log('Master data loaded:', AppState.masterData.length, 'records');
        console.log('Destination data loaded:', AppState.destinationData.length, 'records');
       
   
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
function initializeEventListeners() {
    // Main menu tab changes
    $('#mainMenuTabs button').on('click', function() {
        const category = $(this).data('category');
        if (AppState.currentCategory !== category) {
            AppState.currentCategory = category;
            syncDestinationFilter(category);
            renderCurrentCategory();
        }
    });
   
    // Destination category navigation - page N tabs at a time
    $(document).on('click', '#destCategoryPrev', function() {
        const visibleCount = 3;
        if (destinationCategoryIndex > 0) {
            destinationCategoryIndex = Math.max(0, destinationCategoryIndex - visibleCount);
            updateDestinationCategoryDisplay();
            renderDestinationAccounts();
        }
    });
   
    $(document).on('click', '#destCategoryNext', function() {
        const visibleCount = 3;
        const maxStart = Math.max(0, DESTINATION_CATEGORIES.length - visibleCount);
        if (destinationCategoryIndex < maxStart) {
            destinationCategoryIndex = Math.min(maxStart, destinationCategoryIndex + visibleCount);
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
    
    // Clear All button
    $('#clearAllBtn').on('click', handleClearAll);
}
function syncDestinationFilter(category) {
    if (category === 'CoGS') {
        AppState.destinationFilter = 'Product Costs';
    } else if (category === 'Other Revenue & Expense') {
        AppState.destinationFilter = 'Other';
    } else {
        AppState.destinationFilter = category;
    }
    // Update tab index so the selected filter is visible (center when possible)
    const visibleCount = 3;
    const maxStart = Math.max(0, DESTINATION_CATEGORIES.length - visibleCount);
    const idx = DESTINATION_CATEGORIES.indexOf(AppState.destinationFilter);
    if (idx <= 0) {
        destinationCategoryIndex = 0;
    } else {
        destinationCategoryIndex = Math.min(maxStart, Math.max(0, idx - Math.floor(visibleCount / 2)));
    }
    updateDestinationCategoryDisplay();
}
function updateDestinationCategoryDisplay() {
    const visibleCount = 3;
    const maxStart = Math.max(0, DESTINATION_CATEGORIES.length - visibleCount);
    const visibleCategories = DESTINATION_CATEGORIES.slice(destinationCategoryIndex, destinationCategoryIndex + visibleCount);
    const container = $('#destinationTabs');
   
    let html = '';
    visibleCategories.forEach((category, index) => {
        const categoryIndex = destinationCategoryIndex + index;
        const isActive = category === AppState.destinationFilter ? 'active' : '';
        const colorClass = `dest-tab-${categoryIndex}`;
        html += `
            <li class="nav-item" role="presentation">
                <button class="nav-link ${isActive} ${colorClass}" data-dest-category="${category}" type="button">
                    ${category}
                </button>
            </li>
        `;
    });
   
    container.html(html);
   
    // Update arrow button states
    $('#destCategoryPrev').prop('disabled', destinationCategoryIndex === 0);
    $('#destCategoryNext').prop('disabled', destinationCategoryIndex >= maxStart);
}
// ========================================
// RENDERING FUNCTIONS
// ========================================
function renderCurrentCategory() {
    console.log('Rendering category:', AppState.currentCategory);

    renderMappingTable();

    updateDestinationCategoryDisplay();
 
    renderDestinationAccounts();

    initializeDragAndDrop();
}

function setupSynchronizedScrolling() {
    const sourceList = document.getElementById('sourceAccountsList');
    const mappingArea = document.getElementById('mappingArea');
    const destList = document.getElementById('destinationAccountsList');
    

    if (sourceList) $(sourceList).off('scroll.sync');
    if (mappingArea) $(mappingArea).off('scroll.sync');
    if (destList) $(destList).off('scroll.sync');

    // NOTE: Intentionally do NOT attach synchronized scroll handlers here.
    // Columns should scroll independently to avoid confusion during mapping.
}

// ========================================
// ROW-BASED MAPPING TABLE RENDERING
// ========================================
function renderMappingTable() {
    const container = $('#mappingTableContainer');
    container.empty();

    const filteredData = getSourceAccountsByCategory(AppState.currentCategory);

    if (filteredData.length === 0) {
        container.html(`
            <div class="empty-state">
                <p>No accounts found for this category</p>
            </div>
        `);
        return;
    }

    // Add sticky main category header
    container.append(`
        <div class="mapping-main-header">
            <div class="mapping-main-header-left">${AppState.currentCategory}</div>
            <div class="mapping-main-header-right" ">Likely Destination Account</div>
        </div>
    `);

    // Add sticky mapping zones header
    container.append(`
        <div class="mapping-zones-header">
            <div class="mapping-zones-header-left"></div>
            <div class="mapping-zones-header-right">
                <div class="mapping-zone-header-cell">MOST LIKELY</div>
                <div class="mapping-zone-header-cell">LIKELY</div>
                <div class="mapping-zone-header-cell">POSSIBLE</div>
            </div>
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

    // Render groups with interleaved rows
    Object.keys(grouped).forEach(subGroupName => {
        const accounts = grouped[subGroupName];

        // Add sub-group header
        container.append(`
            <div class="mapping-subgroup-header">
                <div class="mapping-subgroup-header-left">${subGroupName}</div>
                <div class="mapping-subgroup-header-right"></div>
            </div>
        `);

        // Add account rows (source + mapping side-by-side)
        accounts.forEach(account => {
            const sourceCode = account.Number;
            const savedMapping = getMappingForAccount(sourceCode);
            const isMapped = isSourceAccountMapped(sourceCode);
            const mappedIcon = isMapped ? '<i class="fas fa-check-circle text-success mapping-row-source-icon" title="Mapped"></i>' : '';

            const mostLikelyHtml = savedMapping.mostLikely ? createRowMappedCardHTML(savedMapping.mostLikely, sourceCode, 'mostLikely', 94) : '';
            const likelyHtml = savedMapping.likely ? createRowMappedCardHTML(savedMapping.likely, sourceCode, 'likely', 85) : '';
            const possibleHtml = savedMapping.possible ? createRowMappedCardHTML(savedMapping.possible, sourceCode, 'possible', 60) : '';

            container.append(`
                <div class="mapping-table-row-wrapper" data-source-code="${sourceCode}">
                    <div class="mapping-row-source">
                        <span class="mapping-row-source-code">${account.Number}</span>
                        <span class="mapping-row-source-name">${account.Name}${mappedIcon}</span>
                    </div>
                    <div class="mapping-row-zones">
                        <div class="mapping-zone-cell mapping-zone-most-likely">
                            <div class="mapping-drop-zone" data-source-code="${sourceCode}" data-zone="mostLikely">
                                ${mostLikelyHtml}
                            </div>
                        </div>
                        <div class="mapping-zone-cell mapping-zone-likely">
                            <div class="mapping-drop-zone" data-source-code="${sourceCode}" data-zone="likely">
                                ${likelyHtml}
                            </div>
                        </div>
                        <div class="mapping-zone-cell mapping-zone-possible">
                            <div class="mapping-drop-zone" data-source-code="${sourceCode}" data-zone="possible">
                                ${possibleHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    });
}

function createRowMappedCardHTML(account, sourceCode, zone, probability) {
    const probabilityClass = probability >= 85 ? 'high' : probability >= 70 ? 'medium' : 'low';
   
    return `
        <div class="mapping-row-card" draggable="true"
             data-source-code="${sourceCode}"
             data-zone="${zone}"
             data-account-code="${account.AccountCode}">
            <span class="mapping-row-card-code">${account.AccountCode}</span>
            <span class="mapping-row-card-name">${account.AccountName}</span>
            <div class="mapping-row-probability ${probabilityClass}">${probability}</div>
        </div>
    `;
}

// ========================================
// LEGACY RENDERING (kept for backward compatibility, no longer used)
// ========================================
function renderSourceAccounts() {
    const container = $('#sourceAccountsList');
    container.empty();
   
    const filteredData = getSourceAccountsByCategory(AppState.currentCategory);
   
    if (filteredData.length === 0) {
        container.html(`
            <div class="empty-state">
                <p>No accounts found for this category</p>
            </div>
        `);
        return;
    }
   
    // Group by Sub-Group
    const grouped = {};
    filteredData.forEach(account => {
        const subGroup = account['Sub-Group'] || 'Other';
        if (!grouped[subGroup]) {
            grouped[subGroup] = [];
        }
        grouped[subGroup].push(account);
    });
   
    // Add main category header
    container.append(`
        <div class="account-category-header">
            ${AppState.currentCategory}
        </div>
    `);
   
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
            const sourceCode = account.Number;
            const mappedIcon = isSourceAccountMapped(sourceCode) ? '<i class="fas fa-check-circle text-success mapping-status" title="Mapped"></i>' : '';
           
            container.append(`
                <div class="account-item" data-account-code="${sourceCode}">
                    <div class="d-flex align-items-center flex-grow-1">
                        <span class="account-code">${account.Number}</span>
                        <span class="account-name">${account.Name}</span>
                    </div>
                    ${mappedIcon}
                </div>
            `);
        });
    });
}
function renderMappingArea() {
    const container = $('#mappingArea');
    container.empty();
   
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
   
    // Add sticky mapping table header
    container.append(`
        <div class="mapping-table-header">
            <div class="header-cell">MOST LIKELY</div>
            <div class="header-cell">LIKELY</div>
            <div class="header-cell">POSSIBLE</div>
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
       
        // Add mapping rows
        accounts.forEach(account => {
            const sourceCode = account.Number;
            const savedMapping = getMappingForAccount(sourceCode);
           
            container.append(`
                <div class="mapping-table-row" data-source-code="${sourceCode}">
                    <div class="mapping-cell most-likely-cell">
                        <div class="drop-zone" data-source-code="${sourceCode}" data-zone="mostLikely">
                            ${savedMapping.mostLikely ? createMappedAccountHTML(savedMapping.mostLikely, sourceCode, 'mostLikely', 94) : '<div class="drop-placeholder-text">Drop here</div>'}
                        </div>
                    </div>
                    <div class="mapping-cell likely-cell">
                        <div class="drop-zone" data-source-code="${sourceCode}" data-zone="likely">
                            ${savedMapping.likely ? createMappedAccountHTML(savedMapping.likely, sourceCode, 'likely', 85) : '<div class="drop-placeholder-text">Drop here</div>'}
                        </div>
                    </div>
                    <div class="mapping-cell possible-cell">
                        <div class="drop-zone" data-source-code="${sourceCode}" data-zone="possible">
                            ${savedMapping.possible ? createMappedAccountHTML(savedMapping.possible, sourceCode, 'possible', 60) : '<div class="drop-placeholder-text">Drop here</div>'}
                        </div>
                    </div>
                </div>
            `);
        });
    });
   
    // Initialize drag and drop
    initializeDragAndDrop();
}
// ========================================
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
function createMappedAccountHTML(account, sourceCode, zone, probability) {
    const probabilityClass = probability >= 85 ? 'high' : probability >= 70 ? 'medium' : 'low';
   
    return `
        <div class="mapped-account-card" draggable="true"
             data-source-code="${sourceCode}"
             data-zone="${zone}"
             data-account-code="${account.AccountCode}">
            <div class="mapped-account-header">
                <span class="mapped-account-code">${account.AccountCode}</span>
                <div class="probability-badge ${probabilityClass}">${probability}</div>
            </div>
            <div class="mapped-account-name">${account.AccountName}</div>
        </div>
    `;
}
function renderDestinationAccounts() {
    const container = $('#destinationAccountsList');
    container.empty();

    let filteredData = AppState.destinationData;

    // ── Category filter ───────────────────────────────────────
    if (AppState.destinationFilter !== 'All') {
        filteredData = filteredData.filter(acc => {
            const filter = AppState.destinationFilter;
            if (filter === 'Assets')                         return acc.AccountTypeName === 'ASSETS';
            if (filter === 'Liability')                      return acc.AccountTypeName === 'LIABILITIES';
            if (filter === 'Equity/Capital')                 return acc.AccountTypeName === 'EQUITY/CAPITAL';
            // Treat both Professional Services and Product Revenue as "Revenue"
            if (filter === 'Revenue')                         return acc.AccountTypeName === 'Professional Services Revenue' || acc.AccountTypeName === 'Product Revenue';
            if (filter === 'Professional Services Revenue')  return acc.AccountTypeName === 'Professional Services Revenue';
            if (filter === 'Product Revenue')                return acc.AccountTypeName === 'Product Revenue';
            if (filter === 'Outside Services Costs')         return acc.AccountTypeName === 'Outside (or "1099") Professional Services Costs';
            if (filter === 'Product Costs')                  return acc.AccountTypeName === 'Product Costs';
            if (filter === 'Labor Expense')                  return acc.AccountTypeName === 'Labor Expense';
            if (filter === 'Other') {
                const subName = (acc.SubAccountName || '').toLowerCase();
                return subName.includes('other');
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

    // ── Group: normalize AccountType (combine revenue types) → SubAccount → items ────────────────
    const typeGroups = {};
    filteredData.forEach(acc => {
        const rawType  = acc.AccountTypeName || 'Uncategorized';
        // Combine Product Revenue and Professional Services Revenue under 'Revenue'
        const type = (rawType === 'Product Revenue' || rawType === 'Professional Services Revenue') ? 'Revenue' : rawType;

        // If this is revenue, classify into Professional vs Product by AccountCode ranges
        let sub;
        if (type === 'Revenue') {
            const codeNum = parseInt((acc.AccountCode || acc.AccountCode === 0) ? acc.AccountCode : (acc.AccountCode || '').toString().replace(/[^0-9]/g, ''), 10) || parseInt((acc.AccountCode||'').toString().replace(/[^0-9]/g, ''), 10) || 0;
            if (codeNum >= 4001 && codeNum <= 4403) {
                sub = 'Professional Services Revenue';
            } else if (codeNum >= 4511 && codeNum <= 4902) {
                sub = 'Product Revenue';
            } else {
                sub = acc.SubAccountName || 'Other Revenue';
            }
        } else {
            sub = acc.SubAccountName || 'General Accounts';
        }

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
                // All accounts are draggable - can be mapped multiple times
                container.append(`
                    <div class="destination-account-item"
                         draggable="true"
                         data-account-code="${acc.AccountCode}"
                         data-account-name="${(acc.AccountName||'').replace(/"/g,'&quot;')}">
                        <div class="d-flex align-items-center flex-grow-1">
                            <span class="destination-account-code">${acc.AccountCode}</span>
                            <span class="destination-account-name text-truncate">${acc.AccountName || ''}</span>
                        </div>
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
    // Drag start from destination
    $(document).off('dragstart', '.destination-account-item:not(.mapped)');
    $(document).on('dragstart', '.destination-account-item', function(e) {
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
    $(document).off('dragstart', '.mapping-row-card');
    $(document).on('dragstart', '.mapping-row-card', function(e) {
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
    $(document).off('dragend', '.destination-account-item, .mapping-row-card');
    $(document).on('dragend', '.destination-account-item, .mapping-row-card', function(e) {
        $(this).removeClass('dragging');
        $('.mapping-drop-zone').removeClass('drag-over');
    });
   
    // Drop zone events
    $(document).off('dragover', '.mapping-drop-zone');
    $(document).on('dragover', '.mapping-drop-zone', function(e) {
        e.preventDefault();
        $(this).addClass('drag-over');
    });
   
    $(document).off('dragleave', '.mapping-drop-zone');
    $(document).on('dragleave', '.mapping-drop-zone', function(e) {
        $(this).removeClass('drag-over');
    });
   
    $(document).off('drop', '.mapping-drop-zone');
    $(document).on('drop', '.mapping-drop-zone', function(e) {
        e.preventDefault();
        $(this).removeClass('drag-over');
       
        try {
            const dataStr = e.originalEvent.dataTransfer.getData('text/plain');
            const data = JSON.parse(dataStr);
           
            const targetSourceCode = $(this).data('source-code');
            const targetZone = $(this).data('zone');
           
            // Validate data
            if (!data || !targetSourceCode || !targetZone) {
                console.warn('⚠ Invalid drop data:', {data, targetSourceCode, targetZone});
                return;
            }
           
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
        } catch (error) {
            console.error('✗ Error handling drop:', error);
        }
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
// ========================================
function handleDropFromDestination(data, targetSourceCode, targetZone) {
    const destAccount = AppState.destinationData.find(acc => acc.AccountCode == data.accountCode);
    if (!destAccount) return;
   
    const currentMapping = getMappingForAccount(targetSourceCode);
    
    // Prevent mapping same account twice in the same row
    if (isAccountMappedInSameRow(data.accountCode, targetSourceCode)) {
        Swal.fire({
            icon: 'warning',
            title: 'Already Mapped in This Row',
            text: 'This account is already mapped in this row. Please choose a different account.',
            confirmButtonColor: '#17a2b8',
            timer: 2500
        });
        return;
    }
   
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
    
    // Save to localStorage immediately
    saveMappingsToLocalStorage();
   
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
    // saveMappingsToLocalStorage(); // Only save on submit
}
function isAccountMapped(destAccountCode) {
    // Allow accounts to be mapped multiple times across different rows
    return false;
}

function isAccountMappedInSameRow(destAccountCode, sourceCode) {
    // Check if account is already mapped in this specific row
    const mapping = getMappingForAccount(sourceCode);
    
    if (mapping.mostLikely?.AccountCode == destAccountCode ||
        mapping.likely?.AccountCode == destAccountCode ||
        mapping.possible?.AccountCode == destAccountCode) {
        return true;
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
            const parsed = JSON.parse(saved);
            // Validate structure
            if (typeof parsed === 'object' && parsed !== null) {
                AppState.mappings = parsed;
                console.log('✓ Loaded mappings from localStorage');
            } else {
                console.warn('⚠ Invalid mappings structure in localStorage');
            }
        }
    } catch (error) {
        console.error('✗ Error loading from localStorage:', error);
        // Clear corrupted data
        try {
            localStorage.removeItem('coaMappings');
            console.warn('Cleared corrupted localStorage data');
        } catch (clearError) {
            console.error('Could not clear localStorage:', clearError);
        }
    }
}

function saveMappingsToLocalStorage() {
    try {
        const mappingsJSON = JSON.stringify(AppState.mappings);
        const sizeInKB = new Blob([mappingsJSON]).size / 1024;
        
        // Check if size is reasonable (max 1MB)
        if (sizeInKB > 1024) {
            console.warn(`⚠ Mappings size (${sizeInKB.toFixed(2)}KB) is large`);
        }
        
        localStorage.setItem('coaMappings', mappingsJSON);
        console.log(`✓ Saved mappings to localStorage (${sizeInKB.toFixed(2)}KB)`);
        return true;
    } catch (error) {
        console.error('✗ Error saving to localStorage:', error);
        // Handle quota exceeded error
        if (error.name === 'QuotaExceededError') {
            console.error('localStorage quota exceeded');
            return false;
        }
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
   
    // Validate: no empty submissions
    if (totalMappings === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Mappings',
            text: 'Please create at least one mapping before saving.',
            confirmButtonColor: '#17a2b8'
        });
        return;
    }
    
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

function handleClearAll() {
    Swal.fire({
        title: 'Clear All Mappings?',
        html: `
            <p><strong style="color: #dc3545;">⚠️ WARNING</strong></p>
            <p>This will delete <strong>ALL</strong> mappings from the project and localStorage.</p>
            <p>This action <strong>cannot be undone</strong>.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, Delete All',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear all mappings from memory
            AppState.mappings = {};
            
            // Clear from localStorage
            localStorage.removeItem('coaMappings');
            
            // Reset UI
            AppState.hasUnsavedChanges = false;
            renderCurrentCategory();
            updateLastUpdatedDate();
            
            Swal.fire({
                icon: 'success',
                title: 'All Cleared!',
                text: 'All mappings have been deleted successfully.',
                confirmButtonColor: '#28a745',
                timer: 1500
            });
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
//
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
# 💻 JAVASCRIPT CODE SECTIONS - DETAILED BREAKDOWN

## Specific Code Examples & Explanations

---

## 1. GLOBAL STATE MANAGEMENT

### AppState Object
```javascript
const AppState = {
    masterData: [],              // Array of source accounts
    destinationData: [],         // Array of destination accounts
    currentCategory: 'Assets',   // Which category tab is selected
    mappings: {},                // Object storing all user mappings
    hasUnsavedChanges: false,    // Has user made unsaved changes?
    destinationFilter: 'All',    // Which destination tab is selected
    searchQuery: '',             // What search text was entered
    destinationScrollPosition: 0,// Where is scroll position?
    currentUser: null            // Who is logged in?
};
```

**Why it exists:**
- Single source of truth for app data
- Any function can access/modify it
- When data changes, UI can be updated

**Example Usage:**
```javascript
// Reading from AppState
console.log(AppState.currentCategory);  // "Assets"

// Writing to AppState
AppState.currentCategory = 'Liability';

// Now UI can read this and render accordingly
renderCurrentCategory(); // Uses AppState.currentCategory
```

---

## 2. LOGIN SYSTEM

### Complete Login Flow

```javascript
// Step 1: Page loads, check if user logged in before
function initializeLogin() {
    const currentUser = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');
    
    if (currentUser && authToken) {
        // User data exists in browser storage
        verifyToken(authToken, currentUser);
    } else {
        // No saved login, show login form
        $('#loginContainer').show();
        $('#mainApp').hide();
        setupLoginForm();
    }
}

// Step 2: Verify saved token is still valid
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
            // Token expired
            localStorage.clear();
            $('#loginContainer').show();
        }
    });
}

// Step 3: Handle form submission
function setupLoginForm() {
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();  // Prevent page reload
        
        const email = $('#emailInput').val().trim();
        const password = $('#passwordInput').val().trim();
        
        // Validate inputs
        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Please enter both email and password'
            });
            return;
        }
        
        // Show loading
        const $btn = $(this).find('button[type="submit"]');
        $btn.prop('disabled', true).html('Logging in...');
        
        // Send to server
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
                    // Save token
                    localStorage.setItem('authToken', response.token);
                    localStorage.setItem('currentUser', email);
                    AppState.currentUser = email;
                    
                    // Show app
                    showMainApp(email);
                }
            },
            error: function(xhr) {
                // Show error
                let msg = 'Login failed';
                if (xhr.status === 401) {
                    msg = 'Invalid email or password';
                }
                
                Swal.fire({
                    icon: 'error',
                    title: 'Login Error',
                    text: msg
                });
                
                $btn.prop('disabled', false).html('Login');
            }
        });
    });
}

// Step 4: Show main app
function showMainApp(email) {
    $('#loginContainer').hide();
    $('#mainApp').show();
    $('#userDisplay').text(email);
    
    // Setup token for all future requests
    setupAjaxTokenHeader();
    
    // Start app
    initializeApp();
}

// Step 5: Setup AJAX to automatically include token
function setupAjaxTokenHeader() {
    $.ajaxSetup({
        beforeSend: function(xhr) {
            const token = localStorage.getItem('authToken');
            if (token) {
                // Add token to every AJAX request
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            }
        },
        statusCode: {
            401: function() {
                // Token expired while using app
                localStorage.clear();
                Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Please login again'
                }).then(() => {
                    location.reload();
                });
            }
        }
    });
}
```

---

## 3. EXCEL FILE LOADING

### How Excel files are loaded and parsed

```javascript
// Main function - called when app starts
async function loadExcelFiles() {
    try {
        console.log('Loading Excel files...');
        
        // Load BOTH files at the same time (parallel)
        // Don't wait for file 1 to finish before starting file 2
        const [masterData, destData] = await Promise.all([
            loadExcelFile('./Master Chart of account.xlsx'),
            loadExcelFile('./destination chart of account.xlsx')
        ]);
        
        // Process the raw Excel data
        AppState.masterData = processMasterData(masterData);
        AppState.destinationData = processDestinationData(destData);
        
        console.log('Loaded:', AppState.masterData.length, 'source accounts');
        console.log('Loaded:', AppState.destinationData.length, 'destination accounts');
        
        // Show the loaded data
        renderCurrentCategory();
        
    } catch (error) {
        console.error('Error loading Excel files:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error Loading Files',
            text: 'Could not load Excel files'
        });
    }
}

// Load a single Excel file
async function loadExcelFile(url) {
    // Step 1: Download file from server
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Step 2: Parse Excel using ExcelJS library
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    // Step 3: Get first worksheet (sheet 1)
    const worksheet = workbook.worksheets[0];
    const data = [];
    
    // Step 4: Read column headers from row 1
    const headers = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value;  // Store column name
    });
    
    // Example: headers = ['Number', 'Name', 'Type']
    
    // Step 5: Read all data rows (skip row 1 which is headers)
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {  // Skip header row
            const rowData = {};
            
            // For each column in this row
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];  // Get column name
                rowData[header] = cell.value;            // Store value
            });
            
            data.push(rowData);
        }
    });
    
    return data;
}

// Example of what data looks like after parsing:
// [
//   { Number: 1000, Name: 'Cash', Type: 'Assets' },
//   { Number: 1100, Name: 'Accounts Receivable', Type: 'Assets' },
//   { Number: null, Name: 'Section Title', Type: null }  // Invalid row
// ]

// Clean up master data
function processMasterData(data) {
    return data.filter(row => {
        // Only keep rows where:
        // 1. Number exists (not null/undefined)
        // 2. Number is a number type
        // 3. Number is greater than 0
        return row.Number && typeof row.Number === 'number' && row.Number > 0;
    });
}

// After filtering:
// [
//   { Number: 1000, Name: 'Cash', Type: 'Assets' },
//   { Number: 1100, Name: 'Accounts Receivable', Type: 'Assets' }
// ]

// Clean up destination data
function processDestinationData(data) {
    return data.map(row => ({
        // Extract only the fields we need
        AccountCode: row.AccountCode,
        AccountName: row.AccountName,
        AccountTypeName: row.AccountTypeName,
        SubAccountName: row.SubAccountName,
        Group: row.AccountTypeName  // Use type as group for filtering
    })).filter(row => row.AccountCode);  // Remove rows without account code
}
```

---

## 4. EVENT LISTENERS

### How user clicks are detected and handled

```javascript
function initializeEventListeners() {
    
    // ===== CATEGORY TABS (Assets, Liability, etc.) =====
    $('#mainMenuTabs button').on('click', function() {
        // Get which tab was clicked
        const category = $(this).data('category');  // Get data attribute
        
        // Only re-render if different category
        if (AppState.currentCategory !== category) {
            // Update state
            AppState.currentCategory = category;
            
            // Sync destination filter to match category
            syncDestinationFilter(category);
            
            // Re-render everything
            renderCurrentCategory();
        }
    });
    
    // ===== DESTINATION CATEGORY TABS (All, Assets, Liability, etc.) =====
    $(document).on('click', '#destinationTabs button', function() {
        // Get which destination tab was clicked
        const destCategory = $(this).data('dest-category');
        
        // Update state
        AppState.destinationFilter = destCategory;
        
        // Update tab appearance (highlight current tab)
        $(this).addClass('active').siblings().removeClass('active');
        
        // Re-render destination accounts
        renderDestinationAccounts();
    });
    
    // ===== DESTINATION SEARCH BOX =====
    $('#destinationSearch').on('input', function() {
        // Get search text as user types
        AppState.searchQuery = $(this).val().toLowerCase();
        
        // Re-render filtered results
        renderDestinationAccounts();
    });
    
    // ===== NAVIGATION ARROWS =====
    $(document).on('click', '#destCategoryPrev', function() {
        // Move left 3 tabs
        const visibleCount = 3;
        if (destinationCategoryIndex > 0) {
            destinationCategoryIndex = Math.max(0, destinationCategoryIndex - visibleCount);
            updateDestinationCategoryDisplay();
            renderDestinationAccounts();
        }
    });
    
    $(document).on('click', '#destCategoryNext', function() {
        // Move right 3 tabs
        const visibleCount = 3;
        const maxStart = Math.max(0, DESTINATION_CATEGORIES.length - visibleCount);
        if (destinationCategoryIndex < maxStart) {
            destinationCategoryIndex = Math.min(maxStart, destinationCategoryIndex + visibleCount);
            updateDestinationCategoryDisplay();
            renderDestinationAccounts();
        }
    });
    
    // ===== SUBMIT BUTTON =====
    $('#submitBtn').on('click', handleSubmit);
    // handleSubmit() will:
    // 1. Show confirmation dialog
    // 2. Save mappings to localStorage
    // 3. Send to server
    // 4. Show success message
    
    // ===== CLEAR ALL BUTTON =====
    $('#clearAllBtn').on('click', handleClearAll);
    // handleClearAll() will:
    // 1. Show confirmation dialog
    // 2. Clear localStorage
    // 3. Clear AppState.mappings
    // 4. Re-render page
}
```

---

## 5. RENDERING

### How HTML is generated from data

```javascript
// Main rendering function
function renderCurrentCategory() {
    console.log('Rendering category:', AppState.currentCategory);
    
    // Re-create the mapping table
    renderMappingTable();
    
    // Update destination tabs
    updateDestinationCategoryDisplay();
    
    // Re-create destination accounts list
    renderDestinationAccounts();
    
    // Setup drag handlers
    initializeDragAndDrop();
}

// Generate the mapping table
function renderMappingTable() {
    const container = $('#mappingTableContainer');
    container.empty();  // Clear old content
    
    // Get all source accounts for this category
    // Example: If category is 'Assets', get all rows where Type = 'Assets'
    const filteredData = getSourceAccountsByCategory(AppState.currentCategory);
    
    if (filteredData.length === 0) {
        container.html('<div>No accounts found</div>');
        return;
    }
    
    // Add header
    container.append(`
        <div class="mapping-main-header">
            <div>${AppState.currentCategory}</div>
            <div>Likely Destination Account</div>
        </div>
    `);
    
    // Add zones header
    container.append(`
        <div class="mapping-zones-header">
            <div>MOST LIKELY</div>
            <div>LIKELY</div>
            <div>POSSIBLE</div>
        </div>
    `);
    
    // Group accounts by Sub-Group
    const grouped = {};
    filteredData.forEach(account => {
        const subGroup = account['Sub-Group'] || 'Other';
        if (!grouped[subGroup]) {
            grouped[subGroup] = [];
        }
        grouped[subGroup].push(account);
    });
    
    // Result:
    // {
    //   "Current Assets": [{ Number: 1000, ... }, { Number: 1100, ... }],
    //   "Fixed Assets": [{ Number: 1500, ... }]
    // }
    
    // Render each group
    Object.keys(grouped).forEach(subGroupName => {
        const accounts = grouped[subGroupName];
        
        // Add subgroup header
        container.append(`
            <div class="mapping-subgroup-header">${subGroupName}</div>
        `);
        
        // Add each account as a row
        accounts.forEach(account => {
            const sourceCode = account.Number;
            
            // Get any saved mappings for this account
            const savedMapping = getMappingForAccount(sourceCode);
            
            // Generate HTML for drop zones
            const mostLikelyHtml = savedMapping.mostLikely ? 
                createRowMappedCardHTML(savedMapping.mostLikely, sourceCode, 'mostLikely') : '';
            const likelyHtml = savedMapping.likely ? 
                createRowMappedCardHTML(savedMapping.likely, sourceCode, 'likely') : '';
            const possibleHtml = savedMapping.possible ? 
                createRowMappedCardHTML(savedMapping.possible, sourceCode, 'possible') : '';
            
            // Add row with 3 drop zones
            container.append(`
                <div class="mapping-table-row-wrapper" data-source-code="${sourceCode}">
                    <div class="mapping-row-source">
                        <span>${account.Number}</span>
                        <span>${account.Name}</span>
                    </div>
                    <div class="mapping-row-zones">
                        <div class="mapping-zone-cell">
                            <div class="mapping-drop-zone" data-source-code="${sourceCode}" data-zone="mostLikely">
                                ${mostLikelyHtml}
                            </div>
                        </div>
                        <div class="mapping-zone-cell">
                            <div class="mapping-drop-zone" data-source-code="${sourceCode}" data-zone="likely">
                                ${likelyHtml}
                            </div>
                        </div>
                        <div class="mapping-zone-cell">
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

// Render destination accounts
function renderDestinationAccounts() {
    const container = $('#destinationAccountsList');
    container.empty();
    
    // Start with all destination accounts
    let filteredAccounts = AppState.destinationData;
    
    // Filter by category
    if (AppState.destinationFilter !== 'All') {
        filteredAccounts = filteredAccounts.filter(acc => 
            acc.Group === AppState.destinationFilter
        );
    }
    
    // Filter by search
    if (AppState.searchQuery) {
        filteredAccounts = filteredAccounts.filter(acc =>
            acc.AccountCode.toString().toLowerCase().includes(AppState.searchQuery) ||
            acc.AccountName.toLowerCase().includes(AppState.searchQuery)
        );
    }
    
    if (filteredAccounts.length === 0) {
        container.html('<div>No accounts found</div>');
        return;
    }
    
    // Render each account
    let html = '<div class="destination-accounts-list">';
    filteredAccounts.forEach(account => {
        html += `
            <div class="destination-account-item" 
                 data-account-code="${account.AccountCode}" 
                 draggable="true">
                <div>${account.AccountCode}</div>
                <div>${account.AccountName}</div>
                <small>${account.SubAccountName || ''}</small>
            </div>
        `;
    });
    html += '</div>';
    
    container.html(html);
}
```

---

## 6. SAVING & LOADING DATA

### How mappings are persisted

```javascript
// Save to localStorage
function saveMappingsToLocalStorage() {
    try {
        // Convert AppState.mappings object to JSON string
        const mappingsJson = JSON.stringify(AppState.mappings);
        
        // Store in browser
        localStorage.setItem('mappings', mappingsJson);
        localStorage.setItem('lastSaved', new Date().toLocaleString());
        
        // Mark as saved
        AppState.hasUnsavedChanges = false;
        
        console.log('Mappings saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving mappings:', error);
        return false;
    }
}

// Load from localStorage
function loadMappingsFromLocalStorage() {
    try {
        // Get stored JSON string
        const saved = localStorage.getItem('mappings');
        
        if (saved) {
            // Convert JSON string back to JavaScript object
            AppState.mappings = JSON.parse(saved);
            console.log('Mappings loaded from localStorage');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading mappings:', error);
        return false;
    }
}

// Example of stored data:
// localStorage.mappings = 
// {
//   "Assets": {
//     "1000": {
//       "mostLikely": {
//         "AccountCode": "1000",
//         "AccountName": "Cash"
//       },
//       "likely": null,
//       "possible": null
//     }
//   }
// }

// Clear all data
function clearMappings() {
    try {
        localStorage.removeItem('mappings');
        AppState.mappings = {};
        console.log('All mappings cleared');
        return true;
    } catch (error) {
        console.error('Error clearing mappings:', error);
        return false;
    }
}
```

---

## 7. DRAG & DROP

### How mapping creation works

```javascript
// When page starts, setup drag handlers
function initializeDragAndDrop() {
    // ===== DRAG START =====
    $(document).on('dragstart', '.destination-account-item', function(e) {
        // Store account data in drag payload
        const accountCode = $(this).data('account-code');
        const accountName = $(this).find('.account-name').text();
        
        const accountData = {
            AccountCode: accountCode,
            AccountName: accountName,
            // ... other fields
        };
        
        // Store as JSON in drag event
        e.originalEvent.dataTransfer.setData('application/json', 
                                            JSON.stringify(accountData));
        
        // Visual feedback
        $(this).addClass('dragging');
    });
    
    // ===== DRAG OVER =====
    $(document).on('dragover', '.mapping-drop-zone', function(e) {
        e.preventDefault();  // Allow drop
        
        // Visual feedback: highlight zone
        $(this).addClass('drop-zone-active');
    });
    
    // ===== DRAG LEAVE =====
    $(document).on('dragleave', '.mapping-drop-zone', function(e) {
        // Remove highlight
        $(this).removeClass('drop-zone-active');
    });
    
    // ===== DROP =====
    $(document).on('drop', '.mapping-drop-zone', function(e) {
        e.preventDefault();  // Prevent default browser behavior
        
        // Remove highlight
        $(this).removeClass('drop-zone-active');
        
        // Get dropped account data
        const draggedData = JSON.parse(e.originalEvent.dataTransfer.getData('application/json'));
        
        // Get drop zone info
        const sourceCode = $(this).data('source-code');
        const zone = $(this).data('zone');  // 'mostLikely', 'likely', or 'possible'
        
        // Save mapping
        if (!AppState.mappings[AppState.currentCategory]) {
            AppState.mappings[AppState.currentCategory] = {};
        }
        if (!AppState.mappings[AppState.currentCategory][sourceCode]) {
            AppState.mappings[AppState.currentCategory][sourceCode] = {};
        }
        
        AppState.mappings[AppState.currentCategory][sourceCode][zone] = draggedData;
        
        // Mark as unsaved
        AppState.hasUnsavedChanges = true;
        
        // Update display
        renderMappingTable();
        
        // Save to localStorage
        saveMappingsToLocalStorage();
        
        console.log('Mapping saved:', sourceCode, '→', draggedData.AccountCode);
    });
    
    // ===== DRAG END =====
    $(document).on('dragend', '.destination-account-item', function(e) {
        $(this).removeClass('dragging');
    });
}
```

---

## 8. FORM SUBMISSION

### How submit and clear buttons work

```javascript
// Handle submit button
function handleSubmit() {
    // Show confirmation dialog
    Swal.fire({
        title: 'Confirm Submission',
        text: 'Are you sure you want to submit all mappings?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Submit'
    }).then((result) => {
        if (result.isConfirmed) {
            // User clicked confirm
            
            // Prepare data to send
            const mappingData = {
                mappings: AppState.mappings,
                user: AppState.currentUser,
                submittedAt: new Date().toISOString(),
                recordsCount: AppState.masterData.length
            };
            
            console.log('Submitting:', mappingData);
            
            // Save to localStorage
            localStorage.setItem('submittedMappings', JSON.stringify(mappingData));
            
            // Optional: Send to server
            // $.ajax({
            //     url: '/api/mappings/submit',
            //     type: 'POST',
            //     data: JSON.stringify(mappingData),
            //     success: function() { ... }
            // });
            
            // Show success
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Mappings submitted successfully!'
            });
            
            AppState.hasUnsavedChanges = false;
        }
    });
}

// Handle clear button
function handleClearAll() {
    // Show confirmation dialog
    Swal.fire({
        title: 'Clear All Mappings',
        text: 'This will remove all mappings. This cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Clear All'
    }).then((result) => {
        if (result.isConfirmed) {
            // User clicked confirm
            
            // Clear data
            localStorage.removeItem('mappings');
            AppState.mappings = {};
            AppState.hasUnsavedChanges = false;
            
            // Refresh display
            renderCurrentCategory();
            
            // Show success
            Swal.fire({
                icon: 'success',
                title: 'Cleared',
                text: 'All mappings have been cleared.'
            });
        }
    });
}
```

---

## 9. LOGOUT

### How user logout works

```javascript
function handleLogout() {
    // Show confirmation dialog
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
            // Clear all data
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('mappings');
            
            // Clear app state
            AppState.currentUser = null;
            AppState.mappings = {};
            
            // Clear form
            $('#passwordInput').val('');
            $('#emailInput').val('');
            
            // Reload page to show login form
            location.reload();
        }
    });
}
```

---

## Summary of Key Patterns

| Pattern | Where Used | Purpose |
|---------|-----------|---------|
| Event Listeners | Button clicks | Detect user actions |
| AppState Update | After event | Store latest data |
| Render Function | After state update | Generate HTML |
| DOM Update | In render function | Display to user |
| localStorage | After data changes | Persist to disk |
| AJAX | Login, submit | Communicate with server |
| Async/Await | File loading | Wait for long operations |
| Drag & Drop | Mapping | Create associations |

---

**Now you understand every major code section!** 🎉

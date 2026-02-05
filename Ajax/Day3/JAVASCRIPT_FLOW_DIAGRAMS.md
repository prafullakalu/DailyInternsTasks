# 🎨 JAVASCRIPT CODE FLOW DIAGRAMS

## Visual Guide to Understanding the Code

---

## 🚀 STARTUP SEQUENCE

```
INDEX.HTML LOADS
        │
        ├─ Load jQuery
        ├─ Load Bootstrap
        ├─ Load ExcelJS
        ├─ Load SweetAlert2
        │
        └─ Load app.js (Main JavaScript)
                │
                ▼
        Browser executes app.js
                │
        ┌───────┴────────┐
        │                │
    Define          Define
    Variables       Constants
        │                │
        └───────┬────────┘
                │
                ▼
    $(document).ready(function() {
        initializeLogin();
    });
```

---

## 🔐 LOGIN FLOW

```
USER OPENS APPLICATION
        │
        ▼
initializeLogin()
        │
        ├─ Check localStorage for saved login
        │        │
        ├─ IF FOUND (User logged in before)
        │   │
        │   └─ verifyToken()
        │       │
        │       ├─ Send token to API
        │       │
        │       ├─ SUCCESS: Token valid
        │       │   └─ showMainApp()
        │       │
        │       └─ ERROR: Token expired
        │           └─ Show login form
        │
        └─ IF NOT FOUND (First time)
            │
            └─ setupLoginForm()
                │
                └─ Show login form HTML
```

---

## 📝 LOGIN FORM SUBMISSION

```
USER ENTERS CREDENTIALS & CLICKS LOGIN
        │
        ▼
setupLoginForm() catches submit event
        │
        ├─ Get email from input
        ├─ Get password from input
        │
        ├─ VALIDATE
        │   ├─ Is email empty? → Show error
        │   └─ Is password empty? → Show error
        │
        ├─ Show loading spinner
        │
        ├─ SEND AJAX REQUEST
        │   POST to: http://api.server.com/api/auth/login
        │   Data: { Email: "user@gmail.com", Password: "pass123" }
        │
        ├─ SUCCESS RESPONSE
        │   │
        │   ├─ Get token from response
        │   ├─ Save to localStorage
        │   │   ├─ localStorage.authToken = token
        │   │   └─ localStorage.currentUser = email
        │   │
        │   ├─ Update AppState
        │   │   └─ AppState.currentUser = email
        │   │
        │   ├─ Show success message
        │   │
        │   └─ Call showMainApp()
        │
        └─ ERROR RESPONSE
            │
            ├─ Parse error message
            ├─ Show error in alert
            └─ Re-enable login button
```

---

## 🎯 APPLICATION INITIALIZATION

```
showMainApp() called
        │
        ├─ Hide login form
        │   └─ $('#loginContainer').hide()
        │
        ├─ Show main app
        │   └─ $('#mainApp').show()
        │
        ├─ Display user email
        │   └─ $('#userDisplay').text(email)
        │
        ├─ Setup AJAX headers
        │   └─ All future AJAX requests include token
        │
        └─ Call initializeApp()
                │
                ▼
        initializeApp() runs:
                │
                ├─ Step 1: Load saved mappings
                │   └─ loadMappingsFromLocalStorage()
                │       └─ Get mappings from localStorage
                │           └─ Parse JSON and save to AppState.mappings
                │
                ├─ Step 2: Load Excel files
                │   └─ loadExcelFiles()
                │       ├─ Fetch Master Chart Excel
                │       ├─ Fetch Destination Chart Excel
                │       ├─ Parse both with ExcelJS
                │       ├─ Filter and clean data
                │       └─ Store in AppState
                │
                ├─ Step 3: Initialize event listeners
                │   └─ initializeEventListeners()
                │       ├─ Listen for tab clicks
                │       ├─ Listen for button clicks
                │       ├─ Listen for search input
                │       └─ Listen for drag & drop
                │
                ├─ Step 4: Update UI dates
                │   └─ updateLastUpdatedDate()
                │
                ├─ Step 5: Setup warning
                │   └─ setupBeforeUnloadWarning()
                │       └─ Warn if user leaves with unsaved changes
                │
                ├─ Step 6: Setup logout button
                │   └─ $('#logoutBtn').on('click', handleLogout)
                │
                └─ DONE: App is ready to use
```

---

## 📊 EXCEL FILE LOADING

```
loadExcelFiles() called
        │
        ├─ Load both files in PARALLEL
        │   │
        │   ├─ Promise 1: loadExcelFile('./Master Chart of account.xlsx')
        │   │            │
        │   │            ├─ fetch() → Download file
        │   │            ├─ arrayBuffer() → Convert to binary
        │   │            ├─ ExcelJS.load() → Parse Excel
        │   │            ├─ Read headers → Store column names
        │   │            ├─ Read rows → Convert to objects
        │   │            └─ return array of objects
        │   │
        │   ├─ Promise 2: loadExcelFile('./destination chart...')
        │   │            (Same process)
        │   │
        │   └─ Promise.all() → Wait for BOTH to complete
        │
        ├─ Process Master Data
        │   └─ Filter out invalid rows (Number must be > 0)
        │       └─ Store in AppState.masterData
        │
        ├─ Process Destination Data
        │   └─ Extract specific fields
        │       └─ Store in AppState.destinationData
        │
        ├─ Log how many records loaded
        │
        └─ Render the initial view
            └─ renderCurrentCategory()
```

---

## 🎨 RENDERING PROCESS

```
renderCurrentCategory() called
        │
        ├─ Step 1: Render mapping table
        │   │
        │   └─ renderMappingTable()
        │       │
        │       ├─ Get current category accounts
        │       │   └─ Filter masterData by CATEGORY_MAPPINGS
        │       │
        │       ├─ Group by Sub-Group
        │       │   └─ Create object: { "Current Assets": [...], "Fixed Assets": [...] }
        │       │
        │       ├─ Generate HTML
        │       │   ├─ For each group → Add group header
        │       │   └─ For each account → Add account row with 3 drop zones
        │       │
        │       └─ Insert HTML into DOM
        │           └─ $('#mappingTableContainer').html(html)
        │
        ├─ Step 2: Update destination tabs
        │   │
        │   └─ updateDestinationCategoryDisplay()
        │       │
        │       ├─ Get visible categories (3 at a time)
        │       ├─ Generate tab HTML
        │       └─ Update arrow button states
        │
        ├─ Step 3: Render destination accounts
        │   │
        │   └─ renderDestinationAccounts()
        │       │
        │       ├─ Filter by destination category
        │       ├─ Filter by search query
        │       ├─ Generate account list HTML
        │       └─ Insert into DOM
        │
        └─ Step 4: Setup drag & drop
            └─ initializeDragAndDrop()
                └─ Attach drag handlers to destination accounts
```

---

## 🔄 CATEGORY CHANGE FLOW

```
USER CLICKS TAB (e.g., "Liability")
        │
        ▼
Event listener catches click
        │
        ├─ Get clicked category
        │   └─ const category = $(this).data('category')
        │
        ├─ Check if different from current
        │   └─ If same, do nothing
        │
        ├─ Update AppState
        │   └─ AppState.currentCategory = 'Liability'
        │
        ├─ Sync destination filter
        │   └─ syncDestinationFilter(category)
        │       ├─ Map 'Liability' to 'Liability' destination filter
        │       └─ Calculate which tabs should be visible
        │
        └─ Render updated view
            └─ renderCurrentCategory()
                ├─ Re-render mapping table (shows Liability accounts)
                ├─ Update destination tabs
                └─ Re-render destination accounts
                    └─ User sees updated interface
```

---

## 🎯 MAPPING CREATION (Drag & Drop)

```
USER DRAGS DESTINATION ACCOUNT
        │
        ├─ Mouse down on account
        │   └─ Drag event starts
        │
        ├─ Drag over drop zone
        │   └─ 'dragover' event fires
        │       └─ Visual feedback (highlight zone)
        │
        └─ Drop on zone
            │
            ▼
        Drop event handler:
            │
            ├─ Get source account code
            │   └─ From parent row: data-source-code="1000"
            │
            ├─ Get destination account
            │   └─ From dragged element data
            │
            ├─ Get zone type
            │   └─ From drop zone: data-zone="mostLikely"
            │
            ├─ Save mapping to AppState
            │   └─ AppState.mappings[category][sourceCode][zone] = account
            │
            ├─ Mark as unsaved
            │   └─ AppState.hasUnsavedChanges = true
            │
            ├─ Update display
            │   └─ renderMappingTable()
            │       └─ Show mapped card in zone
            │
            └─ Save to localStorage
                └─ saveMappingsToLocalStorage()
                    ├─ Convert AppState.mappings to JSON
                    └─ localStorage.setItem('mappings', json)
```

---

## 💾 DATA STORAGE HIERARCHY

```
DATABASE / SERVER
    │
    ├─ (Permanent storage)
    └─ Contains user accounts, authentication tokens
        │
        └─ LocalStorage (saved when user logs in)
            │
            ├─ authToken (login token)
            ├─ currentUser (user email)
            └─ mappings (user's account mappings)
                │
                └─ JavaScript Memory (AppState)
                    │
                    ├─ masterData[] (source accounts)
                    ├─ destinationData[] (destination accounts)
                    ├─ mappings {} (current mappings)
                    ├─ currentCategory (selected tab)
                    └─ Other state variables
                        │
                        └─ DOM / HTML
                            │
                            └─ (What user sees)
```

---

## 🔍 DATA TRANSFORMATION FLOW

```
RAW EXCEL FILE
    │
    ├─ Master Chart of account.xlsx
    │   ├─ Number (1000)
    │   ├─ Name (Cash)
    │   └─ Type (Assets)
    │
    ▼
loadExcelFile()
    │
    ├─ Convert to binary
    ├─ Parse with ExcelJS
    ├─ Read headers (Number, Name, Type)
    └─ Read rows → Array of objects
    
    ▼
[
  { Number: 1000, Name: 'Cash', Type: 'Assets' },
  { Number: 1100, Name: 'Accounts Rec', Type: 'Assets' }
]
    │
    ▼
processMasterData()
    │
    ├─ Filter out invalid rows (Number <= 0)
    └─ Keep only valid rows
    
    ▼
[
  { Number: 1000, Name: 'Cash', Type: 'Assets' },
  { Number: 1100, Name: 'Accounts Rec', Type: 'Assets' }
]
    │
    ▼
AppState.masterData
    │
    ▼
Stored in memory for rendering
    │
    ▼
When user selects "Assets" category:
    │
    ├─ Filter masterData where Type = 'Assets'
    ├─ Group by Sub-Group
    └─ Render as HTML table
    
    ▼
USER SEES ON SCREEN:
┌─────────────────┐
│ 1000 | Cash     │
│ 1100 | Acc Rec  │
└─────────────────┘
```

---

## 🎭 EVENT DELEGATION

```
Instead of:
    ├─ Attach handler to each element
    ├─ Problem: If elements are added later, handler doesn't attach
    └─ Inefficient for many elements

We use:
    │
    ├─ $(document).on('click', '#destinationTabs button', function() { ... })
    │
    ├─ Handler attached to entire document
    ├─ When any button in #destinationTabs is clicked:
    │   └─ Check if event target matches selector
    │   └─ If yes, run handler
    │
    └─ Benefit: Works for dynamically added elements
```

---

## ⚡ ASYNC/AWAIT EXECUTION

```
loadExcelFiles() is ASYNC (asynchronous)
    │
    ├─ Code doesn't run line-by-line
    ├─ Instead, it waits for long operations
    │
    ├─ Line 1: Start loading Master Chart
    │       │
    │       ├─ WAIT (doesn't block other code)
    │       │
    │       └─ When loaded → Continue
    │
    ├─ Line 2: Start loading Destination Chart
    │       │
    │       ├─ WAIT
    │       │
    │       └─ When loaded → Continue
    │
    └─ Line 3: Process and render data
        (Only runs when BOTH files are loaded)
```

---

## 🔐 AJAX REQUEST FLOW

```
Client (Browser)                          Server
    │                                        │
    ├─ User submits login form               │
    │                                        │
    ├─ AJAX sends POST request ──────────→  │
    │   {                                    │
    │     Email: "user@gmail.com",          │
    │     Password: "pass123"                │
    │   }                                    │
    │                                        │
    │                    ┌───────────────────┼─ Check if email exists
    │                    │                   │
    │                    ├───────────────────┼─ Check if password correct
    │                    │                   │
    │                    └─ Generate token   │
    │                                        │
    │  ←──────────── Response (token) ──────┤
    │   {                                    │
    │     token: "eyJhbGc...",               │
    │     message: "Login successful"        │
    │   }                                    │
    │                                        │
    ├─ Save token to localStorage           │
    ├─ Save token to AppState               │
    └─ Show main app
```

---

## 📱 COMPLETE USER JOURNEY

```
START
  │
  ├─→ User opens application
  │    │
  │    └─→ initializeLogin() checks for saved login
  │
  ├─→ No saved login found
  │    │
  │    └─→ Show login form
  │
  ├─→ User enters email and password
  │    │
  │    └─→ User clicks "Login"
  │
  ├─→ Validate and send to server
  │    │
  │    └─→ Server returns token
  │
  ├─→ Save token and show app
  │    │
  │    ├─→ Load Excel files
  │    ├─→ Load saved mappings
  │    └─→ Render first category (Assets)
  │
  ├─→ User clicks "Liability" tab
  │    │
  │    └─→ App renders Liability accounts
  │
  ├─→ User drags destination account
  │    │
  │    └─→ Drop on "Most Likely" zone
  │        └─→ Mapping saved
  │
  ├─→ User creates more mappings
  │    │
  │    └─→ Each mapping saved to localStorage
  │
  ├─→ User clicks "Submit"
  │    │
  │    └─→ Confirmation dialog
  │        └─→ Send mappings to server
  │
  ├─→ Success message shown
  │    │
  │    └─→ Mappings saved permanently
  │
  ├─→ User clicks "Logout"
  │    │
  │    └─→ Confirmation dialog
  │        └─→ Clear localStorage
  │        └─→ Show login form
  │
  END
```

---

## 🎁 KEY PATTERNS USED

### Pattern 1: Event Delegation
```javascript
$(document).on('click', selector, function() {
    // Works for current AND future elements
});
```

### Pattern 2: Promise.all()
```javascript
Promise.all([
    loadExcelFile1(),
    loadExcelFile2()
]).then(([data1, data2]) => {
    // Both loaded, now use both
});
```

### Pattern 3: Event-Driven Rendering
```javascript
Event → Update AppState → Render → DOM Updates
```

### Pattern 4: Data Persistence
```javascript
AppState (Memory) ↔ localStorage (Disk) ↔ Server
```

---

**These diagrams help visualize how JavaScript code flows and interacts!** 📊

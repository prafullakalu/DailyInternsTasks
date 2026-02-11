// ========================================
// APPLICATION CONFIGURATION & CONSTANTS
// ========================================

// Application State
const AppState = {
    masterData: [],
    destinationData: [],
    currentCategory: 'Assets',
    mappings: {}, // Structure: { category: { sourceAccountCode: { mostLikely, likely, possible } } }
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

// Category mapping - mapped to Excel Type values
const CATEGORY_MAPPINGS = {
    'Assets': ['Assets'],
    'Liability': ['Liabilities'],
    'Equity/Capital': ['Equity'],
    'Revenue': ['Revenue'],
    'CoGS': ['COGS'],
    'Labor Expense': ['Expense'],
    'Other Revenue & Expense': ['Other Rev & Exp']
};

// Destination category tabs configuration
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

// Color palette for destination tabs
const DESTINATION_TAB_COLORS = [
    '#6c757d', // All - Gray
    '#17a2b8', // Assets - Teal
    '#fd7e14', // Liability - Orange
    '#6f42c1', // Equity - Purple
    '#28a745', // Revenue - Green
    '#e83e8c', // Outside Services - Pink
    '#dc3545', // Product Costs - Red
    '#ffc107', // Labor - Yellow
    '#20c997'  // Other - Teal-Light
];

// API Configuration
const API_CONFIG = {
    baseURL: 'http://trainingsampleapi.satva.solutions/api',
    endpoints: {
        login: '/auth/login',
        verify: '/auth/verify',
        masterData: '/CoAMaster/GetAllMaster',
        destinationData: '/CoAMapping/GetAccountMapping'
    }
};

// UI Configuration
const UI_CONFIG = {
    dropZoneColors: {
        mostLikely: '#D1FAE5',
        likely: '#DBEAFE',
        possible: '#FEF3C7'
    },
    confirmButtonColor: '#667eea'
};

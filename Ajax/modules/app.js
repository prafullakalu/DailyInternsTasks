// ========================================
// APPLICATION MAIN MODULE
// ========================================

const AppModule = {
    // Initialize the main application
    initialize: function() {
        console.log('Initializing Chart of Accounts Standardizer...');
        
        // Load data from localStorage first
        DataModule.loadMappingsFromLocalStorage();
        
        // Load Excel files
        ExcelModule.loadExcelFiles(() => {
            // Once Excel data is loaded, render UI
            this.renderUI();
            
            // Setup all event listeners
            EventModule.initializeEventListeners();
            
            // Update last saved date
            UIModule.updateLastSavedDisplay();
        });
    },

    // Render all UI components
    renderUI: function() {
        UIModule.renderSourceAccounts();
        UIModule.renderDestinationAccounts();
        this.renderDestinationTabs();
    },

    // Render destination category tabs
    renderDestinationTabs: function() {
        const container = $('#destinationTabs');
        container.empty();
        
        DESTINATION_CATEGORIES.forEach((category, index) => {
            const color = DESTINATION_TAB_COLORS[index] || '#6c757d';
            container.append(`
                <li class="nav-item" role="presentation">
                    <button 
                        class="nav-link ${category === 'All' ? 'active' : ''}"
                        data-category="${category}"
                        style="color: ${color}; border-color: ${color};"
                    >
                        ${category}
                    </button>
                </li>
            `);
        });
    }
};

// ========================================
// APPLICATION BOOTSTRAP
// ========================================

$(document).ready(function() {
    console.log('DOM Ready - Starting application initialization');
    AuthModule.initialize();
});

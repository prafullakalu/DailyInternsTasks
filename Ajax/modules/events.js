// ========================================
// EVENT HANDLERS MODULE
// ========================================

const EventModule = {
    // Initialize all event listeners
    initializeEventListeners: function() {
        this.setupCategoryTabs();
        this.setupLogoutButton();
        this.setupClearButton();
        this.setupSubmitButton();
        this.setupDestinationSearch();
        this.setupDestinationFilter();
    },

    // Setup category tab switching
    setupCategoryTabs: function() {
        $(document).off('click', '.main-menu-tabs .nav-link');
        $(document).on('click', '.main-menu-tabs .nav-link', function() {
            AppState.currentCategory = $(this).data('category');
            AppState.searchQuery = '';
            $('#destinationSearch').val('');
            
            UIModule.renderSourceAccounts();
            UIModule.renderDestinationAccounts();
        });
    },

    // Setup logout button
    setupLogoutButton: function() {
        $('#logoutBtn').off('click').on('click', function(e) {
            e.preventDefault();
            AuthModule.logout();
        });
    },

    // Setup clear all mappings button
    setupClearButton: function() {
        $('#clearAllBtn').off('click').on('click', function() {
            Swal.fire({
                title: 'Clear All Mappings?',
                text: 'This action will remove all mappings. Are you sure?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, Clear All'
            }).then((result) => {
                if (result.isConfirmed) {
                    if (DataModule.clearMappings()) {
                        UIModule.renderSourceAccounts();
                        UIModule.renderDestinationAccounts();
                        Swal.fire('Cleared!', 'All mappings have been cleared.', 'success');
                    }
                }
            });
        });
    },

    // Setup submit button
    setupSubmitButton: function() {
        $('#submitBtn').off('click').on('click', function() {
            if (!AppState.hasUnsavedChanges) {
                Swal.fire('No Changes', 'There are no unsaved changes to submit.', 'info');
                return;
            }
            
            if (DataModule.saveMappingsToLocalStorage()) {
                AjaxModule.saveMappings(AppState.mappings, function(success, response) {
                    if (success) {
                        Swal.fire('Success!', 'Mappings saved successfully.', 'success');
                        UIModule.updateLastSavedDisplay();
                    } else {
                        Swal.fire('Error', 'Failed to save mappings to server.', 'error');
                    }
                });
            }
        });
    },

    // Setup destination search
    setupDestinationSearch: function() {
        $('#destinationSearch').off('keyup').on('keyup', function() {
            AppState.searchQuery = $(this).val();
            UIModule.renderDestinationAccounts();
        });
    },

    // Setup destination filter tabs
    setupDestinationFilter: function() {
        $(document).off('click', '.destination-nav-wrapper .nav-link');
        $(document).on('click', '.destination-nav-wrapper .nav-link', function() {
            AppState.destinationFilter = $(this).data('category') || 'All';
            UIModule.renderDestinationAccounts();
        });
    }
};

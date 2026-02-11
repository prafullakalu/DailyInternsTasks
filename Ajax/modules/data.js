// ========================================
// DATA & STORAGE MODULE
// ========================================

const DataModule = {
    // Save mappings to localStorage
    saveMappingsToLocalStorage: function() {
        try {
            localStorage.setItem('mappings', JSON.stringify(AppState.mappings));
            localStorage.setItem('lastSaved', new Date().toLocaleString());
            AppState.hasUnsavedChanges = false;
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // Load mappings from localStorage
    loadMappingsFromLocalStorage: function() {
        try {
            const saved = localStorage.getItem('mappings');
            if (saved) {
                AppState.mappings = JSON.parse(saved);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return false;
        }
    },

    // Clear all mappings
    clearMappings: function() {
        try {
            localStorage.removeItem('mappings');
            AppState.mappings = {};
            AppState.hasUnsavedChanges = false;
            return true;
        } catch (error) {
            console.error('Error clearing mappings:', error);
            return false;
        }
    },

    // Update last saved date
    updateLastSavedDate: function() {
        const lastSaved = localStorage.getItem('lastSaved');
        if (lastSaved) {
            $('#lastUpdatedDate').text(lastSaved);
        }
    },

    // Get all mappings for current category
    getMappingsForCategory: function(category) {
        return AppState.mappings[category] || {};
    },

    // Get mapping for specific source account
    getMappingForAccount: function(category, sourceCode) {
        return AppState.mappings[category]?.[sourceCode] || {};
    },

    // Set mapping for source account
    setMapping: function(category, sourceCode, probability, destCode) {
        if (!AppState.mappings[category]) {
            AppState.mappings[category] = {};
        }
        if (!AppState.mappings[category][sourceCode]) {
            AppState.mappings[category][sourceCode] = {
                mostLikely: null,
                likely: null,
                possible: null
            };
        }
        AppState.mappings[category][sourceCode][probability] = destCode;
        AppState.hasUnsavedChanges = true;
    },

    // Remove mapping
    removeMapping: function(category, sourceCode, probability) {
        if (AppState.mappings[category]?.[sourceCode]) {
            AppState.mappings[category][sourceCode][probability] = null;
            AppState.hasUnsavedChanges = true;
        }
    }
};

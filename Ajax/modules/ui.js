// ========================================
// UI RENDERING MODULE
// ========================================

const UIModule = {
    // Render source accounts list
    renderSourceAccounts: function() {
        const container = $('#sourceAccountsList');
        container.empty();
        
        const categoryMaps = CATEGORY_MAPPINGS[AppState.currentCategory];
        const filtered = AppState.masterData.filter(item => 
            categoryMaps.includes(item.Type)
        );
        
        // Group by category header
        const grouped = {};
        filtered.forEach(item => {
            if (!grouped[item.AccountCategory]) {
                grouped[item.AccountCategory] = [];
            }
            grouped[item.AccountCategory].push(item);
        });
        
        // Render grouped items
        Object.keys(grouped).forEach(category => {
            container.append(`<div class="account-category-header">${category}</div>`);
            grouped[category].forEach(item => {
                const mapping = DataModule.getMappingForAccount(AppState.currentCategory, item.Code);
                const isMapped = mapping.mostLikely || mapping.likely || mapping.possible;
                
                container.append(`
                    <div class="account-list-item" data-code="${item.Code}" data-id="${item.Id}">
                        <div class="account-code">${item.Code}</div>
                        <div class="account-name">${item.Name}</div>
                        ${isMapped ? '<i class="fas fa-check text-success"></i>' : ''}
                    </div>
                `);
            });
        });
        
        // Add drag event listeners
        UIModule.attachDragListeners();
    },

    // Render destination accounts list
    renderDestinationAccounts: function() {
        const container = $('#destinationAccountsList');
        container.empty();
        
        let filtered = AppState.destinationData;
        
        // Filter by selected category
        if (AppState.destinationFilter !== 'All') {
            filtered = filtered.filter(item => item.Category === AppState.destinationFilter);
        }
        
        // Filter by search query
        if (AppState.searchQuery) {
            const query = AppState.searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.Code.toLowerCase().includes(query) ||
                item.Name.toLowerCase().includes(query)
            );
        }
        
        // Group by category header
        const grouped = {};
        filtered.forEach(item => {
            const category = item.Category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        
        // Render grouped items
        Object.keys(grouped).forEach(category => {
            container.append(`<div class="destination-category-header">${category}</div>`);
            grouped[category].forEach(item => {
                container.append(`
                    <div class="destination-account-item" data-code="${item.Code}" data-id="${item.Id}">
                        <span class="account-code">${item.Code}</span>
                        <span class="account-name">${item.Name}</span>
                    </div>
                `);
            });
        });
    },

    // Render mapping zones
    renderMappingZones: function(sourceCode) {
        const container = $('#mappingTableContainer');
        const mapping = DataModule.getMappingForAccount(AppState.currentCategory, sourceCode);
        
        const probabilities = ['mostLikely', 'likely', 'possible'];
        const zones = probabilities.map(prob => {
            const destCode = mapping[prob];
            const destItem = AppState.destinationData.find(d => d.Code === destCode);
            
            return `
                <div class="mapping-zone" data-probability="${prob}">
                    ${destItem ? `<div class="mapping-item">${destItem.Code} - ${destItem.Name}</div>` : ''}
                </div>
            `;
        }).join('');
        
        return zones;
    },

    // Attach drag event listeners
    attachDragListeners: function() {
        $('.account-list-item').draggable({
            helper: 'clone',
            opacity: 0.7,
            cursor: 'move'
        });
    },

    // Update last saved date display
    updateLastSavedDisplay: function() {
        DataModule.updateLastSavedDate();
    }
};

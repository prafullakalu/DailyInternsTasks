// ========================================
// AJAX & API MODULE
// ========================================

const AjaxModule = {
    // Setup token header for all AJAX requests
    setupTokenHeader: function() {
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
                        confirmButtonColor: UI_CONFIG.confirmButtonColor
                    }).then(() => {
                        location.reload();
                    });
                }
            }
        });
    },

    // Fetch master data from API
    fetchMasterData: function(callback) {
        $.ajax({
            url: API_CONFIG.baseURL + API_CONFIG.endpoints.masterData,
            type: 'GET',
            success: function(response) {
                if (response && response.data) {
                    AppState.masterData = response.data;
                    if (callback) callback();
                }
            },
            error: function(xhr) {
                console.error('Error fetching master data:', xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Data Load Error',
                    text: 'Failed to load chart of accounts data',
                    confirmButtonColor: UI_CONFIG.confirmButtonColor
                });
            }
        });
    },

    // Fetch destination data from API
    fetchDestinationData: function(callback) {
        $.ajax({
            url: API_CONFIG.baseURL + API_CONFIG.endpoints.destinationData,
            type: 'GET',
            success: function(response) {
                if (response && response.data) {
                    AppState.destinationData = response.data;
                    if (callback) callback();
                }
            },
            error: function(xhr) {
                console.error('Error fetching destination data:', xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Data Load Error',
                    text: 'Failed to load destination account data',
                    confirmButtonColor: UI_CONFIG.confirmButtonColor
                });
            }
        });
    },

    // Save mappings to API
    saveMappings: function(mappings, callback) {
        $.ajax({
            url: API_CONFIG.baseURL + '/CoAMapping/SaveMapping',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(mappings),
            success: function(response) {
                if (callback) callback(true, response);
            },
            error: function(xhr) {
                console.error('Error saving mappings:', xhr);
                if (callback) callback(false, xhr);
            }
        });
    }
};

// ========================================
// AUTHENTICATION MODULE
// ========================================

const AuthModule = {
    // Initialize login flow
    initialize: function() {
        const currentUser = localStorage.getItem('currentUser');
        const authToken = localStorage.getItem('authToken');
        
        // Always clear password field on login page
        $('#passwordInput').val('');
        $('#emailInput').val('');
        
        if (currentUser && authToken) {
            this.verifyToken(authToken, currentUser);
        } else {
            this.showLoginForm();
        }
    },

    // Verify token is still valid
    verifyToken: function(token, email) {
        $.ajax({
            url: API_CONFIG.baseURL + API_CONFIG.endpoints.verify,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                AppState.currentUser = email;
                AuthModule.showMainApp(email);
            },
            error: function() {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                AppState.currentUser = null;
                AuthModule.showLoginForm();
            }
        });
    },

    // Display login form
    showLoginForm: function() {
        $('#loginContainer').show();
        $('#mainApp').hide();
        $('#passwordInput').val('');
        $('#emailInput').val('');
        this.setupLoginForm();
    },

    // Setup login form event listener
    setupLoginForm: function() {
        $('#loginForm').off('submit').on('submit', function(e) {
            e.preventDefault();
            AuthModule.handleLogin();
        });
    },

    // Handle login submission
    handleLogin: function() {
        const email = $('#emailInput').val().trim();
        const password = $('#passwordInput').val().trim();
        
        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Please enter both email and password',
                confirmButtonColor: UI_CONFIG.confirmButtonColor
            });
            return;
        }
        
        const $submitBtn = $('#loginForm').find('button[type="submit"]');
        const originalBtnText = $submitBtn.html();
        $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>Logging in...');
        
        $.ajax({
            url: API_CONFIG.baseURL + API_CONFIG.endpoints.login,
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
                        confirmButtonColor: UI_CONFIG.confirmButtonColor
                    }).then(() => {
                        AuthModule.showMainApp(email);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: 'No token received from server',
                        confirmButtonColor: UI_CONFIG.confirmButtonColor
                    });
                    $submitBtn.prop('disabled', false).html(originalBtnText);
                }
            },
            error: function(xhr) {
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
                    confirmButtonColor: UI_CONFIG.confirmButtonColor
                });
                $submitBtn.prop('disabled', false).html(originalBtnText);
            }
        });
    },

    // Show main application
    showMainApp: function(email) {
        $('#loginContainer').hide();
        $('#mainApp').show();
        $('#userDisplay').text(email);
        
        AjaxModule.setupTokenHeader();
        AppModule.initialize();
    },

    // Handle logout
    logout: function() {
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
};

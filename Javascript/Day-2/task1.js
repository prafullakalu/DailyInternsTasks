 const statesData = {
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
            'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
            'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
            'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
            'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
            'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
            'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
            'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut']
        };

        const states = Object.keys(statesData);
        let currentCities = [];
        $('#state').on('input', function() {
            const value = $(this).val().toLowerCase();
            const suggestions = states.filter(state => 
                state.toLowerCase().includes(value)
            );  
            if (value && suggestions.length > 0) {
                const html = suggestions.map(state => 
                    `<div class="autocomplete-suggestion" data-value="${state}">${state}</div>`
                ).join('');
                $('#stateList').html(html).show();
            } else {
                $('#stateList').hide();
            }
        });
        
        $(document).on('click', '.autocomplete-suggestion', function() {
            const value = $(this).data('value');
            const parent = $(this).parent();
            
            if (parent.attr('id') === 'stateList') {
                $('#state').val(value);
                currentCities = statesData[value] || [];
                $('#city').val('');
                $('#stateList').hide();
            } else if (parent.attr('id') === 'cityList') {
                $('#city').val(value);
                $('#cityList').hide();
            }
        });
        $('#city').on('input', function() {
            const value = $(this).val().toLowerCase();
            const suggestions = currentCities.filter(city => 
                city.toLowerCase().includes(value)
            );
            
            if (value && suggestions.length > 0) {
                const html = suggestions.map(city => 
                    `<div class="autocomplete-suggestion" data-value="${city}">${city}</div>`
                ).join('');
                $('#cityList').html(html).show();
            } else {
                $('#cityList').hide();
            }
        });
        $(document).click(function(e) {
            if (!$(e.target).closest('.form-group').length) {
                $('.autocomplete-suggestions').hide();
            }
        });
        $('#studentForm').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },
                mobile: {
                    required: true,
                    digits: true,
                    minlength: 10,
                    maxlength: 10
                },
                email: {
                    required: true,
                    email: true
                },
                collegeName: {
                    required: true
                },
                cgpa: {
                    required: true,
                    number: true,
                    min: 0,
                    max: 10
                },
                branch: {
                    required: true
                },
                state: {
                    required: true
                },
                city: {
                    required: true
                },
                zip: {
                    required: true,
                    digits: true,
                    minlength: 6,
                    maxlength: 6
                },
                duration: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: "Please enter your name",
                    minlength: "Name must be at least 2 characters"
                },
                mobile: {
                    required: "Please enter mobile number",
                    digits: "Please enter only digits",
                    minlength: "Mobile number must be 10 digits",
                    maxlength: "Mobile number must be 10 digits"
                },
                email: {
                    required: "Please enter email",
                    email: "Please enter a valid email"
                },
                collegeName: "Please enter college name",
                cgpa: {
                    required: "Please enter CGPA",
                    number: "Please enter a valid number",
                    min: "CGPA must be between 0 and 10",
                    max: "CGPA must be between 0 and 10"
                },
                branch: "Please select a branch",
                state: "Please select a state",
                city: "Please select a city",
                zip: {
                    required: "Please enter zip code",
                    digits: "Please enter only digits",
                    minlength: "Zip code must be 6 digits",
                    maxlength: "Zip code must be 6 digits"
                },
                duration: "Please enter study duration"
            },
            errorClass: 'text-danger small',
            errorElement: 'div',
            highlight: function(element) {
                $(element).addClass('is-invalid');
            },
            unhighlight: function(element) {
                $(element).removeClass('is-invalid');
            },
            submitHandler: function(form) {
                addNew();
                return false;
            }
        });

        function addNew() {
            const formData = {
                name: $('#name').val(),
                mobile: $('#mobile').val(),
                email: $('#email').val(),
                collegeName: $('#collegeName').val(),
                cgpa: $('#cgpa').val(),
                branch: $('#branch').val(),
                state: $('#state').val(),
                city: $('#city').val(),
                zip: $('#zip').val(),
                duration: $('#duration').val()
            };

            let students = JSON.parse(localStorage.getItem('students') || '[]');
            students.push(formData);
            localStorage.setItem('students', JSON.stringify(students));

            $('#studentForm')[0].reset();
            $('#studentForm').validate().resetForm();
            $('.is-invalid').removeClass('is-invalid');
            currentCities = [];
            
            alert('Data added successfully!');
        }

        function exportData() {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            
            if (students.length === 0) {
                alert('No data to export!');
                return;
            }

            const tbody = $('#tableBody');
            tbody.empty();

            students.forEach(student => {
                const row = `
                    <tr>
                        <td>${student.name}</td>
                        <td>${student.mobile}</td>
                        <td>${student.email}</td>
                        <td>${student.collegeName}</td>
                        <td>${student.cgpa}</td>
                        <td>${student.branch}</td>
                        <td>${student.state}</td>
                        <td>${student.city}</td>
                        <td>${student.zip}</td>
                        <td>${student.duration}</td>
                    </tr>
                `;
                tbody.append(row);
            });

            $('#tableContainer').show();
        }

        function clearStorage() {
            if (confirm('Are you sure you want to clear all data?')) {
                localStorage.removeItem('students');
                $('#tableBody').empty();
                $('#tableContainer').hide();
                alert('Storage cleared successfully!');
            }
        }
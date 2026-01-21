let customers = [];

        let currentPage = 1;
        const itemsPerPage = 10;
        let editIndex = -1;
        let deleteIndex = -1;

        function renderTable() {
            const tbody = document.querySelector('#customerTable tbody');
            const search = document.getElementById('searchInput').value.toLowerCase();
            const filterStatus = document.getElementById('statusFilter').value;

            let filtered = customers.filter(c => {
                const matchesSearch = c.name.toLowerCase().includes(search) ||
                                    c.company.toLowerCase().includes(search) ||
                                    c.email.toLowerCase().includes(search) ||
                                    c.mobile.includes(search);
                const matchesFilter = !filterStatus || c.status === filterStatus;
                return matchesSearch && matchesFilter;
            });

            const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageData = filtered.slice(start, end);

            tbody.innerHTML = '';
            if (pageData.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="6" style="text-align:center; color:#999; padding:40px;">No customers found</td>`;
                tbody.appendChild(tr);
            } else {
                pageData.forEach((c, i) => {
                    const globalIndex = customers.indexOf(c);
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${c.name}</td>
                        <td>${c.company}</td>
                        <td>${c.email}</td>
                        <td>${c.mobile}</td>
                        <td class="${c.status.toLowerCase()}">${c.status}</td>
                        <td class="actions">
                            <button onclick="openModal(${globalIndex})">Edit</button>
                            <button onclick="openDeleteModal(${globalIndex})">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
            const pagination = document.getElementById('pagination');
            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }

            pagination.innerHTML = `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>`;
            for (let i = 1; i <= totalPages; i++) {
                pagination.innerHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
            }
            pagination.innerHTML += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;
        }

        function changePage(page) {
            const totalPages = Math.ceil(customers.length / itemsPerPage) || 1;
            if (page < 1 || page > totalPages) return;
            currentPage = page;
            renderTable();
        }

        function openModal(index) {
            editIndex = index;
            document.getElementById('modalTitle').textContent = index === -1 ? 'Add Customer' : 'Edit Customer';

            // Clear previous errors
            document.querySelectorAll('.error').forEach(el => el.textContent = '');

            if (index === -1) {
                document.getElementById('customerForm').reset();
                document.getElementById('status').value = 'Active';
            } else {
                const c = customers[index];
                document.getElementById('name').value = c.name;
                document.getElementById('company').value = c.company;
                document.getElementById('email').value = c.email;
                document.getElementById('mobile').value = c.mobile;
                document.getElementById('address').value = c.address || '';
                document.getElementById('status').value = c.status;
            }
            document.getElementById('formModal').style.display = 'flex';
        }

        function openDeleteModal(index) {
            deleteIndex = index;
            document.getElementById('deleteModal').style.display = 'flex';
        }

        function closeModal(id) {
            document.getElementById(id).style.display = 'none';
        }

        function confirmDelete() {
            if (deleteIndex !== -1) {
                customers.splice(deleteIndex, 1);
                renderTable();
            }
            closeModal('deleteModal');
            deleteIndex = -1;
        }

        // Form validation and save
        document.getElementById('customerForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // Clear previous errors
            document.querySelectorAll('.error').forEach(el => el.textContent = '');

            let valid = true;

            const name = document.getElementById('name').value.trim();
            const company = document.getElementById('company').value.trim();
            const email = document.getElementById('email').value.trim();
            const mobile = document.getElementById('mobile').value.trim();
            const status = document.getElementById('status').value;

            if (!name) {
                document.getElementById('nameError').textContent = 'Name is required';
                valid = false;
            }
            if (!company) {
                document.getElementById('companyError').textContent = 'Company name is required';
                valid = false;
            }
            if (!email) {
                document.getElementById('emailError').textContent = 'Email is required';
                valid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                document.getElementById('emailError').textContent = 'Invalid email format';
                valid = false;
            }
            if (!mobile) {
                document.getElementById('mobileError').textContent = 'Mobile number is required';
                valid = false;
            } else if (!/^\+91[0-9]{10}$/.test(mobile)) {
                document.getElementById('mobileError').textContent = 'Mobile must be +91 followed by 10 digits';
                valid = false;
            }

            if (valid) {
                const customer = {
                    name,
                    company,
                    email,
                    mobile,
                    address: document.getElementById('address').value.trim(),
                    status
                };

                if (editIndex === -1) {
                    customers.push(customer);
                } else {
                    customers[editIndex] = customer;
                }

                renderTable();
                closeModal('formModal');
                editIndex = -1;
            }
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => {
            currentPage = 1;
            renderTable();
        });
        document.getElementById('statusFilter').addEventListener('change', () => {
            currentPage = 1;
            renderTable();
        });

        // Initial render
        renderTable();
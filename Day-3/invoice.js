
   
        let invoices = [];

        let currentPage = 1;
        const itemsPerPage = 10;
        let editIndex = -1;
        let deleteIndex = -1;

        function renderTable() {
            const tbody = document.querySelector('#invoiceTable tbody');
            const search = document.getElementById('searchInput').value.toLowerCase();
            const filterStatus = document.getElementById('statusFilter').value;

            let filtered = invoices.filter(inv => {
                const matchesSearch = inv.number.toLowerCase().includes(search) ||
                                     inv.customer.toLowerCase().includes(search);
                const matchesFilter = !filterStatus || inv.status === filterStatus;
                return matchesSearch && matchesFilter;
            });

            const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageData = filtered.slice(start, end);

            tbody.innerHTML = '';
            if (pageData.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="6" style="text-align:center; color:#999; padding:40px;">No invoices found</td>`;
                tbody.appendChild(tr);
            } else {
                pageData.forEach((inv, i) => {
                    const globalIndex = invoices.indexOf(inv);
                    const statusClass = inv.status === "Paid" ? "paid" :
                                      inv.status === "Partially paid" ? "partial" : "unpaid";
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${inv.number}</td>
                        <td>${inv.customer}</td>
                        <td>${inv.date}</td>
                        <td>${inv.dueDate}</td>
                        <td class="${statusClass}">${inv.status}</td>
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
            const totalPages = Math.ceil(invoices.length / itemsPerPage) || 1;
            if (page < 1 || page > totalPages) return;
            currentPage = page;
            renderTable();
        }

        function openModal(index) {
            editIndex = index;
            document.getElementById('modalTitle').textContent = index === -1 ? 'Add Invoice' : 'Edit Invoice';

            document.querySelectorAll('.error').forEach(el => el.textContent = '');

            if (index === -1) {
                document.getElementById('invoiceForm').reset();
                document.getElementById('paymentStatus').value = 'Unpaid';
            } else {
                const inv = invoices[index];
                document.getElementById('number').value = inv.number;
                document.getElementById('customer').value = inv.customer;
                document.getElementById('date').value = inv.date;
                document.getElementById('dueDate').value = inv.dueDate;
                document.getElementById('qty').value = inv.qty || '';
                document.getElementById('rate').value = inv.rate || '';
                document.getElementById('description').value = inv.description || '';
                document.getElementById('paymentStatus').value = inv.status;
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
                invoices.splice(deleteIndex, 1);
                renderTable();
            }
            closeModal('deleteModal');
            deleteIndex = -1;
        }

        document.getElementById('invoiceForm').addEventListener('submit', function(e) {
            e.preventDefault();

            document.querySelectorAll('.error').forEach(el => el.textContent = '');

            let valid = true;

            const number = document.getElementById('number').value.trim();
            const customer = document.getElementById('customer').value.trim();
            const date = document.getElementById('date').value;
            const dueDate = document.getElementById('dueDate').value;
            const qty = document.getElementById('qty').value;
            const rate = document.getElementById('rate').value;

            if (!number) {
                document.getElementById('numberError').textContent = 'Invoice number is required';
                valid = false;
            } else if (editIndex === -1 && invoices.some(inv => inv.number === number)) {
                document.getElementById('numberError').textContent = 'Invoice number already exists';
                valid = false;
            }

            if (!customer) {
                document.getElementById('customerError').textContent = 'Customer name is required';
                valid = false;
            }
            if (!date) {
                document.getElementById('dateError').textContent = 'Invoice date is required';
                valid = false;
            }
            if (!dueDate) {
                document.getElementById('dueDateError').textContent = 'Due date is required';
                valid = false;
            } else if (dueDate < date) {
                document.getElementById('dueDateError').textContent = 'Due date cannot be before invoice date';
                valid = false;
            }

            if (valid) {
                const invoice = {
                    number,
                    customer,
                    date,
                    dueDate,
                    qty: qty ? parseFloat(qty) : 0,
                    rate: rate ? parseFloat(rate) : 0,
                    description: document.getElementById('description').value.trim(),
                    status: document.getElementById('paymentStatus').value
                };

                if (editIndex === -1) {
                    invoices.push(invoice);
                } else {
                    invoices[editIndex] = invoice;
                }

                renderTable();
                closeModal('formModal');
                editIndex = -1;
            }
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            currentPage = 1;
            renderTable();
        });
        document.getElementById('statusFilter').addEventListener('change', () => {
            currentPage = 1;
            renderTable();
        });

        renderTable();

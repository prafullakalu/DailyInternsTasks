

$(document).ready(function () {

  

    function getExpenses() {
        return JSON.parse(localStorage.getItem("expenses")) || [];
    }

    function saveExpenses(exp) {
        localStorage.setItem("expenses", JSON.stringify(exp));
    }

    function setCookie(name, value, days = 1) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
    }

    function readCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function formatOriginal(amount, currency) {
        return (currency || "₹") + Number(amount).toFixed(2);
    }

    function formatCurrent(val, currency) {
        return currency + Number(val).toFixed(2);
    }

    let ratesToINR = { "₹": 1, "$": 85.5, "€": 92.0 };
    async function loadRates() {
        try {
            const usd = await fetch("https://api.frankfurter.dev/v1/latest?from=USD&to=INR");
            const eur = await fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=INR");
            const usdData = await usd.json();
            const eurData = await eur.json();
            ratesToINR["$"] = usdData.rates.INR || 85.5;
            ratesToINR["€"] = eurData.rates.INR || 92.0;
        } catch (e) {
            console.warn("Rates fetch failed - using fallback");
        }
    }

    function convert(amount, fromCur = "₹", toCur) {
        const inINR = amount * (ratesToINR[fromCur] || 1);
        return inINR / (ratesToINR[toCur] || 1);
    }

    loadRates();

    let currentCurrency = localStorage.getItem("currency") || "₹";
    let currentTheme   = localStorage.getItem("theme") || "light";

    $("html").attr("data-bs-theme", currentTheme);
    $(`input[name="theme"][value="${currentTheme}"]`).prop("checked", true);
    $(`input[name="currency"][value="${currentCurrency}"]`).prop("checked", true);
    $(".currency-symbol").text(currentCurrency);

   
    if ($("#total-income").length) {
        let income = 0, expense = 0;
        const exps = getExpenses();

        exps.forEach(e => {
            const disp = convert(e.amount, e.currency, currentCurrency);
            if (e.type === "income") income += disp;
            else expense += disp;
        });

        $("#total-income").text(formatCurrent(income, currentCurrency));
        $("#total-expenses").text(formatCurrent(expense, currentCurrency));
        $("#balance").text(formatCurrent(income - expense, currentCurrency));
        $("#transactions").text(exps.length);

        // Recent
        const recent = exps.slice(-5).reverse();
        $("#recent-table tbody").html(
            recent.length
                ? recent.map(e => `
                    <tr>
                        <td>${e.date || "—"}</td>
                        <td>${e.title}</td>
                        <td>${formatCurrent(convert(e.amount, e.currency, currentCurrency), currentCurrency)}</td>
                        <td>${e.type}</td>
                    </tr>
                `).join("")
                : '<tr><td colspan="4" class="text-center">No transactions yet</td></tr>'
        );

     
        const ctx = $("#pieChart")[0]?.getContext("2d");
        if (ctx) {
            new Chart(ctx, {
                type: "pie",
                data: {
                    labels: ["Income", "Expense"],
                    datasets: [{ data: [income, expense], backgroundColor: ["#28a745", "#dc3545"] }]
                },
                options: { responsive: true, plugins: { legend: { position: "bottom" } } }
            });
        }
    }

    
    if ($("#expense-form").length) {
        let activeStep = 1;

        function showStep(n) {
            $(".step-content").addClass("d-none");
            $("#step" + n).removeClass("d-none");
            $("#stepper .nav-link").removeClass("active");
            $("#step" + n + "-tab").addClass("active");
            activeStep = n;
        }

        $(".next").on("click", function () {
            let valid = true;

            $("#step" + activeStep + " [required]").each(function () {
                if (!this.value.trim()) {
                    $(this).addClass("is-invalid");
                    valid = false;
                } else $(this).removeClass("is-invalid");
            });

            if (activeStep === 1 && !$('input[name="type"]:checked').length) {
                valid = false;
                $(".form-check-input[name='type']").addClass("is-invalid");
            }

            if (!valid) {
                Swal.fire("Required", "Fill all required fields", "warning");
                return;
            }

            if (activeStep < 3) {
                showStep(activeStep + 1);
                if (activeStep === 3) {
                    $("#conf-title").text($("#title").val() || "—");
                    $("#conf-amount").text($("#amount").val() || "0.00");
                    $("#conf-type").text($('input[name="type"]:checked').val() || "—");
                    $("#conf-category").text($("#category").val() || "—");
                    $("#conf-date").text($("#date").val() || "—");
                    $("#conf-payment").text($("#payment").val() || "—");
                }
            }
        });

        $(".prev").on("click", function () {
            if (activeStep > 1) showStep(--activeStep);
        });

        $("#expense-form").on("submit", function (e) {
            e.preventDefault();

            const entry = {
                title: $("#title").val().trim(),
                amount: Number($("#amount").val()),
                type: $('input[name="type"]:checked').val(),
                category: $("#category").val(),
                date: $("#date").val(),
                payment: $("#payment").val(),
                currency: currentCurrency
            };

            const editIdxStr = $("#edit-index").val();
            let all = getExpenses();

            if (editIdxStr !== "" && !isNaN(editIdxStr)) {
                const idx = parseInt(editIdxStr, 10);
                if (idx >= 0 && idx < all.length) {
                    all[idx] = entry;
                    saveExpenses(all);
                    Swal.fire("Success", "Expense updated", "success");
                } else {
                    Swal.fire("Error", "Invalid edit index", "error");
                    return;
                }
            } else {
                all.push(entry);
                saveExpenses(all);
                Swal.fire("Success", "Expense added", "success");
            }

            location.href = "view-expenses.html";
        });

        $("#cancel").on("click", function () {
            Swal.fire({ title: "Discard?", showCancelButton: true }).then(r => {
                if (r.isConfirmed) location.href = "view-expenses.html";
            });
        });

      
        const cookieData = readCookie("editExpense");
        if (cookieData) {
            try {
                const data = JSON.parse(cookieData);
                $("#title").val(data.title || "");
                $("#amount").val(data.amount || 0);
                $(`input[name="type"][value="${data.type}"]`).prop("checked", true);
                $("#category").val(data.category || "");
                $("#date").val(data.date || "");
                $("#payment").val(data.payment || "");
                $("#edit-index").val(data.index !== undefined ? data.index : "");
                showStep(1);
            } catch (err) {
                console.error("Failed to parse edit cookie:", err);
                Swal.fire("Error", "Could not load edit data", "error");
            }
     
            document.cookie = "editExpense=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } else {
            showStep(1);
        }
    }

  

    if ($("#expenses-tbody").length) {
        function refreshTable() {
            let list = getExpenses();

            const q = $("#search").val().toLowerCase().trim();
            if (q) list = list.filter(e => e.title.toLowerCase().includes(q));

            const t = $("#filter-type").val();
            if (t !== "all") list = list.filter(e => e.type === t);

            const s = $("#sort").val();
            list.sort((a,b) => {
                const da = a.date ? new Date(a.date) : new Date(0);
                const db = b.date ? new Date(b.date) : new Date(0);
                return s === "date-asc" ? da - db : db - da;
            });

            const rows = list.length ? list.map((e, i) => `
                <tr>
                    <td>${e.title}</td>
                    <td>${formatOriginal(e.amount, e.currency)}</td>
                    <td>${e.type}</td>
                    <td>${e.category || ""}</td>
                    <td>${e.date || ""}</td>
                    <td>${e.payment || ""}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-btn" data-i="${i}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-i="${i}">Delete</button>
                    </td>
                </tr>
            `).join("") : '<tr><td colspan="7" class="text-center py-4">No expenses found</td></tr>';

            $("#expenses-tbody").html(rows);
        }

        refreshTable();
        $("#search, #filter-type, #sort").on("input change", refreshTable);

        $(document).on("click", ".edit-btn", function () {
            const i = $(this).data("i");
            const record = getExpenses()[i];
            if (record) {
                // Store edited data in cookie
                const cookieValue = JSON.stringify({ index: i, ...record });
                document.cookie = `editExpense=${cookieValue}; path=/; max-age=600`;
                location.href = "add-expense.html";
            }
        });

        $(document).on("click", ".delete-btn", function () {
            const i = $(this).data("i");
            Swal.fire({
                title: "Delete this expense?",
                icon: "warning",
                showCancelButton: true
            }).then(r => {
                if (r.isConfirmed) {
                    let all = getExpenses();
                    all.splice(i, 1);
                    saveExpenses(all);
                    refreshTable();
                    Swal.fire("Deleted", "", "success");
                }
            });
        });
    }

    // ────────────────────────────────────────────────
    // SETTINGS
    // ────────────────────────────────────────────────

    if ($("#clear-data").length) {
        $("input[name='currency']").change(function () {
            const newCur = this.value;
            if (newCur === currentCurrency) return;

            Swal.fire({
                title: "Change currency?",
                text: "Dashboard will update. View Expenses keeps original values.",
                icon: "question",
                showCancelButton: true
            }).then(r => {
                if (r.isConfirmed) {
                    localStorage.setItem("currency", newCur);
                    location.reload();
                } else {
                    $(`input[name="currency"][value="${currentCurrency}"]`).prop("checked", true);
                }
            });
        });

        $("input[name='theme']").change(function () {
            localStorage.setItem("theme", this.value);
            $("html").attr("data-bs-theme", this.value);
        });

        $("#clear-data").click(function () {
            Swal.fire({
                title: "Clear all data?",
                text: "This cannot be undone",
                icon: "warning",
                showCancelButton: true
            }).then(r => {
                if (r.isConfirmed) {
                    localStorage.clear();
                    location.reload();
                }
            });
        });
    }
});
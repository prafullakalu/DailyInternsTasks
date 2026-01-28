
let token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

let reconciledIds = JSON.parse(localStorage.getItem("reconciledIds")) || [];
let excludedIds = JSON.parse(localStorage.getItem("excludedIds")) || [];

let selectedExpense = null;
let selectedIncome = null;

$(document).ready(function () {
    loadTransactions();
    initDragDrop();
});

function loadTransactions() {

 
    let data = JSON.parse(localStorage.getItem("transactions")) || [];

    console.log("Loaded Transactions:", data);

    renderTransactions(data);
}

function renderTransactions(data) {

    $("#company1List").empty(); // Expenses
    $("#company2List").empty(); // Income
    $("#dropZone").empty();

    data.forEach(function (t, index) {

        if (reconciledIds.includes(index)) return;
        if (excludedIds.includes(index)) return;

        let amount = Number(t.amount || 0);

        let li = `
            <li class="txn"
                data-index="${index}"
                data-amount="${amount}">
                <b>${t.title}</b>
                <span>Amount: ${amount}</span>
                <span>Category: ${t.category}</span>
                <span>Date: ${t.date}</span>
                <button class="excludeBtn">Exclude</button>
            </li>
        `;

        if (t.type === "expense") {
            $("#company1List").append(li);
        } else if (t.type === "income") {
            $("#company2List").append(li);
        }
    });
}

$(document).on("click", "#company1List .txn", function () {
    $("#company1List .txn").removeClass("active");
    $(this).addClass("active");
    selectedExpense = $(this);
});

$(document).on("click", ".excludeBtn", function (e) {
    e.stopPropagation();

    let index = $(this).closest(".txn").data("index");
    excludedIds.push(index);
    localStorage.setItem("excludedIds", JSON.stringify(excludedIds));

    loadTransactions();
});

function initDragDrop() {

    new Sortable(document.getElementById("company2List"), {
        group: {
            name: "reconcileGroup",
            pull: "clone",
            put: false
        },
        sort: false
    });

    new Sortable(document.getElementById("dropZone"), {
        group: "reconcileGroup",
        onAdd: function (evt) {
            selectedIncome = $(evt.item);
        }
    });
}


$("#reconcileBtn").on("click", function () {

    if (!selectedExpense || !selectedIncome) {
        alert("Select an Expense and drag an Income");
        return;
    }

    let expenseAmount = Number(selectedExpense.data("amount"));
    let incomeAmount = Number(selectedIncome.data("amount"));

    if (expenseAmount !== incomeAmount) {
        alert("Amounts must match");
        return;
    }

    let expenseIndex = selectedExpense.data("index");
    let incomeIndex = selectedIncome.data("index");

    reconciledIds.push(expenseIndex, incomeIndex);
    localStorage.setItem("reconciledIds", JSON.stringify(reconciledIds));

    selectedExpense = null;
    selectedIncome = null;

    loadTransactions();
});


function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

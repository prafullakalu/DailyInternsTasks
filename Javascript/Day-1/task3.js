const formInputs = [
    document.getElementById("name"),
    document.getElementById("mobile"),
    document.getElementById("dob"),
    document.getElementById("gender"),
    document.getElementById("income"),
    document.getElementById("loan"),
    document.getElementById("investment")
];
const calculateBtn = document.querySelector('.btn-success');
calculateBtn.addEventListener('click', function (e) {
    let isValid = true;
    formInputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    if (isValid) {
        calculateTax();
    }
});
function calculateTax() {
    const name = document.getElementById("name").value;
    const gender = document.getElementById("gender").value;
    const income = Number(document.getElementById("income").value);
    const loan = Number(document.getElementById("loan").value);
    const investment = Number(document.getElementById("investment").value);

    const loanExemption = loan * 0.80;
    const investmentExemption = Math.min(investment, 100000);

    let taxableAmount = income - loanExemption - investmentExemption;
    if (taxableAmount < 0) taxableAmount = 0;

    let tax = 0;

    if (gender === "Men") {
        if (taxableAmount > 600000) tax = taxableAmount * 0.20;
        else if (taxableAmount > 240000) tax = taxableAmount * 0.10;
    } else if (gender === "Women") {
        if (taxableAmount > 700000) tax = taxableAmount * 0.20;
        else if (taxableAmount > 260000) tax = taxableAmount * 0.10;
    } else if (gender === "Senior Citizen") {
        if (taxableAmount > 700000) tax = taxableAmount * 0.20;
        else if (taxableAmount > 300000) tax = taxableAmount * 0.10;
    }

    document.getElementById("outName").innerText = name;
    document.getElementById("outTaxable").innerText = taxableAmount.toFixed(2);
    document.getElementById("outTax").innerText = tax.toFixed(2);

    const outputBox = document.getElementById("outputBox");
    outputBox.style.backgroundColor = tax === 0 ? "#2e7d32" : "#0b1c2d ";
}

function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("dob").value = "";
    document.getElementById("gender").value = "";
    document.getElementById("income").value = "";
    document.getElementById("loan").value = "";
    document.getElementById("investment").value = "";
    document.getElementById("outName").innerText = "";
    document.getElementById("outTaxable").innerText = "";
    document.getElementById("outTax").innerText = "";

}

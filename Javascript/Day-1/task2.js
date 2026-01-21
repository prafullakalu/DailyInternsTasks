const steps = document.querySelectorAll('.step')
const dots = document.querySelectorAll('.stepDots span')
const nextBtn = document.getElementById('nextBtn')
const preBtn = document.getElementById('preBtn')
const form = document.getElementById('registrationForm')

let currentStep = 0

function showStep(index) {
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === index)
        dots[i].classList.toggle('active', i === index)
    })

    preBtn.style.display = index === 0 ? 'none' : 'inline-block'
    nextBtn.style.display = index === steps.length - 1 ? 'none' : 'inline-block'

    if (index === steps.length - 1) fillSummary()
}

function validateCurrentStep() {
    const inputs = steps[currentStep].querySelectorAll('input, select')
    let isValid = true

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            input.classList.add('is-invalid')
            isValid = false
        } else {
            input.classList.remove('is-invalid')
        }
    })
    if (currentStep === 1) {
        if (password.value !== confirmPassword.value) {
            confirmPassword.classList.add('is-invalid')
            isValid = false
        }
    }
    return isValid
}
function nextStep() {
    if (!validateCurrentStep()) return
    currentStep++
    showStep(currentStep)
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--
        showStep(currentStep)
    }
}

function fillSummary() {
    summary.innerHTML = `
        <tr><td>First Name</td><td>${firstName.value}</td></tr>
        <tr><td>Last Name</td><td>${lastName.value}</td></tr>
        <tr><td>Gender</td><td>${gender.value}</td></tr>
        <tr><td>Zip Code</td><td>${zip.value}</td></tr>
        <tr><td>Email</td><td>${email.value}</td></tr>
        <tr><td>Username</td><td>${username.value}</td></tr>
        <tr><td>Bank</td><td>${bank.value}</td></tr>
        <tr><td>Branch</td><td>${branch.value}</td></tr>
        <tr><td>Account Type</td><td>${accountType.value}</td></tr>
        <tr><td>Account Number</td><td>${accountNumber.value}</td></tr>
        <tr><td>Payment Type</td><td>${paymentType.value}</td></tr>
        <tr><td>Holder Name</td><td>${holderName.value}</td></tr>
        <tr><td>Card Number</td><td>${cardNumber.value}</td></tr>
        <tr><td>Expiry</td><td>${expiry.value}</td></tr>
    `
}

form.addEventListener('submit', e => {
    e.preventDefault()
    alert('Form submitted successfully')

    form.reset()
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'))

    currentStep = 0
    showStep(currentStep)
})

showStep(currentStep)

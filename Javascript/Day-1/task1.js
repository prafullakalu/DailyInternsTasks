const textBox1 = document.getElementById('textBox1');
const textBox2 = document.getElementById('textBox2');
const textBox3 = document.getElementById('textBox3');
const textBox4 = document.getElementById('textBox4');

function calculateResult() {
    const num1 = parseFloat(textBox1.value);
    const num2 = parseFloat(textBox2.value);

    if (isNaN(num1) || isNaN(num2)) {
        alert('T1 and T2 must be valid numbers');
        return;
    }
    const parts = textBox3.value.split(',');
    let secondValue = 0;
    let hasValidNumber = false;

    for (let i = 0; i < parts.length; i++) {
        const value = parseFloat(parts[i].trim());
        if (!isNaN(value)) {
            secondValue += value;
            hasValidNumber = true;
        }
    }
    if (!hasValidNumber) {
        alert('T3 must contain comma-separated numbers');
        return;
    }

    const firstValue = num1 + num2;
    const thirdValue = firstValue + secondValue;

    textBox4.value = firstValue + ' | ' + secondValue + ' | ' + thirdValue;
}

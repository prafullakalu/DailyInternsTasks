$(document).ready(function() {
    let displayValue = '0';
    let expression = '';  // Full expression like "12+12+5"
    let lastInputOperator = false;

    const showDisplay = val => $('#display').text(val);

    const resetCalculator = () => {
        displayValue = '0';
        expression = '';
        lastInputOperator = false;
        showDisplay(displayValue);
    }

    const inputNumber = num => {
        if(displayValue === '0' || lastInputOperator) {
            displayValue = num;
        } else {
            displayValue += num;
        }
        expression += num;
        lastInputOperator = false;
        showDisplay(expression);
    }

    const inputDecimal = () => {
        if(!displayValue.includes('.')) {
            displayValue += '.';
            expression += '.';
            lastInputOperator = false;
        }
        showDisplay(expression);
    }

    const inputOperator = op => {
        const opMap = { add: '+', subtract: '-', multiply: '*', divide: '/' };
        if(!lastInputOperator) {
            expression += opMap[op];
        } else {
            // Replace last operator if user presses consecutively
            expression = expression.slice(0,-1) + opMap[op];
        }
        lastInputOperator = true;
        showDisplay(expression);
    }

    const calculateResult = () => {
        try {
            let result = eval(expression); // Evaluate expression
            if(!isFinite(result)) { alert('Cannot divide by zero'); resetCalculator(); return; }
            result = +result.toFixed(8); // Fix floating point errors
            displayValue = result.toString();
            expression = displayValue; // allow chaining
            lastInputOperator = false;
            showDisplay(expression);
        } catch(e) {
            alert('Invalid Expression');
            resetCalculator();
        }
    }

    const calculatePercentage = () => {
        let lastNumber = displayValue;
        let percentValue = parseFloat(lastNumber)/100;
        displayValue = percentValue.toString();
        expression = expression.slice(0, -lastNumber.length) + displayValue;
        showDisplay(expression);
    }

    // Button bindings
    $('[data-number]').click(function() { inputNumber($(this).data('number').toString()); });
    $('[data-action="decimal"]').click(inputDecimal);
    $('[data-action="clear"]').click(resetCalculator);
    $('[data-action="calculate"]').click(calculateResult);
    $('[data-action="percentage"]').click(calculatePercentage);
    $('[data-action="add"], [data-action="subtract"], [data-action="multiply"], [data-action="divide"]')
        .click(function(){ inputOperator($(this).data('action')); });

    showDisplay(displayValue);
});

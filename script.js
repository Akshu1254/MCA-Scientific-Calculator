const display = document.getElementById("display");
const expressionLine = document.getElementById("expression");
const angleButton = document.getElementById("angleMode");

let expression = "";
let answer = 0;
let isDegree = true;

function render() {
    display.value = expression || "0";
    angleButton.textContent = isDegree ? "DEG" : "RAD";
}

function append(value) {
    if (expression === "Error") {
        expression = "";
    }

    if (expression === "0" && /^[0-9.]$/.test(value)) {
        expression = "";
    }

    expression += value;
    render();
}

function clearAll() {
    expression = "";
    expressionLine.textContent = "Ready";
    render();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    render();
}

function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) {
        throw new Error("Invalid factorial");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}

function calculate() {
    if (!expression) return;

    try {
        let exp = expression
            .replaceAll("×", "*")
            .replaceAll("÷", "/")
            .replaceAll("π", "PI")
            .replace(/\bAns\b/g, `(${answer})`)
            .replace(/\be\b/g, "E")
            .replaceAll("^", "**");

        exp = exp
            .replace(/√\(/g, "sqrt(")
            .replace(/log\(/g, "log10(")
            .replace(/ln\(/g, "log(");

        exp = exp
            .replace(/(\d+(?:\.\d+)?)!/g, "factorial($1)")
            .replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        const toRad = x => isDegree ? x * Math.PI / 180 : x;

        const sin = x => Math.sin(toRad(x));
        const cos = x => Math.cos(toRad(x));
        const tan = x => Math.tan(toRad(x));

        const sqrt = Math.sqrt;
        const log10 = Math.log10;
        const log = Math.log;
        const PI = Math.PI;
        const E = Math.E;

        if (!/^[0-9+\-*/().,\sA-Za-z_]*$/.test(exp)) {
            throw new Error("Invalid input");
        }

        const result = Function(
            "sin", "cos", "tan",
            "sqrt", "log10", "log",
            "factorial", "PI", "E",
            `"use strict"; return (${exp})`
        )(
            sin, cos, tan,
            sqrt, log10, log,
            factorial, PI, E
        );

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Math error");
        }

        answer = Number.parseFloat(result.toPrecision(12));

        expressionLine.textContent = expression + " =";
        expression = String(answer);

    } catch (error) {
        expressionLine.textContent = "Invalid Expression";
        expression = "Error";
    }

    render();
}

// Button clicks
document.querySelector(".buttons").addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;

    if (action === "clear") {
        clearAll();
    }
    else if (action === "delete") {
        deleteLast();
    }
    else if (action === "equals") {
        calculate();
    }
    else {
        append(button.dataset.value);
    }

});

// DEG / RAD toggle
angleButton.addEventListener("click", function() {
    isDegree = !isDegree;
    render();
});

// Keyboard support
document.addEventListener("keydown", function(event) {

    if (/^[0-9.]$/.test(event.key)) {
        append(event.key);
    }
    else if (["+", "-", "(", ")"].includes(event.key)) {
        append(event.key);
    }
    else if (event.key === "*") {
        append("×");
    }
    else if (event.key === "/") {
        event.preventDefault();
        append("÷");
    }
    else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
    }
    else if (event.key === "Backspace") {
        deleteLast();
    }
    else if (event.key === "Escape") {
        clearAll();
    }

});

render();

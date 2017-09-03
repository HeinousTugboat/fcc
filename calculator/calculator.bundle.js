/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class Operator {
    constructor(symbol, execute, precedence = 0, associativity = 'Left') {
        this.symbol = symbol;
        this.execute = execute;
        this.precedence = precedence;
        this.associativity = associativity;
        Operator.dict[this.symbol] = this;
    }
    toString() {
        return this.symbol;
    }
}
Operator.dict = {};
const ops = {
    Add: (a, b) => a + b,
    Subtract: (a, b) => a - b,
    Multiply: (a, b) => a * b,
    Divide: (a, b) => a / b,
};
function isOperator(op) {
    return (op.execute) !== undefined;
}
function isOperand(op) {
    return !isOperator(op) && op !== '(' && op !== ')' || typeof op === 'number';
}
class Calculator {
    constructor() {
        this.history = [];
        new Operator('+', ops.Add, 2);
        new Operator('-', ops.Subtract, 2);
        new Operator('*', ops.Multiply, 3);
        new Operator('/', ops.Divide, 3);
        this.main = document.getElementsByTagName('main')[0];
        this.display = document.getElementById('display');
        this.buttons = document.getElementById('buttons');
        this.buttons.addEventListener('click', this.buttonHandler.bind(this));
    }
    buttonHandler(ev) {
        let target = ev.target;
        let data = ev.target.dataset;
        if (data.num) {
            this.expression += data.num;
            console.log('Expression: ' + this.expression);
            if (this.rpnTokens.length >= 3) {
                try {
                    this.execute();
                }
                catch (err) {
                    console.error('Oops!', err);
                }
            }
        }
        else if (data && data.op) {
            if (Operator.dict[data.op] || data.op === '(' || data.op === ')') {
                this.expression += data.op;
                if (data.op === ')') {
                    console.log('Expression: ' + this.expression);
                    this.execute();
                }
            }
            else if (data.op === 'C') {
                this.expression = '';
                this.history = [];
                this.display.innerHTML = '-';
                console.log('History Cleared');
            }
            else if (data.op === 'CE') {
                console.log('Stepping Back: ' + this.history.pop());
                this.expression = this.history.pop() || '';
                this.execute();
            }
            else if (data.op === 'p') {
                console.log('expression:', this.toString().expression);
                this.toString().history.forEach((x, i) => console.log(i + ': ' + this.execute(i) + ' = ' + x));
            }
            else if (data.op === '=') {
            }
            else if (data.op === '%') {
            }
            else if (data.op === '+-') {
            }
            else if (data.op === '.') {
            }
            else {
                console.error('Unrecognized Operator...', target, data);
            }
        }
        else {
            console.error('Unknown Button...', target, data);
        }
    }
    convert(str) {
        let arr = str.match(/([+\-\/*\(\)]|[0-9]+)/gm);
        if (!arr || !arr.length) {
            return [];
        }
        else {
            return arr.reduce((acc, val) => {
                if (Operator.dict[val]) {
                    acc.push(Operator.dict[val]);
                }
                else if (val === '(' || val === ')') {
                    acc.push(val);
                }
                else if (val !== undefined && val !== null && val !== '') {
                    acc.push(+val);
                }
                return acc;
            }, []);
        }
    }
    parseToString(arr) {
        return arr.reduce((acc, val) => {
            if (isOperator(val)) {
                acc += val.symbol;
            }
            else {
                acc += '' + val;
            }
            return acc + '';
        }, '');
    }
    shuntingYard(tokens) {
        let input = [...tokens];
        let output = [];
        let operators = [];
        while (input.length) {
            let token = input.shift();
            if (token === undefined) {
                break;
            }
            if (isOperand(token)) {
                output.push(token);
            }
            else if (isOperator(token)) {
                let op = operators.pop();
                while (op && isOperator(op) && op.precedence >= token.precedence && op.associativity === 'Left') {
                    output.push(op);
                    op = operators.pop();
                }
                op && operators.push(op);
                operators.push(token);
            }
            else if (token == '(') {
                operators.push(token);
            }
            else if (token == ')') {
                let op = operators.pop();
                while (op && op !== '(') {
                    isOperator(op) && output.push(op);
                    op = operators.pop();
                    if (!op) {
                        throw new Error('Did not find a left bracket!');
                    }
                }
            }
        }
        while (operators.length) {
            let op = operators.pop();
            (op !== undefined) && output.push(op);
        }
        return {
            output, input, operators
        };
    }
    execute(p) {
        let input;
        if (typeof p === 'number') {
            input = this.shuntingYard(this.convert(this.history[p])).output;
        }
        else if (typeof p === 'string') {
            input = this.shuntingYard(this.convert(p)).output;
        }
        else {
            input = [...this.rpnTokens];
        }
        let stack = [];
        while (input.length) {
            let op = input.shift();
            if (op === undefined)
                break;
            if (isOperand(op)) {
                stack.push(op);
            }
            else if (isOperator(op)) {
                let b = stack.pop();
                let a = stack.pop();
                stack.push(op.execute(a, b));
            }
        }
        if (stack.length > 1) {
            throw new Error('Items left in the stack! Ohnoes! :>>\n\n stack:' + JSON.stringify(stack) + '\n input:' + JSON.stringify(input) + '\n expr: ' + this.expression + '\n\n');
        }
        this.display.innerHTML = stack[0];
        console.log('Result: ' + stack[0]);
        return stack[0];
    }
    set expression(str) {
        this.history.push(str);
        this.exprTokens = this.convert(str);
        this.rpnTokens = this.shuntingYard(this.exprTokens).output;
    }
    get expression() {
        if (this.exprTokens) {
            return this.parseToString(this.exprTokens);
        }
        else {
            return '';
        }
    }
    toString() {
        return { expression: this.exprTokens.map(x => x.toString()).join(''), history: this.history };
    }
}
let calc = new Calculator;


/***/ })
/******/ ]);
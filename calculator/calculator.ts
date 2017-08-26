/***
 * Calculator! Thing! So.. the idea is you can create a new Calculator, then use
 * it to process a series of Operators and Operands.
 * https://codepen.io/HeinousTugboat/pen/Gvddzv
 *
 * User Stories:
 *   - I can add, subtract, multiply and divide two numbers.
 *   - I can clear the input field with a clear button.
 *   - I can keep chaining mathematical operations together until I hit the
 *     equal button, and the calculator will tell me the correct output.
 *
 * https://www.freecodecamp.org/challenges/build-a-javascript-calculator
 *
 * http://www.alcula.com/images/printingcalculatorbig.jpg
 * http://www.topappreviews101.com/ipappimg/7866/-accountant-for-ipad-adding-machine-calc-calculator-with-paper-tape-screenshot-1.jpg
 * http://is5.mzstatic.com/image/thumb/Purple118/v4/df/df/9c/dfdf9c1f-0357-699e-5251-8ec33006fd14/source/175x175bb.jpg
 *
 * - TODO: 12*0+0 returns NaN. Fix.
 * - TODO: Implement the rest of the buttons..
 * - TODO: Keyup handler..
 * - TODO: Wire up the display..
 * - TODO: Wire up the tape roll..
 */

/**
    * An operand in an equation, should always be a number or a result of an
    * Operator.
    */
type Operand = number;

/** An Operator. Accepts two Operands and returns a new Operand */
class Operator {
    /** Dictionary of all registered operators. */
    static dict: { [key: string]: Operator } = {};

    constructor(public symbol: string,
        public execute: (a?: Operand, b?: Operand) => Operand,
        public precedence: number = 0,
        public associativity: 'Left' | 'Right' = 'Left') {
        Operator.dict[this.symbol] = this;
    }
    toString(): string {
        return this.symbol;
    }
}

const ops = {
    Add: (a: number, b: number): number => a + b,
    Subtract: (a: number, b: number): number => a - b,
    Multiply: (a: number, b: number): number => a * b,
    Divide: (a: number, b: number): number => a / b,
}

/**
 * Represents both Operands and Operators, generally any unit that might be
 * found in an expression.
 */
type Token = Operand | Operator | '(' | ')';

/**
 * Tests to see if given Token is an Operator. Verifies the presence of an
 * *execute* function.
 */
function isOperator(op: Token): op is Operator {
    return ((<Operator>op).execute) !== undefined;
}

/**
 * Tests to see if given Token is an Operand. Anything that isn't an Operator
 * and is a Token is an Operand.
 */
function isOperand(op: Token): op is Operand {
    return !isOperator(op) && op !== '(' && op !== ')';
}

/** The core class. This should be the central class for processing the math. */
class Calculator {
    private exprTokens: Token[];
    private rpnTokens: Token[];
    private history: string[] = [];
    private main: HTMLElement;
    private display: HTMLElement;
    private buttons: HTMLElement;
    constructor() {
        new Operator('+', ops.Add, 2);
        new Operator('-', ops.Subtract, 2);
        new Operator('*', ops.Multiply, 3);
        new Operator('/', ops.Divide, 3);
        this.main = document.getElementsByTagName('main')[0] as HTMLElement;
        this.display = document.getElementById('display') as HTMLElement;
        this.buttons = document.getElementById('buttons') as HTMLElement;
        this.buttons.addEventListener('click', this.buttonHandler.bind(this));
    }
    private buttonHandler(ev: Event) {
        let target = ev.target;
        let data = (ev.target as HTMLElement).dataset;
        if (data.num) {
            this.expression += data.num;
        } else if (data && data.op) {
            if (Operator.dict[data.op as string] || data.op === '(' || data.op === ')') {
                this.expression += data.op;
            } else if (data.op === 'C') {
                this.expression = '';
                this.history = [];
                console.log('History Cleared');
            } else if (data.op === 'CE') {
                console.log('Stepping Back: '+this.history.pop());
                this.expression = this.history.pop() || '';
                console.log('Stepped back');
            } else {
                console.error('Unrecognized Operator...', target, data);
            }
        } else {
            console.error('Unknown Button...', target, data);
        }
        if (this.rpnTokens.length >= 3) {
            try {
                console.log('Result: ' + this.execute());
            } catch (err) {
                console.error('Oops!', err);
            }
        }
        console.log('Expression: ' + this.expression);
        // console.log('pow:', target, data);
    }
    /**
     * Converts an array of symbols into an array of Tokens. Checks if the symbol is
     * registered in the Operator dictionary first, and if it isn't, casts the
     * symbol to a number.
     */
    private convert(str: string): Token[] {
        return str.split(/([+\-\/*\(\)])/).reduce((acc: Token[], val: string) => {
            if (Operator.dict[val]) {
                acc.push(Operator.dict[val]);
            } else if (val === '(' || val === ')') {
                acc.push(val);
            } else {
                acc.push(+val);
            }
            return acc;
        }, <Token[]>[]);
    }

    /**
     * Converts an array of Tokens back into a string, either by referencing the
     * Operator's symbol or by casting the Opernad to a string.
     */
    private parseToString(arr: Token[]): string {
        return arr.reduce((acc, val) => {
            if (isOperator(val)) {
                acc += val.symbol;
            } else {
                acc += '' + val;
            }
            return acc + '';
        }, '');
    }

    /**
     * Dijkstra's [Shunting-yard
     * Algorithm](https://www.wikiwand.com/en/Shunting-yard_algorithm). Sort of.
     * Doesn't handle Precedence or Associativity yet.
     */
    private shuntingYard(tokens: Token[]) {
        let input: Token[] = [...tokens];
        let output: Token[] = [];
        let operators: (Operator | '(' | ')')[] = [];
        while (input.length) {
            let token = input.shift();
            if (!token) { continue; }
            if (isOperand(token)) {
                output.push(token)
            } else if (isOperator(token)) {
                let op = operators.pop();
                while (op && isOperator(op) && op.precedence >= token.precedence && op.associativity === 'Left') {
                    output.push(op);
                    op = operators.pop();
                }
                op && operators.push(op);
                operators.push(token);
            } else if (token == '(') {
                operators.push(token);
            } else if (token == ')') {
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
            op && output.push(op);
        }
        return {
            output, input, operators
        };
    }

    /**
     * Instructs the calculator to process its entire expression, returning the
     * result.
     */
    execute(): number
    execute(history?: number): number
    execute(expr?: string): number
    execute(p?: string | number): number {
        let input: Token[];
        if (typeof p === 'number') {
            input = this.shuntingYard(this.convert(this.history[p])).output;
        } else if (typeof p === 'string') {
            input = this.shuntingYard(this.convert(p)).output;
        } else {
            input = [...this.rpnTokens];
        }
        let stack: Token[] = [];
        while (input.length) {
            let op = input.shift();
            if (!op) break;
            if (isOperand(op)) {
                stack.push(op);
            } else if (isOperator(op)) {
                let b = stack.pop();
                let a = stack.pop();
                stack.push(op.execute(<Operand>a, <Operand>b));
            }
        }
        if (stack.length > 1) {
            throw new Error('Items left in the stack! Ohnoes! :>>\n\n stack:' + JSON.stringify(stack) + '\n input:' + JSON.stringify(input) + '\n expr: ' + this.expression + '\n\n');
        }
        return stack[0] as Operand;
    }

    /**
     * Sets the calculator's expression, this function adds the new expression
     * the history, converts the string into tokens, and then processes the
     * tokens through the Shunting-yard Algorithm. Probably not the best idea,
     * since it's a setter, but it works well enough for now.
     */
    set expression(str: string) {
        this.history.push(str);
        this.exprTokens = this.convert(str);
        this.rpnTokens = this.shuntingYard(this.exprTokens).output;
    }
    /**
     * Gets the calculator's expression. Essentially just iterates over the
     * expression token list and converts it to strings. The calculators
     * expression tokens and RPN tokens should always match, that's why the
     * setter handles the primary conversion.
     */
    get expression(): string {
        if (this.exprTokens) {
            return this.parseToString(this.exprTokens);
        } else {
            return '';
        }
    }
    toString(): { expression: string, history: string[] } {
        return { expression: this.exprTokens.map(x => x.toString()).join(''), history: this.history };
    }
}



/******************************************************************************/
// Test Execution Area:

let calc = new Calculator;
// console.log('x: '+calc.execute('2*3+4')+ ' = 2*3+4');
// calc.expression = '2*(2+2+2)*2';
// calc.expression = '4+(9/3)*(2*4/2)';
// calc.expression = '2';
// calc.expression += '+3';
// calc.expression += '*4';

// console.log('expression:', calc.toString().expression);
// calc.toString().history.forEach((x,i)=>console.log(i+': '+calc.execute(i)+' = '+x));


/***
 * Calculator! Thing! So.. the idea is you can create a new Calculator, then use
 * it to process a series of Operators and Operands.
 *
 * User Stories:
 *   - I can add, subtract, multiply and divide two numbers.
 *   - I can clear the input field with a clear button.
 *   - I can keep chaining mathematical operations together until I hit the
 *     equal button, and the calculator will tell me the correct output.
 *
 * https://www.freecodecamp.org/challenges/build-a-javascript-calculator
 */

/**
 * An operand in an equation, should always be a number or a result of an
 * Operator.
 */
type Operand = number;

/** An Operator. Accepts two Operands and returns a new Operand */
abstract class Operator {
    /**
     * Execute this particular operator's command, returning the calculated
     * result.
     */
    abstract execute(a?: Operand, b?: Operand): Operand;

    /** Symbol used for this operator in strings. */
    abstract symbol: string;

    abstract precedence: number = 0;
    abstract associativity = 'Left';

    /** Dictionary of all registered operators. */
    static dict: { [key: string]: { new (): Operator } } = {};
    /** Registers a new operator into the dictionary. */
    static register(op: { symbol: string, new (): Operator }) {
        this.dict[op.symbol] = op;
    }
}
/**
 * Represents both Operands and Operators, generally any unit that might be
 * found in an expression.
 */
type Token = Operand | Operator | '(' | ')';

/** Executes a+b */
class Add implements Operator {
    static precedence = 2;
    static associativity = 'Left';
    static symbol = '+';
    public precedence = Add.precedence;
    public associativity = Add.associativity;
    public symbol = Add.symbol;
    execute = (a: Operand, b: Operand) => a + b;
}
/** Executes a-b */
class Subtract implements Operator {
    static precedence = 2;
    static associativity = 'Left';
    static symbol = '-';
    public precedence = Subtract.precedence;
    public associativity = Subtract.associativity;
    public symbol = Subtract.symbol;
    execute = (a: Operand, b: Operand) => a - b;
}
/** Executes a*b */
class Multiply implements Operator {
    static precedence = 3;
    static associativity = 'Left';
    static symbol = '*';
    public precedence = Multiply.precedence;
    public associativity = Multiply.associativity;
    public symbol = Multiply.symbol;
    execute = (a: Operand, b: Operand) => a*b;
}
/** Executes a/b */
class Divide implements Operator {
    static precedence = 3;
    static associativity = 'Left';
    static symbol = '/';
    public precedence = Divide.precedence;
    public associativity = Divide.associativity;
    public symbol = Divide.symbol;
    execute = (a: Operand, b: Operand) => a/b;
}
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
    constructor() {
        Operator.register(Add);
        Operator.register(Subtract);
        Operator.register(Multiply);
        Operator.register(Divide);
    }
    /**
     * Converts an array of symbols into an array of Tokens. Checks if the symbol is
     * registered in the Operator dictionary first, and if it isn't, casts the
     * symbol to a number.
     */
    private convert(str: string): Token[] {
        return str.split('').reduce((acc: Token[], val: string) => {
            if (Operator.dict[val]) {
                acc.push(new Operator.dict[val]);
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
        let operators: (Operator|'('|')')[] = [];
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

    execute(): number {
        let input = [...this.rpnTokens];
        let stack: Token[] = [];
        while (input.length) {
            let op = input.shift();
            if (!op) break;
            if (isOperand(op)) {
                stack.push(op);
            } else if (isOperator(op)) {
                let b = stack.pop();
                let a = stack.pop();
                stack.push(op.execute(<Operand>a,<Operand>b));
            }
        }
        if (stack.length > 1) {
            throw new Error('Items left in the stack! Ohnoes! :>> '+JSON.stringify(stack));
        }
        return stack[0] as Operand;
    }

    set expression(str: string) {
        this.history.push(str);
        this.exprTokens = this.convert(str);
        this.rpnTokens = this.shuntingYard(this.exprTokens).output;
    }
    get expression(): string {
        return this.parseToString(this.exprTokens);
    }
}




/******************************************************************************/
// Execution Area:

let calc = new Calculator;
calc.expression = '2*(2+2+2)*2';
console.log(calc.execute());
calc.expression = '4+(9/3)*(2*4/2)';
console.log(calc.execute());
// 1 2 4 / + 3 - 4 5 6 + * +
calc.expression = '2';
console.log(calc.execute());
calc.expression += '+3';
console.log(calc.execute());
calc.expression += '*4';
console.log(calc.execute());

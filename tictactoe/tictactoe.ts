// https://www.freecodecamp.org/challenges/build-a-tic-tac-toe-game

// https://codepen.io/freeCodeCamp/full/KzXQgy

// User Story: I can play a game of Tic Tac Toe with the computer.
// User Story: My game will reset as soon as it's over so I can play again.
// User Story: I can choose whether I want to play as X or O.

const svgNS = 'http://www.w3.org/2000/svg';

enum marks { X = -1, O = 1 }
let counter = 0;

class TicTacToe {
    private board: HTMLElement;
    private cells: NodeListOf<HTMLElement> = document.querySelectorAll('.cell') as NodeListOf<HTMLElement>;
    private human = 'X';
    // private twoPlayer = true;
    private twoPlayer = false;
    private state = Array(9).fill(0);
    private winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    private won = false;
    constructor() {
        this.board = document.getElementById('board') as HTMLElement;
        this.board.addEventListener('click', this.click.bind(this), true);
    }
    click(ev: Event) {
        const el: HTMLElement = ev.target as HTMLElement;
        let loc = el.dataset.loc;
        if (!loc || el.dataset.mark !== undefined || this.won) {
            return;
        }
        if (this.human === 'X') {
            this.setX(el);
            if (this.twoPlayer) {
                this.human = 'O';
            } else if (!this.won) {
                let next = this.evaluatePosition(marks.O);
                let el = Array.from(this.cells).filter(cell=>cell.dataset.loc == ''+next)[0];
                this.setO(el);
            }
        } else if (this.human === 'O' && this.twoPlayer) {
            this.setO(el);
            if (this.twoPlayer) {
                this.human = 'X';
            }
        } else {
            return;
        }
    }
    setX(el: HTMLElement) {
        el.dataset.mark = 'X';
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#X');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
        this.state[+(el.dataset.loc as string)] = marks.X;
        if (this.checkState() <= marks.X * 9) {
            console.log('X wins!');
            this.won = true;
        }
    }
    setO(el: HTMLElement) {
        el.dataset.mark = 'O';
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#O');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
        this.state[+(el.dataset.loc as string)] = marks.O;
        if (this.checkState() >= marks.O * 9) {
            console.log('O wins!');
            this.won = true;
        }
    }
    reset() {
        this.state.fill(0);
        this.current = marks.X;
        this.cells.forEach((el) => {
            delete el.dataset.mark;
            delete el.dataset.score;
            (el.querySelector('svg') as SVGElement).innerHTML = '';
        })
        this.won = false;
    }
    /**
     * Returns -9, 0 or +9. 9 means O wins, -9 means X wins, 0 means nobody has
     * a winning line.
     */
    checkState(state: number[] = [...this.state], depth: number = 1) {
        let result = this.winConditions.reduce((bestScore, winState) => {
            if (Math.abs(bestScore) >= 3) {
                return bestScore;
            }
            const score = winState.reduce((score, cellIndex) => {
                return score + state[cellIndex];
            }, 0);
            if (Math.abs(score) >= Math.abs(bestScore)) {
                return score;
            } else {
                return bestScore;
            }
        }, 0);
        if (result >= 3) {
            result = 10-depth;
        } else if (result <= -3) {
            result = depth-10;
        } else {
            result = 0;
        }
        return result;
        // if (Math.abs(result) < 3) {
        //     return 0;
        // } else {
        //     return result * 3;
        // }
    }
    /**
     * Find all available moves from given state.
     */
    findMoves(state: number[] = [...this.state]) {
        return state.reduce((moves: number[], cell, index) => {
            if (cell === 0) {
                moves.push(index);
            }
            return moves;
        }, []);
    }
    /**
     * Check score if move is made by mark with given state.
     */
    scoreMove(move: number, mark: marks = marks.O, state: number[] = [...this.state]) {
        if (state[move] === 0) {
            state[move] = mark;
        }
        return this.checkState(state);
    }

    /**
     * Finds highest scoring moves for mark in given state
     */
    selectMove(mark: marks = marks.O, state: number[] = [...this.state]) {
        return this.findMoves(state).reduce((acc: { max: number, moves: number[] }, move) => {
            let score = this.scoreMove(move, mark, [...state]);
            console.log((mark > 0 ? 'O' : 'X') + ' move: ' + move + ' score: ' + score + ' best: ' + acc.max + ' moves: ' + acc.moves);
            if (mark * score > mark * acc.max) {
                acc = { max: score, moves: [move] };
            } else if (mark * score === mark * acc.max) {
                acc.moves.push(move);
            }
            return acc;
        }, { max: mark * -Infinity, moves: [] });
    }

    newState(mark: marks, state: number[], move: number): number[] {
        let temp = [...state];
        temp[move] = mark;
        return temp;
    }
    negamax(state: number[] = [...this.state], depth: number = 1, mark: marks = marks.O) {
        let score = this.checkState(state, depth);
        if (depth >= 10 || score != 0) {
            return (score)*mark;
        }

        let best = -Infinity;
        for (const move of this.findMoves(state)) {
            let v = -this.negamax(this.newState(mark, state, move), depth + 1, -mark);
            best = Math.max(best, v);
        }
        if (Math.abs(best) === Infinity) {
            return 0;
        }

        return best;
    }

    evaluatePosition(mark: marks) {
        let moves: number[] = [];
        let best = -Infinity;
        game.findMoves().forEach(move=>{
            let score = this.negamax(this.newState(-mark, this.state, move), 1, -mark);
            if (score > best) {
                best = score;
                moves = [move];
            } else if (score === best) {
                moves.push(move);
            }
        })
        console.log('score: '+best+' moves: '+moves);
        return moves[Math.floor(Math.random()*moves.length)];
    }

}

const game = new TicTacToe;

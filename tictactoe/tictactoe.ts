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
    private modalContainer = document.getElementById('modal-container') as HTMLElement;
    private xModal = document.getElementById('x-wins') as HTMLElement;
    private oModal = document.getElementById('o-wins') as HTMLElement;
    private drawModal = document.getElementById('draw') as HTMLElement;
    private humanXButton = document.getElementById('human-x') as HTMLElement;
    private humanOButton = document.getElementById('human-o') as HTMLElement;
    private twoPlayerButton = document.getElementById('two-player') as HTMLElement;
    private human = marks.X;
    private current = marks.X;
    // private twoPlayer = true;
    private twoPlayer = false;
    private state = Array(9).fill(0);
    private winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    private won: marks = 0;
    private resetTimeout: number | undefined;
    constructor() {
        this.board = document.getElementById('board') as HTMLElement;
        this.board.addEventListener('click', this.click.bind(this), true);
    }
    click(ev: Event) {
        const el: HTMLElement = ev.target as HTMLElement;
        let loc = el.dataset.loc;
        if (!loc || el.dataset.mark !== undefined || this.won !== 0) {
            return;
        }
        if (this.human === marks.X && this.current === marks.X) {
            this.setX(el);
            if (this.twoPlayer) {
                this.human = marks.O;
            } else if (!this.won) {
                this.processAIMove(marks.O);
            }
            this.checkMinimax();
        } else if (this.human === marks.O && this.current === marks.O) {
            this.setO(el);
            if (this.twoPlayer) {
                this.human = marks.X;
            } else if (!this.won) {
                this.processAIMove(marks.X);
            }
            this.checkMinimax();
        } else {
            return;
        }
    }
    processAIMove(mark: marks = marks.O) {
        let next = this.evaluatePosition(mark);
        let el = Array.from(this.cells).filter(cell=>cell.dataset.loc == ''+next)[0];
        if (el === undefined) {
            return;
        }
        if (mark === marks.O) {
            this.setO(el);
        } else if (mark === marks.X) {
            this.setX(el);
        }
    }
    setX(el: HTMLElement) {
        el.dataset.mark = ''+marks.X;
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#X');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
        this.state[+(el.dataset.loc as string)] = marks.X;
        el.dataset.score = '';
        if (this.checkState() <= marks.X * 9) {
            // console.log('X wins!');
            this.won = marks.X;
            this.displayWinModal();
        } else if (this.findMoves().length === 0) {
            this.won = 0;
            this.displayWinModal();
            // this.displayDrawModal();
        }
        this.current = marks.O;
    }
    setO(el: HTMLElement) {
        el.dataset.mark = ''+marks.O;
        const useEl = document.createElementNS(svgNS, 'use');
        useEl.setAttribute('href', '#O');
        (el.querySelector('svg') as SVGElement).appendChild(useEl);
        this.state[+(el.dataset.loc as string)] = marks.O;
        el.dataset.score = '';
        if (this.checkState() >= marks.O * 9) {
            // console.log('O wins!');
            this.won = marks.O;
            this.displayWinModal();
        } else if (this.findMoves().length === 0) {
            this.won = 0;
            this.displayWinModal();
            // this.displayDrawModal();
        }
        this.current = marks.X;
    }
    selectHuman(mark: marks) {
        if (this.twoPlayer) {
            return;
        }
        this.human = mark;
        this.humanXButton.classList.toggle('active');
        this.humanOButton.classList.toggle('active');
        if (mark === marks.O && this.current === marks.X) {
            this.processAIMove(marks.X);
        } else if (mark === marks.X && this.current === marks.O) {
            this.processAIMove(marks.O);
        }
    }
    toggleTwoPlayer() {
        this.twoPlayer = !this.twoPlayer;
        this.twoPlayerButton.classList.toggle('active');
        // if (this.twoPlayer) {
        //     this.twoPlayer = false;
        // } else if (!this.twoPlayer) {
        //     this.twoPlayer = true;
        // }
    }
    displayWinModal() {
        this.modalContainer.classList.add('active');
        switch (this.won) {
            case marks.X:
                this.xModal.classList.add('active');
                break;
            case marks.O:
                this.oModal.classList.add('active');
                break;
            default:
                this.drawModal.classList.add('active');
        }
        this.resetTimeout = setTimeout(this.reset.bind(this), 2000);
    }
    displayDrawModal() {
        console.log('this round was a draw!');
        this.resetTimeout = setTimeout(this.reset.bind(this), 2000);
    }
    reset() {
        if (this.resetTimeout !== undefined) {
            clearTimeout(this.resetTimeout);
            this.resetTimeout = undefined;
        }
        this.state.fill(0);
        this.current = marks.X;
        this.cells.forEach((el) => {
            delete el.dataset.mark;
            delete el.dataset.score;
            (el.querySelector('svg') as SVGElement).innerHTML = '';
        })
        this.won = 0;

        this.modalContainer.classList.remove('active');
        this.xModal.classList.remove('active');
        this.oModal.classList.remove('active');
        this.drawModal.classList.remove('active');

        if (this.human !== this.current && !this.twoPlayer) {
            this.processAIMove(marks.X);
        } else if (this.twoPlayer) {
            this.human = this.current;
        }
    }
    /**
     * Returns -9, 0 or +9. 9 means O wins, -9 means X wins, 0 means nobody has
     * a winning line.
     */
    checkState(state: number[] = [...this.state], depth: number = 0) {
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
        let score = this.checkState(state);
        let el = Array.from(this.cells).filter(cell=>cell.dataset.loc == ''+move)[0];
        el.dataset.score = ''+score;
        return score;
    }

    /**
     * Finds highest scoring moves for mark in given state
     */
    selectMove(mark: marks = marks.O, state: number[] = [...this.state]) {
        return this.findMoves(state).reduce((acc: { max: number, moves: number[] }, move) => {
            let score = this.scoreMove(move, mark, [...state]);
            // console.log((mark > 0 ? marks.O : marks.X) + ' move: ' + move + ' score: ' + score + ' best: ' + acc.max + ' moves: ' + acc.moves);
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
            let score = this.minimax(this.newState(mark, this.state, move),0,false,mark);
            // let score = this.negamax(this.newState(-mark, this.state, move), 1, -mark);
            if (score > best) {
                best = score;
                moves = [move];
            } else if (score === best) {
                moves.push(move);
            }
        })
        // console.log('score: '+best+' moves: '+moves);
        return moves[Math.floor(Math.random()*moves.length)];
    }

    // First, evaluate all of current player's potential moves.
    //  If 0, then evaluate all potential responses for that move.
    //      If response is win, then return score.
    //      If repsonse is 0, continue evaluating.
    //  If win, then return score
    // Once every square has a score, select highest score, adjusting for depth.

    // 01 function minimax(node, depth, maximizingPlayer)
    // 02     if depth = 0 or node is a terminal node
    // 03         return the heuristic value of node

    // 04     if maximizingPlayer
    // 05         bestValue := −∞
    // 06         for each child of node
    // 07             v := minimax(child, depth − 1, FALSE)
    // 08             bestValue := max(bestValue, v)
    // 09         return bestValue

    // 10     else    (* minimizing player *)
    // 11         bestValue := +∞
    // 12         for each child of node
    // 13             v := minimax(child, depth − 1, TRUE)
    // 14             bestValue := min(bestValue, v)
    // 15         return bestValue
    // (* Initial call for maximizing player *)
    // minimax(origin, depth, TRUE)

    minimax(state: number[] = [...this.state], depth: number = 0, maximizingPlayer: boolean = false, flavor: marks = marks.O) {
        const score = this.checkState(state);
        if (score !== 0) {
            return score*flavor;
        }
        let best: number;
        if (maximizingPlayer) {
            best = -Infinity;
            for (let move of this.findMoves(state)) {
                let newState = [...state];
                newState[move] = flavor;
                let v = this.minimax(newState, depth + 1, false, flavor);
                if (v!== 0) {
                    v--;
                }
                best = Math.max(best, v);
            }
        } else {
            best = Infinity;
            for (let move of this.findMoves(state)) {
                let newState = [...state];
                newState[move] = flavor * -1;
                let v = this.minimax(newState, depth + 1, true, flavor);
                if (v !== 0) {
                    v++;
                }
                best = Math.min(best, v);
            }
        }
        if (Math.abs(best) === Infinity) {
            return 0;
        } else {
            return best;
        }
    }

    checkMinimax(mark: marks = this.current) {
        let best = -Infinity;

        return this.findMoves().reduce((acc: number[], move)=>{
            let score = this.minimax(this.newState(mark, this.state, move),0,false,mark);
            let el = Array.from(this.cells).filter(cell=>cell.dataset.loc == ''+move)[0];
            el.dataset.score = ''+(score+10);
            // console.log(move+'#: '+score+'['+best+']');
            if (score > best) {
                best = score;
                return [move];
            } else if (score === best) {
                return [...acc, move];
            } else {
                return acc;
            }
        }, []);

    }

}

const game = new TicTacToe;

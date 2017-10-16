// https://www.freecodecamp.org/challenges/build-a-tic-tac-toe-game

// https://codepen.io/freeCodeCamp/full/KzXQgy

// User Story: I can play a game of Tic Tac Toe with the computer.
// User Story: My game will reset as soon as it's over so I can play again.
// User Story: I can choose whether I want to play as X or O.


class TicTacToe {
    private board: HTMLElement;
    constructor() {
        this.board = document.getElementById('board') as HTMLElement;
        this.board.addEventListener('click', this.click, true);
    }
    click(ev: Event) {
        const el: HTMLElement = ev.target as HTMLElement;
        let loc = el.dataset.loc;
        if (!loc || el.dataset.mark !== undefined) {
            return;
        }
        (el.querySelector('svg') as SVGElement).innerHTML = '<use href="#X"/>';
        el.dataset.mark = 'X';
        console.log(el);
    }
    reset() {}
}

const game = new TicTacToe;

import gameboard, { gameboardView } from './gameboard';
import events from './events';

const player = (num) => {
    const name = num === 1 ? 'player' : 'computer';
    const board = gameboard(name);
    const boardView = gameboardView(name, board);
    let reaminingShips = ['carrier', 'battleship', 'destroyer', 'submarine', 'patrol'];

    function getName() {
        return name;
    }

    function getBoard() {
        return board;
    }

    function getBoardView() {
        return boardView;
    }

    function getRemainingShips() {
        return reaminingShips.length;
    }

    function destroyShip(ship) {
        reaminingShips = reaminingShips.filter((shipClass) => ship.getClass() !== shipClass);
    }

    function playerAttack(target) {
        return new Promise((resolve, reject) => {
            const attackHandler = ({ row, col }) => {
                try {
                    target.getBoard().receiveAttack({ target: 'computer', row, col });
                    events.off('tileSelected', attackHandler);

                    resolve();
                } catch (error) {
                    console.log(error.message);
                    reject('This tile has already been attacked. Select a new position');
                }
            };

            events.on('tileSelected', attackHandler);
        });
    }

    function computerAttack(target) {
        return new Promise((resolve) => {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);

            try {
                target.getBoard().receiveAttack({ target: 'player', row, col });
                resolve();
            } catch {
                resolve(computerAttack());
            }
        });
    }

    return {
        getName,
        getBoard,
        getBoardView,
        getRemainingShips,
        destroyShip,
        playerAttack,
        computerAttack,
    };
};

export default player;

import gameboard, { gameboardView } from './gameboard';
import events from './events';
import { shipList } from './ship';

const player = (num) => {
    const name = num === 1 ? 'player' : 'computer';
    const board = gameboard(name);
    const boardView = gameboardView(name, board);

    let remainingShips = Object.values(shipList);
    let attackHandler;
    // let prevAttack = null;
    // let attackQueue = null;

    function reset() {
        remainingShips = Object.values(shipList);

        events.off('tileSelected', attackHandler);
    }

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
        return remainingShips.length;
    }

    function destroyShip(ship) {
        remainingShips = remainingShips.filter((shipClass) => ship.getClass() !== shipClass);
    }

    function playerAttack(target) {
        return new Promise((resolve, reject) => {
            attackHandler = ({ row, col }) => {
                try {
                    target.getBoard().receiveAttack({ row, col });
                    events.off('tileSelected', attackHandler);

                    resolve();
                } catch (error) {}
            };

            events.on('tileSelected', attackHandler);
        });
    }

    function computerAttack(target) {
        // TODO: Implement AI to for smart targeting
        // const nextOffsets = [-5, -4, -3, -2, 1, 2, 3, 4];

        // let attackCoords;

        // function getNewCoords(attackCoords) {
        //     // Calculate possible moves in a cross shape and filter ones out of bounds
        //     let offsets = [
        //         [-1, 0],
        //         [1, 0],
        //         [0, -1],
        //         [0, 1],
        //     ];
        //     attackQueue = offsets.map((offset) => ({
        //         row: attackCoords.row + offset[0],
        //         col: attackCoords.col + offset[1],
        //         rowOffset: offset[0],
        //         colOffset: offset[1],
        //     }));
        //     return attackQueue.filter(
        //         ({ row, col }) => row >= 0 && row <= 10 && col >= 0 && col <= 10
        //     );
        // }

        return new Promise((resolve) => {
            try {
                const row = Math.floor(Math.random() * 10);
                const col = Math.floor(Math.random() * 10);
                target.getBoard().receiveAttack({ row, col });

                resolve();
            } catch {
                resolve(computerAttack());
            }
        });
    }

    return {
        reset,
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

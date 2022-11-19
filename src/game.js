import gameboard, { gameboardView } from './gameboard';
import player from './player';
import events from './events';

const game = (function () {
    const infoBox = document.getElementById('info-box');

    const players = ['player1', 'player2'];
    const playerGameboards = players.map((player) => gameboard(player));
    const playerGameboardView = players.map((gameboard) => gameboardView(gameboard));

    placeInitShips(playerGameboards[0]);
    placeInitShips(playerGameboards[1]);

    events.on('attackHit', _announceHit);
    events.on('attackMissed', _announceMiss);
    events.on('shipSunk', _announceSinking);

    function placeInitShips(gameboard) {
        const initCoords = {
            carrier: [1, 1, false],
            battleship: [5, 6, true],
            destroyer: [4, 0, false],
            submarine: [7, 3, true],
            patrol: [5, 4, true],
        };

        for (let ship in initCoords) {
            const [row, column, rotate] = initCoords[ship];

            gameboard.placeShip(row, column, ship, rotate);
        }
    }

    function _announceHit({ player: target, ship }) {
        infoBox.textContent = `${target}'s ${ship.getClass()} has been damaged`;
    }
    function _announceMiss() {
        infoBox.textContent = 'Shot missed, landed in water';
    }
    function _announceSinking({ player: target, ship }) {
        infoBox.textContent = `${target}'s ${ship.getClass()} has been sunk`;
    }
})();

export default game;

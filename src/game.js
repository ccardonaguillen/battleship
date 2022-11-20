import gameboard, { gameboardView } from './gameboard';
import player from './player';
import events from './events';
import ship from './ship';

const shipList = {
    carrier: 5,
    battleship: 4,
    destroyer: 3,
    submarine: 3,
    patrol: 2,
};

const game = (function () {
    const infoBox = document.getElementById('info-box');

    const players = { player: player(1), computer: player(2) };

    events.on('attackHit', _announceHit);
    events.on('attackMissed', _announceMiss);
    events.on('shipSunk', _announceSinking);

    startGame();

    async function startGame() {
        await prepareBoard();
        startGameLoop();
    }

    async function prepareBoard() {
        placeShipsRandomly(players.computer.getBoard());
        await displayWelcomeMessage();
    }

    function displayWelcomeMessage() {
        infoBox.innerHTML = `Place your ships <button id="manual-button">manually</button> or <button id="random-button">randomly</button>`;

        return new Promise((resolve) => {
            const manualButton = document.getElementById('manual-button');
            manualButton.addEventListener('click', () => {
                placeShipsManually().then(() => resolve());
            });

            const randomButton = document.getElementById('random-button');
            randomButton.addEventListener('click', () => {
                placeShipsRandomly(players.player.getBoard()).then(() => resolve());
            });
        });
    }

    function placeShipsRandomly(gameboard) {
        const availableShips = {
            carrier: 5,
            battleship: 4,
            destroyer: 3,
            submarine: 3,
            patrol: 2,
        };

        function placeShip(ship) {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            const rotate = Math.random() < 0.5;

            try {
                gameboard.placeShip(row, col, ship, rotate);
            } catch (error) {
                placeShip(ship);
            }
        }

        for (let ship in availableShips) {
            placeShip(ship);
        }

        return new Promise((resolve) => resolve());
    }

    function placeShipsManually() {
        const gameboard = players.player.getBoard();
        let rotate = false;

        events.on('previewRotated', (rotation) => {
            rotate = rotation;
        });

        function placeShip(ship) {
            players.player.getBoardView().previewShipPlacement(ship);

            return new Promise((resolve, reject) => {
                const handler = function ({ owner, row, col }) {
                    if (owner === 'player') {
                        try {
                            gameboard.placeShip(row, col, ship, rotate);

                            events.off('tileSelected', handler);
                            rotate = false;

                            resolve();
                        } catch {
                            infoBox.textContent =
                                'Cannot place ship in this tile. Choose a valid position';
                        }
                    }
                };

                events.on('tileSelected', handler);
            });
        }

        const placeInstructions = (ship) =>
            `Select a valid tile to place the <strong>${ship}</strong>. Press 'Ctrl' to rotate it`;

        return new Promise(async function (resolve) {
            for (let ship in shipList) {
                infoBox.innerHTML = placeInstructions(ship);
                await placeShip(ship);
            }
            resolve();
        });
    }

    async function startGameLoop() {
        infoBox.textContent = 'Select an enemy position to attack';

        events.on('shipSunk', ({ player, ship }) => {
            if (player === 'player') {
                players.player.destroyShip(ship);
            } else {
                players.computer.destroyShip(ship);
            }
        });

        while (Object.values(players).every((player) => player.getRemainingShips() !== 0)) {
            await players.player
                .playerAttack(players.computer)
                .catch((message) => (infoBox.textContent = message));
            await new Promise((resolve) =>
                setTimeout(() => {
                    players.computer.computerAttack(players.player).then(() => resolve());
                }, 1000)
            );
        }

        const winner = players.computer.getRemainingShips() === 0 ? 'player' : 'computer';
        const loser = players.computer.getRemainingShips() === 0 ? 'computer' : 'player';

        infoBox.innerHTML = `The <strong>${winner}</strong> wins. All ${loser}'s ships have been destroyed`;
        infoBox.innerHTML += "<br>Click the 'New Game' button to start over";
    }

    function _announceHit({ target, ship }) {
        infoBox.textContent = `${target}'s ${ship.getClass()} has been damaged`;
    }
    function _announceMiss() {
        infoBox.textContent = 'Shot missed, landed in water';
    }
    function _announceSinking({ target, ship }) {
        infoBox.textContent = `${target}'s ${ship.getClass()} has been sunk`;
    }
})();

export default game;

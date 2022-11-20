import gameboard, { gameboardView, tile } from './gameboard';
// import player from './player';
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

    const players = ['player1', 'player2'];
    const playerGameboards = players.map((player) => gameboard(player));
    const playerGameboardView = players.map((playerName, i) =>
        gameboardView(playerName, playerGameboards[i])
    );
    const remainingShips = players.map((player) => Object.keys(shipList));

    events.on('attackHit', _announceHit);
    events.on('attackMissed', _announceMiss);
    events.on('shipSunk', _announceSinking);

    const player1Tiles = playerGameboardView[0].getPlayerTiles().tiles;

    startGame();

    async function startGame() {
        await prepareBoard();
        startGameLoop();
    }

    async function prepareBoard() {
        placeShipsRandomly(playerGameboards[1]);
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
                placeShipsRandomly(playerGameboards[0]).then(() => resolve());
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
            const column = Math.floor(Math.random() * 10);
            const rotate = Math.random() < 0.5;

            try {
                gameboard.placeShip(row, column, ship, rotate);
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
        const gameboard = playerGameboards[0];
        let rotate = false;

        events.on('previewRotated', (rotation) => {
            rotate = rotation;
        });

        function placeShip(ship) {
            playerGameboardView[0].previewShipPlacement(ship);

            return new Promise((resolve, reject) => {
                const handler = function ({ player, row, column }) {
                    if (player === 'player1') {
                        try {
                            gameboard.placeShip(row, column, ship, rotate);

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
            if (player === 'player1') {
                remainingShips[0] = remainingShips[0].filter(
                    (shipClass) => ship.getClass() !== shipClass
                );
            } else {
                remainingShips[1] = remainingShips[1].filter(
                    (shipClass) => ship.getClass() !== shipClass
                );
            }
        });

        while (remainingShips.every((ship) => ship.length !== 0)) {
            await attackComputer();
            await new Promise((resolve) =>
                setTimeout(() => {
                    attackPlayer();
                    resolve();
                }, 1000)
            );
        }

        const winner = remainingShips[1].length === 0 ? 'player' : 'computer';
        const loser = remainingShips[1].length === 0 ? 'computer' : 'player';

        infoBox.innerHTML = `The <strong>${winner}</strong> wins. All ${loser}'s ships have been destroyed`;
        infoBox.innerHTML += "<br>Click the 'New Game' button to start over";
    }

    function attackComputer() {
        return new Promise((resolve) => {
            const attackHandler = ({ player, row, column }) => {
                try {
                    playerGameboards[1].receiveAttack({ player, row, column });
                    events.off('tileSelected', attackHandler);

                    resolve();
                } catch {
                    infoBox.textContent =
                        'This tile has already been attacked. Select a new position';
                }
            };

            events.on('tileSelected', attackHandler);
        });
    }

    function attackPlayer() {
        const row = Math.floor(Math.random() * 10);
        const column = Math.floor(Math.random() * 10);

        try {
            playerGameboards[0].receiveAttack({ player: 'player1', row, column });
        } catch {
            attackPlayer();
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

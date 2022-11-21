import gameboard, { gameboardView } from './gameboard';
import player from './player';
import events from './events';
import ship, { shipList } from './ship';

const game = (function () {
    const infoBox = document.getElementById('info-box');
    const resetButton = document.getElementById('new-game-button');

    let players = { player: player(1), computer: player(2) };

    resetButton.addEventListener('click', resetGame);

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
        // Await for ships to be placed
        await displayWelcomeMessage();
    }

    function displayWelcomeMessage() {
        // Display initial message
        infoBox.innerHTML = `Place your ships <button id="manual-button">manually</button> or <button id="random-button">randomly</button>`;

        // Resolve promise when player chooses to place ships manually or automatically
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
        // Generate random coords and direction and try to place ship until it succeeds
        const availableShips = { ...shipList };

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
        // For each ship, enable preview and resolve promise when valid position is selected
        const gameboard = players.player.getBoard();
        let rotate = false;

        events.on('previewRotated', (rotation) => {
            rotate = rotation;
        });

        function placeShip(ship) {
            events.emit('enablePreview', ship);

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
        // Run main loop, switching between the two player's turns
        // Keep running until one of the players's ship have been destroyed
        // Then announce winner
        infoBox.textContent = 'Select an enemy position to attack';

        events.on('shipSunk', ({ player, ship }) => {
            if (player === 'player') {
                players.player.destroyShip(ship);
            } else {
                players.computer.destroyShip(ship);
            }
        });

        while (Object.values(players).every((player) => player.getRemainingShips() !== 0)) {
            await players.player.playerAttack(players.computer);
            // TODO? : Log error message when selecting a previously selected tile while not passing turn
            // reject('This tile has already been attacked. Select a new position');
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

    function resetGame() {
        events.emit('gameReset', '');

        Object.values(players).forEach((player) => player.reset());

        startGame();
    }
})();

export default game;

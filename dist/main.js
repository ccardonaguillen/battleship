/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/events.js":
/*!***********************!*\
  !*** ./src/events.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var events = {
    events: {},
    on: function (eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    off: function (eventName, fn) {
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (fn) {
                fn(data);
            });
        }
    },
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (events);


/***/ }),

/***/ "./src/game.js":
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./player */ "./src/player.js");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./events */ "./src/events.js");
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ship */ "./src/ship.js");





const game = (function () {
    const infoBox = document.getElementById('info-box');
    const resetButton = document.getElementById('new-game-button');

    let players = { player: (0,_player__WEBPACK_IMPORTED_MODULE_1__["default"])(1), computer: (0,_player__WEBPACK_IMPORTED_MODULE_1__["default"])(2) };

    resetButton.addEventListener('click', resetGame);

    _events__WEBPACK_IMPORTED_MODULE_2__["default"].on('attackHit', _announceHit);
    _events__WEBPACK_IMPORTED_MODULE_2__["default"].on('attackMissed', _announceMiss);
    _events__WEBPACK_IMPORTED_MODULE_2__["default"].on('shipSunk', _announceSinking);

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
        const availableShips = { ..._ship__WEBPACK_IMPORTED_MODULE_3__.shipList };

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

        _events__WEBPACK_IMPORTED_MODULE_2__["default"].on('previewRotated', (rotation) => {
            rotate = rotation;
        });

        function placeShip(ship) {
            _events__WEBPACK_IMPORTED_MODULE_2__["default"].emit('enablePreview', ship);

            return new Promise((resolve, reject) => {
                const handler = function ({ owner, row, col }) {
                    if (owner === 'player') {
                        try {
                            gameboard.placeShip(row, col, ship, rotate);

                            _events__WEBPACK_IMPORTED_MODULE_2__["default"].off('tileSelected', handler);
                            rotate = false;
                            resolve();
                        } catch {
                            infoBox.textContent =
                                'Cannot place ship in this tile. Choose a valid position';
                        }
                    }
                };

                _events__WEBPACK_IMPORTED_MODULE_2__["default"].on('tileSelected', handler);
            });
        }

        const placeInstructions = (ship) =>
            `Select a valid tile to place the <strong>${ship}</strong>. Press 'Ctrl' to rotate it`;

        return new Promise(async function (resolve) {
            for (let ship in _ship__WEBPACK_IMPORTED_MODULE_3__.shipList) {
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

        _events__WEBPACK_IMPORTED_MODULE_2__["default"].on('shipSunk', ({ player, ship }) => {
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
        _events__WEBPACK_IMPORTED_MODULE_2__["default"].emit('gameReset', '');

        Object.values(players).forEach((player) => player.reset());

        startGame();
    }
})();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (game);


/***/ }),

/***/ "./src/gameboard.js":
/*!**************************!*\
  !*** ./src/gameboard.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "gameboardView": () => (/* binding */ gameboardView),
/* harmony export */   "tile": () => (/* binding */ tile)
/* harmony export */ });
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ship */ "./src/ship.js");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./events */ "./src/events.js");



const shipList = {
    carrier: 5,
    battleship: 4,
    destroyer: 3,
    submarine: 3,
    patrol: 2,
};

const gameboard = (owner, size = 10) => {
    const nrows = size;
    const ncolumns = size;
    let tiles = [];

    _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('gameReset', _initBoard);

    _initBoard();

    function _initBoard() {
        // Create a tile object corresponding to each of the game tiles
        for (let i = 0; i < nrows; i++) {
            tiles[i] = [];
            for (let j = 0; j < ncolumns; j++) {
                tiles[i][j] = tile(owner, i, j);
            }
        }
    }

    function getTiles() {
        // Function for testing purposes
        return tiles;
    }

    function getTileContents() {
        // Function for testing purposes
        return tiles.map((row) => row.map((tile) => tile.getContents()));
    }

    function checkPlacement(row, col, ship, rotate) {
        // Create new ship and assign target tiles to place it
        const targetTiles = [];
        const shipLength = ship.getLength();
        const axis = rotate ? row : col; // Axis along which check placement (row or cols)
        const endIdx = axis + shipLength;

        // Check if one of the target tiles is outside of board limits
        if (endIdx > size) return { valid: false, status: 'outOfBounds' };

        // Select tiles along rows or columns starting at selected tile
        for (let idx = axis; idx < endIdx; idx++) {
            targetTiles.push(rotate ? tiles[idx][col] : tiles[row][idx]);
        }

        if (!targetTiles.every((tile) => tile.isAvailable()))
            return { valid: false, status: 'inUse' };

        return { valid: true, target: targetTiles };
    }

    function placeShip(row, col, shipClass, rotate = false) {
        // Check if ship starting position is outside of board limits
        if (row > nrows - 1 || col > ncolumns - 1)
            throw new Error('Cannot place ship outside board limits');

        const newShip = (0,_ship__WEBPACK_IMPORTED_MODULE_0__["default"])(shipClass);
        const checkAvail = checkPlacement(row, col, newShip, rotate);

        if (checkAvail.valid) {
            checkAvail.target.map((tile) => tile.placeShip(newShip));
            return newShip;
        } else {
            if (checkAvail.status === 'outOfBounds') {
                throw new Error('Ship cannot go out of bounds');
            } else if (checkAvail.status === 'inUse') {
                throw new Error('One or more tiles are already occupied');
            }
        }
    }

    function receiveAttack({ row, col }) {
        // Emit attack at target tile and wait for response
        try {
            return tiles[row][col].target();
        } catch (error) {
            throw error;
        }
    }

    return {
        getTiles,
        getTileContents,
        checkPlacement,
        placeShip,
        receiveAttack,
    };
};

const gameboardView = (owner, gameboard) => {
    const isPlayer = owner === 'player' ? true : false;
    const board = document.getElementById(`${owner}-board`);
    const shipsContainer = document.getElementById(`${owner}-ships`);

    let tiles;

    let shipsDisplay;
    let previewCoords;
    let renderPreviewHandlers;
    let clearPreviewHandlers;

    _initView();

    _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('shipPlaced', _renderNewShip);
    _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('shipPlaced', _clearPreview);
    _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('attackHit', _renderAttack);
    _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('attackMissed', _renderMiss);
    _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('enablePreview', _previewPlacement);
    _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('gameReset', _initView);

    function _initView() {
        // Reset DOM components and create them
        _resetView();
        _createBoard(board, 10);
        _createShipsDisplay(shipsContainer);
    }

    function _resetView() {
        board.innerHTML = '';
        shipsContainer.innerHTML = '';

        tiles = [];

        shipsDisplay = {};
        previewCoords = null;
        renderPreviewHandlers = [];
        clearPreviewHandlers = [];
    }

    function _createBoard(board, size) {
        const table = document.createElement('table');
        const ncols = size;

        // The column header for the player and computer
        //are placed in the right and left columns respectively
        const colHeader = isPlayer ? 0 : ncols;

        for (let i = 0; i <= size; i++) {
            if (i !== size) tiles[i] = [];
            const row = table.insertRow();
            for (let j = 0; j <= ncols; j++) {
                // The real column index starts at j=1 for the player
                const colIdx = isPlayer ? j - 1 : j;
                const cell = row.insertCell();

                if (i === size && j === colHeader) {
                    cell.classList.add('corner-cell');
                } else if (j === colHeader) {
                    cell.textContent = i + 1;
                    cell.classList.add('row-header', isPlayer ? 'align-right' : 'align-left');
                } else if (i === size) {
                    cell.textContent = String.fromCharCode(65 + colIdx);
                    cell.classList.add('column-header');
                } else {
                    cell.setAttribute('data-row', i);
                    cell.setAttribute('data-column', colIdx);

                    cell.addEventListener('click', () => {
                        _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('tileSelected', { owner, row: i, col: colIdx });
                    });

                    tiles[i][colIdx] = cell;
                }
            }
        }
        board.appendChild(table);
    }

    function _createShipsDisplay(display) {
        // Create a div for each ship with the number of squares corresponding to their hp
        for (let ship in shipList) {
            const container = document.createElement('div');
            container.classList.add('ship-display');
            container.style.justifyContent = isPlayer ? 'flex-end' : 'flex-start';

            shipsDisplay[ship] = [];

            for (let i = 1; i <= shipList[ship]; i++) {
                const hp = document.createElement('div');
                hp.classList.add('ship-hp');

                container.appendChild(hp);
                shipsDisplay[ship].push(hp);
            }

            display.appendChild(container);
        }
    }

    function _renderNewShip({ player, row, col }) {
        // Only render ships for the player. Keep computer's ships hidden
        if (player === owner && owner != 'computer') {
            tiles[row][col].classList.add('ship');
            _removePreviewListeners();
        }
    }

    function _renderAttack({ target, row, col, ship }) {
        // Apply attack to selected tile and to the corresponding ship's hp display
        if (target === owner) {
            tiles[row][col].classList.add('hit');

            const shipClass = ship.getClass();
            const shipHP = ship.getHP();

            const index = owner === 'player' ? shipHP : shipList[shipClass] - shipHP - 1;
            const hpDiv = shipsDisplay[shipClass][index];
            hpDiv.style.backgroundColor = 'red';
        }
    }

    function _renderMiss({ target, row, col }) {
        if (target === owner) {
            tiles[row][col].classList.add('miss');
        }
    }

    function _previewPlacement(shipClass) {
        // Allow preview only for the player's ships
        if (owner === 'computer') return;

        const newShip = (0,_ship__WEBPACK_IMPORTED_MODULE_0__["default"])(shipClass);
        let rotate = false;

        tiles.forEach((row, i) => {
            renderPreviewHandlers[i] = [];
            row.forEach((tile, j) => {
                const wrapper = (e) => {
                    previewCoords = _renderPreview(i, j, newShip, rotate);
                };
                tile.addEventListener('mouseover', wrapper);
                renderPreviewHandlers[i][j] = wrapper;
            });
        });

        tiles.forEach((row, i) => {
            clearPreviewHandlers[i] = [];
            row.forEach((tile, j) => {
                const wrapper = (e) => {
                    if (previewCoords !== null) previewCoords.forEach(_clearPreview);
                };
                tile.addEventListener('mouseout', wrapper);
                clearPreviewHandlers[i][j] = wrapper;
            });
        });

        document.addEventListener('keydown', (e) => {
            rotate = _rotatePreview(e, rotate);
        });
    }

    function _renderPreview(row, col, ship, rotate) {
        // Check if ship can be placed
        // If so, add preview in corresponding tiles
        const checkTiles = gameboard.checkPlacement(row, col, ship, rotate);

        if (checkTiles.valid) {
            const coords = checkTiles.target.map((tile) => tile.getCoords());

            coords.forEach(({ row, col }) => {
                tiles[row][col].classList.add('preview');
            });

            return coords;
        } else {
            return null;
        }
    }

    function _clearPreview({ row, col }) {
        tiles[row][col].classList.remove('preview');
    }

    function _rotatePreview(e, rotate) {
        if (e.key === 'Control') {
            _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('previewRotated', !rotate);
            return !rotate;
        }
    }

    function _removePreviewListeners() {
        if (previewCoords !== null) previewCoords.forEach(_clearPreview);

        if (renderPreviewHandlers.length !== 0) {
            tiles.forEach((row, i) => {
                row.forEach((tile, j) => {
                    tile.removeEventListener('mouseover', renderPreviewHandlers[i][j]);
                });
            });
        }

        if (clearPreviewHandlers.length !== 0) {
            tiles.forEach((row, i) => {
                row.forEach((tile, j) => {
                    tile.removeEventListener('mouseout', clearPreviewHandlers[i][j]);
                });
            });
        }

        renderPreviewHandlers = [];
        clearPreviewHandlers = [];
    }
};

const tile = (owner, row, col) => {
    let ship = null;
    let hit = false;

    function getCoords() {
        return { row, col };
    }

    function getContents() {
        return ship;
    }

    function placeShip(newShip) {
        // Place ship in tile if it is available and emit event
        // If not, throw error
        if (isAvailable()) {
            ship = newShip;
            _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('shipPlaced', { player: owner, row, col });
        } else {
            throw new Error('You cannot place a ship here');
        }
    }

    function target() {
        // Check is the target tile has been already hit by and attack
        if (hit) throw new Error('This tile has already been attacked');

        // If not, land attack and report if it hits (and/or sinks) a ship or misses
        // Emit appropriate event
        let report = {};
        if (ship !== null) {
            ship.hit();
            _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('attackHit', { target: owner, row, col, ship });
            report['status'] = 'hit';

            if (ship.getHP() === 0) {
                report['sink'] = ship;
                _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('shipSunk', { target: owner, ship });
            }
        } else {
            report['status'] = 'miss';
            _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('attackMissed', { target: owner, row, col });
        }
        hit = true;
        return report;
    }

    function isAvailable() {
        // Check if there is a ship or it has already been targeted by and attack
        return (ship === null) & !hit;
    }

    return {
        getCoords,
        getContents,
        placeShip,
        target,
        isAvailable,
    };
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (gameboard);



/***/ }),

/***/ "./src/player.js":
/*!***********************!*\
  !*** ./src/player.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameboard */ "./src/gameboard.js");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./events */ "./src/events.js");
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ship */ "./src/ship.js");




const player = (num) => {
    const name = num === 1 ? 'player' : 'computer';
    const board = (0,_gameboard__WEBPACK_IMPORTED_MODULE_0__["default"])(name);
    const boardView = (0,_gameboard__WEBPACK_IMPORTED_MODULE_0__.gameboardView)(name, board);

    let remainingShips = Object.values(_ship__WEBPACK_IMPORTED_MODULE_2__.shipList);
    let attackHandler;
    // let prevAttack = null;
    // let attackQueue = null;

    function reset() {
        remainingShips = Object.values(_ship__WEBPACK_IMPORTED_MODULE_2__.shipList);

        _events__WEBPACK_IMPORTED_MODULE_1__["default"].off('tileSelected', attackHandler);
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
                    _events__WEBPACK_IMPORTED_MODULE_1__["default"].off('tileSelected', attackHandler);

                    resolve();
                } catch (error) {}
            };

            _events__WEBPACK_IMPORTED_MODULE_1__["default"].on('tileSelected', attackHandler);
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (player);


/***/ }),

/***/ "./src/ship.js":
/*!*********************!*\
  !*** ./src/ship.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "shipList": () => (/* binding */ shipList)
/* harmony export */ });
const shipList = {
    carrier: 5,
    battleship: 4,
    destroyer: 3,
    submarine: 3,
    patrol: 2,
};

const ship = (shipClass) => {
    const length = shipList[shipClass];
    let hp = length;

    function hit() {
        // If ship has not been sunk, take 1 HP
        if (isSunk()) return;

        hp -= 1;
    }

    function getHP() {
        return hp;
    }

    function isSunk() {
        // Return true if no HPs left
        return hp === 0 ? true : false;
    }

    function getLength() {
        return length;
    }

    function getClass() {
        return shipClass;
    }

    return {
        getHP,
        getLength,
        getClass,
        isSunk,
        hit,
    };
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ship);



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/game.js");


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsNEJBQTRCLG1DQUFtQztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7O0FBRUEsaUVBQWUsTUFBTSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekJpQztBQUN6QjtBQUNBO0FBQ1U7O0FBRXhDO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0IsUUFBUSxtREFBTSxlQUFlLG1EQUFNOztBQUV2RDs7QUFFQSxJQUFJLGtEQUFTO0FBQ2IsSUFBSSxrREFBUztBQUNiLElBQUksa0RBQVM7O0FBRWI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0EsaUNBQWlDLEdBQUcsMkNBQVE7O0FBRTVDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsa0RBQVM7QUFDakI7QUFDQSxTQUFTOztBQUVUO0FBQ0EsWUFBWSxvREFBVzs7QUFFdkI7QUFDQSw0Q0FBNEMsaUJBQWlCO0FBQzdEO0FBQ0E7QUFDQTs7QUFFQSw0QkFBNEIsbURBQVU7QUFDdEM7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGdCQUFnQixrREFBUztBQUN6QixhQUFhO0FBQ2I7O0FBRUE7QUFDQSx3REFBd0QsS0FBSzs7QUFFN0Q7QUFDQSw2QkFBNkIsMkNBQVE7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxRQUFRLGtEQUFTLGdCQUFnQixjQUFjO0FBQy9DO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDJDQUEyQyxPQUFPLHNCQUFzQixNQUFNO0FBQzlFO0FBQ0E7O0FBRUEsNEJBQTRCLGNBQWM7QUFDMUMsaUNBQWlDLE9BQU8sS0FBSyxpQkFBaUI7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsY0FBYztBQUM5QyxpQ0FBaUMsT0FBTyxLQUFLLGlCQUFpQjtBQUM5RDs7QUFFQTtBQUNBLFFBQVEsb0RBQVc7O0FBRW5COztBQUVBO0FBQ0E7QUFDQSxDQUFDOztBQUVELGlFQUFlLElBQUksRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RLTTtBQUNJOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxJQUFJLGtEQUFTOztBQUViOztBQUVBO0FBQ0E7QUFDQSx3QkFBd0IsV0FBVztBQUNuQztBQUNBLDRCQUE0QixjQUFjO0FBQzFDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDOztBQUVBO0FBQ0Esb0NBQW9DOztBQUVwQztBQUNBLDZCQUE2QixjQUFjO0FBQzNDO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUI7O0FBRXJCLGlCQUFpQjtBQUNqQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3QkFBd0IsaURBQUk7QUFDNUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkJBQTZCLFVBQVU7QUFDdkM7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw2Q0FBNkMsTUFBTTtBQUNuRCxzREFBc0QsTUFBTTs7QUFFNUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsSUFBSSxrREFBUztBQUNiLElBQUksa0RBQVM7QUFDYixJQUFJLGtEQUFTO0FBQ2IsSUFBSSxrREFBUztBQUNiLElBQUksa0RBQVM7QUFDYixJQUFJLGtEQUFTOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHdCQUF3QixXQUFXO0FBQ25DO0FBQ0E7QUFDQSw0QkFBNEIsWUFBWTtBQUN4QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTs7QUFFQTtBQUNBLHdCQUF3QixvREFBVyxtQkFBbUIsNEJBQTRCO0FBQ2xGLHFCQUFxQjs7QUFFckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSw0QkFBNEIscUJBQXFCO0FBQ2pEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw4QkFBOEIsa0JBQWtCO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBNkIsd0JBQXdCO0FBQ3JEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCLGtCQUFrQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsd0JBQXdCLGlEQUFJO0FBQzVCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7O0FBRVQ7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDhCQUE4QixVQUFVO0FBQ3hDO0FBQ0EsYUFBYTs7QUFFYjtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7O0FBRUEsNkJBQTZCLFVBQVU7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxvREFBVztBQUN2QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQjtBQUNqQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksb0RBQVcsaUJBQWlCLHlCQUF5QjtBQUNqRSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxvREFBVyxnQkFBZ0IsK0JBQStCO0FBQ3RFOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0Isb0RBQVcsZUFBZSxxQkFBcUI7QUFDL0Q7QUFDQSxVQUFVO0FBQ1Y7QUFDQSxZQUFZLG9EQUFXLG1CQUFtQix5QkFBeUI7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxTQUFTLEVBQUM7QUFDTTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeFh3QjtBQUN6QjtBQUNJOztBQUVsQztBQUNBO0FBQ0Esa0JBQWtCLHNEQUFTO0FBQzNCLHNCQUFzQix5REFBYTs7QUFFbkMsdUNBQXVDLDJDQUFRO0FBQy9DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVDQUF1QywyQ0FBUTs7QUFFL0MsUUFBUSxtREFBVTtBQUNsQjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwrQkFBK0IsVUFBVTtBQUN6QztBQUNBLHNEQUFzRCxVQUFVO0FBQ2hFLG9CQUFvQixtREFBVTs7QUFFOUI7QUFDQSxrQkFBa0I7QUFDbEI7O0FBRUEsWUFBWSxrREFBUztBQUNyQixTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0Esc0JBQXNCLFVBQVU7QUFDaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCxVQUFVOztBQUU1RDtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUVBQWUsTUFBTSxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDekd0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxJQUFJLEVBQUM7QUFDQTs7Ozs7OztVQzlDcEI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7OztBQ04wQiIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZXZlbnRzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3BsYXllci5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3NoaXAuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGV2ZW50cyA9IHtcbiAgICBldmVudHM6IHt9LFxuICAgIG9uOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBmbikge1xuICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGZuKTtcbiAgICB9LFxuICAgIG9mZjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZm4pIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdW2ldID09PSBmbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBlbWl0OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBldmVudHM7XG4iLCJpbXBvcnQgZ2FtZWJvYXJkLCB7IGdhbWVib2FyZFZpZXcgfSBmcm9tICcuL2dhbWVib2FyZCc7XG5pbXBvcnQgcGxheWVyIGZyb20gJy4vcGxheWVyJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHNoaXAsIHsgc2hpcExpc3QgfSBmcm9tICcuL3NoaXAnO1xuXG5jb25zdCBnYW1lID0gKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBpbmZvQm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8tYm94Jyk7XG4gICAgY29uc3QgcmVzZXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3LWdhbWUtYnV0dG9uJyk7XG5cbiAgICBsZXQgcGxheWVycyA9IHsgcGxheWVyOiBwbGF5ZXIoMSksIGNvbXB1dGVyOiBwbGF5ZXIoMikgfTtcblxuICAgIHJlc2V0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVzZXRHYW1lKTtcblxuICAgIGV2ZW50cy5vbignYXR0YWNrSGl0JywgX2Fubm91bmNlSGl0KTtcbiAgICBldmVudHMub24oJ2F0dGFja01pc3NlZCcsIF9hbm5vdW5jZU1pc3MpO1xuICAgIGV2ZW50cy5vbignc2hpcFN1bmsnLCBfYW5ub3VuY2VTaW5raW5nKTtcblxuICAgIHN0YXJ0R2FtZSgpO1xuXG4gICAgYXN5bmMgZnVuY3Rpb24gc3RhcnRHYW1lKCkge1xuICAgICAgICBhd2FpdCBwcmVwYXJlQm9hcmQoKTtcbiAgICAgICAgc3RhcnRHYW1lTG9vcCgpO1xuICAgIH1cblxuICAgIGFzeW5jIGZ1bmN0aW9uIHByZXBhcmVCb2FyZCgpIHtcbiAgICAgICAgcGxhY2VTaGlwc1JhbmRvbWx5KHBsYXllcnMuY29tcHV0ZXIuZ2V0Qm9hcmQoKSk7XG4gICAgICAgIC8vIEF3YWl0IGZvciBzaGlwcyB0byBiZSBwbGFjZWRcbiAgICAgICAgYXdhaXQgZGlzcGxheVdlbGNvbWVNZXNzYWdlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzcGxheVdlbGNvbWVNZXNzYWdlKCkge1xuICAgICAgICAvLyBEaXNwbGF5IGluaXRpYWwgbWVzc2FnZVxuICAgICAgICBpbmZvQm94LmlubmVySFRNTCA9IGBQbGFjZSB5b3VyIHNoaXBzIDxidXR0b24gaWQ9XCJtYW51YWwtYnV0dG9uXCI+bWFudWFsbHk8L2J1dHRvbj4gb3IgPGJ1dHRvbiBpZD1cInJhbmRvbS1idXR0b25cIj5yYW5kb21seTwvYnV0dG9uPmA7XG5cbiAgICAgICAgLy8gUmVzb2x2ZSBwcm9taXNlIHdoZW4gcGxheWVyIGNob29zZXMgdG8gcGxhY2Ugc2hpcHMgbWFudWFsbHkgb3IgYXV0b21hdGljYWxseVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hbnVhbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYW51YWwtYnV0dG9uJyk7XG4gICAgICAgICAgICBtYW51YWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcGxhY2VTaGlwc01hbnVhbGx5KCkudGhlbigoKSA9PiByZXNvbHZlKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJhbmRvbUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyYW5kb20tYnV0dG9uJyk7XG4gICAgICAgICAgICByYW5kb21CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcGxhY2VTaGlwc1JhbmRvbWx5KHBsYXllcnMucGxheWVyLmdldEJvYXJkKCkpLnRoZW4oKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGFjZVNoaXBzUmFuZG9tbHkoZ2FtZWJvYXJkKSB7XG4gICAgICAgIC8vIEdlbmVyYXRlIHJhbmRvbSBjb29yZHMgYW5kIGRpcmVjdGlvbiBhbmQgdHJ5IHRvIHBsYWNlIHNoaXAgdW50aWwgaXQgc3VjY2VlZHNcbiAgICAgICAgY29uc3QgYXZhaWxhYmxlU2hpcHMgPSB7IC4uLnNoaXBMaXN0IH07XG5cbiAgICAgICAgZnVuY3Rpb24gcGxhY2VTaGlwKHNoaXApIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgICAgICAgIGNvbnN0IHJvdGF0ZSA9IE1hdGgucmFuZG9tKCkgPCAwLjU7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChyb3csIGNvbCwgc2hpcCwgcm90YXRlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcGxhY2VTaGlwKHNoaXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgc2hpcCBpbiBhdmFpbGFibGVTaGlwcykge1xuICAgICAgICAgICAgcGxhY2VTaGlwKHNoaXApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiByZXNvbHZlKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYWNlU2hpcHNNYW51YWxseSgpIHtcbiAgICAgICAgLy8gRm9yIGVhY2ggc2hpcCwgZW5hYmxlIHByZXZpZXcgYW5kIHJlc29sdmUgcHJvbWlzZSB3aGVuIHZhbGlkIHBvc2l0aW9uIGlzIHNlbGVjdGVkXG4gICAgICAgIGNvbnN0IGdhbWVib2FyZCA9IHBsYXllcnMucGxheWVyLmdldEJvYXJkKCk7XG4gICAgICAgIGxldCByb3RhdGUgPSBmYWxzZTtcblxuICAgICAgICBldmVudHMub24oJ3ByZXZpZXdSb3RhdGVkJywgKHJvdGF0aW9uKSA9PiB7XG4gICAgICAgICAgICByb3RhdGUgPSByb3RhdGlvbjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gcGxhY2VTaGlwKHNoaXApIHtcbiAgICAgICAgICAgIGV2ZW50cy5lbWl0KCdlbmFibGVQcmV2aWV3Jywgc2hpcCk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGZ1bmN0aW9uICh7IG93bmVyLCByb3csIGNvbCB9KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvd25lciA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZWJvYXJkLnBsYWNlU2hpcChyb3csIGNvbCwgc2hpcCwgcm90YXRlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5vZmYoJ3RpbGVTZWxlY3RlZCcsIGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9Cb3gudGV4dENvbnRlbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQ2Fubm90IHBsYWNlIHNoaXAgaW4gdGhpcyB0aWxlLiBDaG9vc2UgYSB2YWxpZCBwb3NpdGlvbic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgZXZlbnRzLm9uKCd0aWxlU2VsZWN0ZWQnLCBoYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGxhY2VJbnN0cnVjdGlvbnMgPSAoc2hpcCkgPT5cbiAgICAgICAgICAgIGBTZWxlY3QgYSB2YWxpZCB0aWxlIHRvIHBsYWNlIHRoZSA8c3Ryb25nPiR7c2hpcH08L3N0cm9uZz4uIFByZXNzICdDdHJsJyB0byByb3RhdGUgaXRgO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyBmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgZm9yIChsZXQgc2hpcCBpbiBzaGlwTGlzdCkge1xuICAgICAgICAgICAgICAgIGluZm9Cb3guaW5uZXJIVE1MID0gcGxhY2VJbnN0cnVjdGlvbnMoc2hpcCk7XG4gICAgICAgICAgICAgICAgYXdhaXQgcGxhY2VTaGlwKHNoaXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBmdW5jdGlvbiBzdGFydEdhbWVMb29wKCkge1xuICAgICAgICAvLyBSdW4gbWFpbiBsb29wLCBzd2l0Y2hpbmcgYmV0d2VlbiB0aGUgdHdvIHBsYXllcidzIHR1cm5zXG4gICAgICAgIC8vIEtlZXAgcnVubmluZyB1bnRpbCBvbmUgb2YgdGhlIHBsYXllcnMncyBzaGlwIGhhdmUgYmVlbiBkZXN0cm95ZWRcbiAgICAgICAgLy8gVGhlbiBhbm5vdW5jZSB3aW5uZXJcbiAgICAgICAgaW5mb0JveC50ZXh0Q29udGVudCA9ICdTZWxlY3QgYW4gZW5lbXkgcG9zaXRpb24gdG8gYXR0YWNrJztcblxuICAgICAgICBldmVudHMub24oJ3NoaXBTdW5rJywgKHsgcGxheWVyLCBzaGlwIH0pID0+IHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgPT09ICdwbGF5ZXInKSB7XG4gICAgICAgICAgICAgICAgcGxheWVycy5wbGF5ZXIuZGVzdHJveVNoaXAoc2hpcCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBsYXllcnMuY29tcHV0ZXIuZGVzdHJveVNoaXAoc2hpcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdoaWxlIChPYmplY3QudmFsdWVzKHBsYXllcnMpLmV2ZXJ5KChwbGF5ZXIpID0+IHBsYXllci5nZXRSZW1haW5pbmdTaGlwcygpICE9PSAwKSkge1xuICAgICAgICAgICAgYXdhaXQgcGxheWVycy5wbGF5ZXIucGxheWVyQXR0YWNrKHBsYXllcnMuY29tcHV0ZXIpO1xuICAgICAgICAgICAgLy8gVE9ETz8gOiBMb2cgZXJyb3IgbWVzc2FnZSB3aGVuIHNlbGVjdGluZyBhIHByZXZpb3VzbHkgc2VsZWN0ZWQgdGlsZSB3aGlsZSBub3QgcGFzc2luZyB0dXJuXG4gICAgICAgICAgICAvLyByZWplY3QoJ1RoaXMgdGlsZSBoYXMgYWxyZWFkeSBiZWVuIGF0dGFja2VkLiBTZWxlY3QgYSBuZXcgcG9zaXRpb24nKTtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLmNvbXB1dGVyLmNvbXB1dGVyQXR0YWNrKHBsYXllcnMucGxheWVyKS50aGVuKCgpID0+IHJlc29sdmUoKSk7XG4gICAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3aW5uZXIgPSBwbGF5ZXJzLmNvbXB1dGVyLmdldFJlbWFpbmluZ1NoaXBzKCkgPT09IDAgPyAncGxheWVyJyA6ICdjb21wdXRlcic7XG4gICAgICAgIGNvbnN0IGxvc2VyID0gcGxheWVycy5jb21wdXRlci5nZXRSZW1haW5pbmdTaGlwcygpID09PSAwID8gJ2NvbXB1dGVyJyA6ICdwbGF5ZXInO1xuXG4gICAgICAgIGluZm9Cb3guaW5uZXJIVE1MID0gYFRoZSA8c3Ryb25nPiR7d2lubmVyfTwvc3Ryb25nPiB3aW5zLiBBbGwgJHtsb3Nlcn0ncyBzaGlwcyBoYXZlIGJlZW4gZGVzdHJveWVkYDtcbiAgICAgICAgaW5mb0JveC5pbm5lckhUTUwgKz0gXCI8YnI+Q2xpY2sgdGhlICdOZXcgR2FtZScgYnV0dG9uIHRvIHN0YXJ0IG92ZXJcIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYW5ub3VuY2VIaXQoeyB0YXJnZXQsIHNoaXAgfSkge1xuICAgICAgICBpbmZvQm94LnRleHRDb250ZW50ID0gYCR7dGFyZ2V0fSdzICR7c2hpcC5nZXRDbGFzcygpfSBoYXMgYmVlbiBkYW1hZ2VkYDtcbiAgICB9XG4gICAgZnVuY3Rpb24gX2Fubm91bmNlTWlzcygpIHtcbiAgICAgICAgaW5mb0JveC50ZXh0Q29udGVudCA9ICdTaG90IG1pc3NlZCwgbGFuZGVkIGluIHdhdGVyJztcbiAgICB9XG4gICAgZnVuY3Rpb24gX2Fubm91bmNlU2lua2luZyh7IHRhcmdldCwgc2hpcCB9KSB7XG4gICAgICAgIGluZm9Cb3gudGV4dENvbnRlbnQgPSBgJHt0YXJnZXR9J3MgJHtzaGlwLmdldENsYXNzKCl9IGhhcyBiZWVuIHN1bmtgO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0R2FtZSgpIHtcbiAgICAgICAgZXZlbnRzLmVtaXQoJ2dhbWVSZXNldCcsICcnKTtcblxuICAgICAgICBPYmplY3QudmFsdWVzKHBsYXllcnMpLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLnJlc2V0KCkpO1xuXG4gICAgICAgIHN0YXJ0R2FtZSgpO1xuICAgIH1cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdhbWU7XG4iLCJpbXBvcnQgc2hpcCBmcm9tICcuL3NoaXAnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5cbmNvbnN0IHNoaXBMaXN0ID0ge1xuICAgIGNhcnJpZXI6IDUsXG4gICAgYmF0dGxlc2hpcDogNCxcbiAgICBkZXN0cm95ZXI6IDMsXG4gICAgc3VibWFyaW5lOiAzLFxuICAgIHBhdHJvbDogMixcbn07XG5cbmNvbnN0IGdhbWVib2FyZCA9IChvd25lciwgc2l6ZSA9IDEwKSA9PiB7XG4gICAgY29uc3QgbnJvd3MgPSBzaXplO1xuICAgIGNvbnN0IG5jb2x1bW5zID0gc2l6ZTtcbiAgICBsZXQgdGlsZXMgPSBbXTtcblxuICAgIGV2ZW50cy5vbignZ2FtZVJlc2V0JywgX2luaXRCb2FyZCk7XG5cbiAgICBfaW5pdEJvYXJkKCk7XG5cbiAgICBmdW5jdGlvbiBfaW5pdEJvYXJkKCkge1xuICAgICAgICAvLyBDcmVhdGUgYSB0aWxlIG9iamVjdCBjb3JyZXNwb25kaW5nIHRvIGVhY2ggb2YgdGhlIGdhbWUgdGlsZXNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBucm93czsgaSsrKSB7XG4gICAgICAgICAgICB0aWxlc1tpXSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuY29sdW1uczsgaisrKSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbaV1bal0gPSB0aWxlKG93bmVyLCBpLCBqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRpbGVzKCkge1xuICAgICAgICAvLyBGdW5jdGlvbiBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VGlsZUNvbnRlbnRzKCkge1xuICAgICAgICAvLyBGdW5jdGlvbiBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuICAgICAgICByZXR1cm4gdGlsZXMubWFwKChyb3cpID0+IHJvdy5tYXAoKHRpbGUpID0+IHRpbGUuZ2V0Q29udGVudHMoKSkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrUGxhY2VtZW50KHJvdywgY29sLCBzaGlwLCByb3RhdGUpIHtcbiAgICAgICAgLy8gQ3JlYXRlIG5ldyBzaGlwIGFuZCBhc3NpZ24gdGFyZ2V0IHRpbGVzIHRvIHBsYWNlIGl0XG4gICAgICAgIGNvbnN0IHRhcmdldFRpbGVzID0gW107XG4gICAgICAgIGNvbnN0IHNoaXBMZW5ndGggPSBzaGlwLmdldExlbmd0aCgpO1xuICAgICAgICBjb25zdCBheGlzID0gcm90YXRlID8gcm93IDogY29sOyAvLyBBeGlzIGFsb25nIHdoaWNoIGNoZWNrIHBsYWNlbWVudCAocm93IG9yIGNvbHMpXG4gICAgICAgIGNvbnN0IGVuZElkeCA9IGF4aXMgKyBzaGlwTGVuZ3RoO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIG9uZSBvZiB0aGUgdGFyZ2V0IHRpbGVzIGlzIG91dHNpZGUgb2YgYm9hcmQgbGltaXRzXG4gICAgICAgIGlmIChlbmRJZHggPiBzaXplKSByZXR1cm4geyB2YWxpZDogZmFsc2UsIHN0YXR1czogJ291dE9mQm91bmRzJyB9O1xuXG4gICAgICAgIC8vIFNlbGVjdCB0aWxlcyBhbG9uZyByb3dzIG9yIGNvbHVtbnMgc3RhcnRpbmcgYXQgc2VsZWN0ZWQgdGlsZVxuICAgICAgICBmb3IgKGxldCBpZHggPSBheGlzOyBpZHggPCBlbmRJZHg7IGlkeCsrKSB7XG4gICAgICAgICAgICB0YXJnZXRUaWxlcy5wdXNoKHJvdGF0ZSA/IHRpbGVzW2lkeF1bY29sXSA6IHRpbGVzW3Jvd11baWR4XSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRhcmdldFRpbGVzLmV2ZXJ5KCh0aWxlKSA9PiB0aWxlLmlzQXZhaWxhYmxlKCkpKVxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBzdGF0dXM6ICdpblVzZScgfTtcblxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgdGFyZ2V0OiB0YXJnZXRUaWxlcyB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYWNlU2hpcChyb3csIGNvbCwgc2hpcENsYXNzLCByb3RhdGUgPSBmYWxzZSkge1xuICAgICAgICAvLyBDaGVjayBpZiBzaGlwIHN0YXJ0aW5nIHBvc2l0aW9uIGlzIG91dHNpZGUgb2YgYm9hcmQgbGltaXRzXG4gICAgICAgIGlmIChyb3cgPiBucm93cyAtIDEgfHwgY29sID4gbmNvbHVtbnMgLSAxKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcGxhY2Ugc2hpcCBvdXRzaWRlIGJvYXJkIGxpbWl0cycpO1xuXG4gICAgICAgIGNvbnN0IG5ld1NoaXAgPSBzaGlwKHNoaXBDbGFzcyk7XG4gICAgICAgIGNvbnN0IGNoZWNrQXZhaWwgPSBjaGVja1BsYWNlbWVudChyb3csIGNvbCwgbmV3U2hpcCwgcm90YXRlKTtcblxuICAgICAgICBpZiAoY2hlY2tBdmFpbC52YWxpZCkge1xuICAgICAgICAgICAgY2hlY2tBdmFpbC50YXJnZXQubWFwKCh0aWxlKSA9PiB0aWxlLnBsYWNlU2hpcChuZXdTaGlwKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3U2hpcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjaGVja0F2YWlsLnN0YXR1cyA9PT0gJ291dE9mQm91bmRzJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2hpcCBjYW5ub3QgZ28gb3V0IG9mIGJvdW5kcycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGVja0F2YWlsLnN0YXR1cyA9PT0gJ2luVXNlJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT25lIG9yIG1vcmUgdGlsZXMgYXJlIGFscmVhZHkgb2NjdXBpZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlY2VpdmVBdHRhY2soeyByb3csIGNvbCB9KSB7XG4gICAgICAgIC8vIEVtaXQgYXR0YWNrIGF0IHRhcmdldCB0aWxlIGFuZCB3YWl0IGZvciByZXNwb25zZVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHRpbGVzW3Jvd11bY29sXS50YXJnZXQoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0VGlsZXMsXG4gICAgICAgIGdldFRpbGVDb250ZW50cyxcbiAgICAgICAgY2hlY2tQbGFjZW1lbnQsXG4gICAgICAgIHBsYWNlU2hpcCxcbiAgICAgICAgcmVjZWl2ZUF0dGFjayxcbiAgICB9O1xufTtcblxuY29uc3QgZ2FtZWJvYXJkVmlldyA9IChvd25lciwgZ2FtZWJvYXJkKSA9PiB7XG4gICAgY29uc3QgaXNQbGF5ZXIgPSBvd25lciA9PT0gJ3BsYXllcicgPyB0cnVlIDogZmFsc2U7XG4gICAgY29uc3QgYm9hcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtvd25lcn0tYm9hcmRgKTtcbiAgICBjb25zdCBzaGlwc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke293bmVyfS1zaGlwc2ApO1xuXG4gICAgbGV0IHRpbGVzO1xuXG4gICAgbGV0IHNoaXBzRGlzcGxheTtcbiAgICBsZXQgcHJldmlld0Nvb3JkcztcbiAgICBsZXQgcmVuZGVyUHJldmlld0hhbmRsZXJzO1xuICAgIGxldCBjbGVhclByZXZpZXdIYW5kbGVycztcblxuICAgIF9pbml0VmlldygpO1xuXG4gICAgZXZlbnRzLm9uKCdzaGlwUGxhY2VkJywgX3JlbmRlck5ld1NoaXApO1xuICAgIGV2ZW50cy5vbignc2hpcFBsYWNlZCcsIF9jbGVhclByZXZpZXcpO1xuICAgIGV2ZW50cy5vbignYXR0YWNrSGl0JywgX3JlbmRlckF0dGFjayk7XG4gICAgZXZlbnRzLm9uKCdhdHRhY2tNaXNzZWQnLCBfcmVuZGVyTWlzcyk7XG4gICAgZXZlbnRzLm9uKCdlbmFibGVQcmV2aWV3JywgX3ByZXZpZXdQbGFjZW1lbnQpO1xuICAgIGV2ZW50cy5vbignZ2FtZVJlc2V0JywgX2luaXRWaWV3KTtcblxuICAgIGZ1bmN0aW9uIF9pbml0VmlldygpIHtcbiAgICAgICAgLy8gUmVzZXQgRE9NIGNvbXBvbmVudHMgYW5kIGNyZWF0ZSB0aGVtXG4gICAgICAgIF9yZXNldFZpZXcoKTtcbiAgICAgICAgX2NyZWF0ZUJvYXJkKGJvYXJkLCAxMCk7XG4gICAgICAgIF9jcmVhdGVTaGlwc0Rpc3BsYXkoc2hpcHNDb250YWluZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZXNldFZpZXcoKSB7XG4gICAgICAgIGJvYXJkLmlubmVySFRNTCA9ICcnO1xuICAgICAgICBzaGlwc0NvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICB0aWxlcyA9IFtdO1xuXG4gICAgICAgIHNoaXBzRGlzcGxheSA9IHt9O1xuICAgICAgICBwcmV2aWV3Q29vcmRzID0gbnVsbDtcbiAgICAgICAgcmVuZGVyUHJldmlld0hhbmRsZXJzID0gW107XG4gICAgICAgIGNsZWFyUHJldmlld0hhbmRsZXJzID0gW107XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZUJvYXJkKGJvYXJkLCBzaXplKSB7XG4gICAgICAgIGNvbnN0IHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICAgICAgY29uc3QgbmNvbHMgPSBzaXplO1xuXG4gICAgICAgIC8vIFRoZSBjb2x1bW4gaGVhZGVyIGZvciB0aGUgcGxheWVyIGFuZCBjb21wdXRlclxuICAgICAgICAvL2FyZSBwbGFjZWQgaW4gdGhlIHJpZ2h0IGFuZCBsZWZ0IGNvbHVtbnMgcmVzcGVjdGl2ZWx5XG4gICAgICAgIGNvbnN0IGNvbEhlYWRlciA9IGlzUGxheWVyID8gMCA6IG5jb2xzO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHNpemU7IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgIT09IHNpemUpIHRpbGVzW2ldID0gW107XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0YWJsZS5pbnNlcnRSb3coKTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IG5jb2xzOyBqKyspIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgcmVhbCBjb2x1bW4gaW5kZXggc3RhcnRzIGF0IGo9MSBmb3IgdGhlIHBsYXllclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbElkeCA9IGlzUGxheWVyID8gaiAtIDEgOiBqO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuaW5zZXJ0Q2VsbCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IHNpemUgJiYgaiA9PT0gY29sSGVhZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgnY29ybmVyLWNlbGwnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGogPT09IGNvbEhlYWRlcikge1xuICAgICAgICAgICAgICAgICAgICBjZWxsLnRleHRDb250ZW50ID0gaSArIDE7XG4gICAgICAgICAgICAgICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgncm93LWhlYWRlcicsIGlzUGxheWVyID8gJ2FsaWduLXJpZ2h0JyA6ICdhbGlnbi1sZWZ0Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpID09PSBzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNlbGwudGV4dENvbnRlbnQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgY29sSWR4KTtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKCdjb2x1bW4taGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm93JywgaSk7XG4gICAgICAgICAgICAgICAgICAgIGNlbGwuc2V0QXR0cmlidXRlKCdkYXRhLWNvbHVtbicsIGNvbElkeCk7XG5cbiAgICAgICAgICAgICAgICAgICAgY2VsbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5lbWl0KCd0aWxlU2VsZWN0ZWQnLCB7IG93bmVyLCByb3c6IGksIGNvbDogY29sSWR4IH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aWxlc1tpXVtjb2xJZHhdID0gY2VsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYm9hcmQuYXBwZW5kQ2hpbGQodGFibGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVTaGlwc0Rpc3BsYXkoZGlzcGxheSkge1xuICAgICAgICAvLyBDcmVhdGUgYSBkaXYgZm9yIGVhY2ggc2hpcCB3aXRoIHRoZSBudW1iZXIgb2Ygc3F1YXJlcyBjb3JyZXNwb25kaW5nIHRvIHRoZWlyIGhwXG4gICAgICAgIGZvciAobGV0IHNoaXAgaW4gc2hpcExpc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3NoaXAtZGlzcGxheScpO1xuICAgICAgICAgICAgY29udGFpbmVyLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gaXNQbGF5ZXIgPyAnZmxleC1lbmQnIDogJ2ZsZXgtc3RhcnQnO1xuXG4gICAgICAgICAgICBzaGlwc0Rpc3BsYXlbc2hpcF0gPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gc2hpcExpc3Rbc2hpcF07IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgaHAuY2xhc3NMaXN0LmFkZCgnc2hpcC1ocCcpO1xuXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGhwKTtcbiAgICAgICAgICAgICAgICBzaGlwc0Rpc3BsYXlbc2hpcF0ucHVzaChocCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRpc3BsYXkuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZW5kZXJOZXdTaGlwKHsgcGxheWVyLCByb3csIGNvbCB9KSB7XG4gICAgICAgIC8vIE9ubHkgcmVuZGVyIHNoaXBzIGZvciB0aGUgcGxheWVyLiBLZWVwIGNvbXB1dGVyJ3Mgc2hpcHMgaGlkZGVuXG4gICAgICAgIGlmIChwbGF5ZXIgPT09IG93bmVyICYmIG93bmVyICE9ICdjb21wdXRlcicpIHtcbiAgICAgICAgICAgIHRpbGVzW3Jvd11bY29sXS5jbGFzc0xpc3QuYWRkKCdzaGlwJyk7XG4gICAgICAgICAgICBfcmVtb3ZlUHJldmlld0xpc3RlbmVycygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlbmRlckF0dGFjayh7IHRhcmdldCwgcm93LCBjb2wsIHNoaXAgfSkge1xuICAgICAgICAvLyBBcHBseSBhdHRhY2sgdG8gc2VsZWN0ZWQgdGlsZSBhbmQgdG8gdGhlIGNvcnJlc3BvbmRpbmcgc2hpcCdzIGhwIGRpc3BsYXlcbiAgICAgICAgaWYgKHRhcmdldCA9PT0gb3duZXIpIHtcbiAgICAgICAgICAgIHRpbGVzW3Jvd11bY29sXS5jbGFzc0xpc3QuYWRkKCdoaXQnKTtcblxuICAgICAgICAgICAgY29uc3Qgc2hpcENsYXNzID0gc2hpcC5nZXRDbGFzcygpO1xuICAgICAgICAgICAgY29uc3Qgc2hpcEhQID0gc2hpcC5nZXRIUCgpO1xuXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IG93bmVyID09PSAncGxheWVyJyA/IHNoaXBIUCA6IHNoaXBMaXN0W3NoaXBDbGFzc10gLSBzaGlwSFAgLSAxO1xuICAgICAgICAgICAgY29uc3QgaHBEaXYgPSBzaGlwc0Rpc3BsYXlbc2hpcENsYXNzXVtpbmRleF07XG4gICAgICAgICAgICBocERpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmVkJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZW5kZXJNaXNzKHsgdGFyZ2V0LCByb3csIGNvbCB9KSB7XG4gICAgICAgIGlmICh0YXJnZXQgPT09IG93bmVyKSB7XG4gICAgICAgICAgICB0aWxlc1tyb3ddW2NvbF0uY2xhc3NMaXN0LmFkZCgnbWlzcycpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3ByZXZpZXdQbGFjZW1lbnQoc2hpcENsYXNzKSB7XG4gICAgICAgIC8vIEFsbG93IHByZXZpZXcgb25seSBmb3IgdGhlIHBsYXllcidzIHNoaXBzXG4gICAgICAgIGlmIChvd25lciA9PT0gJ2NvbXB1dGVyJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5ld1NoaXAgPSBzaGlwKHNoaXBDbGFzcyk7XG4gICAgICAgIGxldCByb3RhdGUgPSBmYWxzZTtcblxuICAgICAgICB0aWxlcy5mb3JFYWNoKChyb3csIGkpID0+IHtcbiAgICAgICAgICAgIHJlbmRlclByZXZpZXdIYW5kbGVyc1tpXSA9IFtdO1xuICAgICAgICAgICAgcm93LmZvckVhY2goKHRpbGUsIGopID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB3cmFwcGVyID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcHJldmlld0Nvb3JkcyA9IF9yZW5kZXJQcmV2aWV3KGksIGosIG5ld1NoaXAsIHJvdGF0ZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aWxlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHdyYXBwZXIpO1xuICAgICAgICAgICAgICAgIHJlbmRlclByZXZpZXdIYW5kbGVyc1tpXVtqXSA9IHdyYXBwZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGlsZXMuZm9yRWFjaCgocm93LCBpKSA9PiB7XG4gICAgICAgICAgICBjbGVhclByZXZpZXdIYW5kbGVyc1tpXSA9IFtdO1xuICAgICAgICAgICAgcm93LmZvckVhY2goKHRpbGUsIGopID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB3cmFwcGVyID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZpZXdDb29yZHMgIT09IG51bGwpIHByZXZpZXdDb29yZHMuZm9yRWFjaChfY2xlYXJQcmV2aWV3KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRpbGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCB3cmFwcGVyKTtcbiAgICAgICAgICAgICAgICBjbGVhclByZXZpZXdIYW5kbGVyc1tpXVtqXSA9IHdyYXBwZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICAgICAgICByb3RhdGUgPSBfcm90YXRlUHJldmlldyhlLCByb3RhdGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVuZGVyUHJldmlldyhyb3csIGNvbCwgc2hpcCwgcm90YXRlKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHNoaXAgY2FuIGJlIHBsYWNlZFxuICAgICAgICAvLyBJZiBzbywgYWRkIHByZXZpZXcgaW4gY29ycmVzcG9uZGluZyB0aWxlc1xuICAgICAgICBjb25zdCBjaGVja1RpbGVzID0gZ2FtZWJvYXJkLmNoZWNrUGxhY2VtZW50KHJvdywgY29sLCBzaGlwLCByb3RhdGUpO1xuXG4gICAgICAgIGlmIChjaGVja1RpbGVzLnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zdCBjb29yZHMgPSBjaGVja1RpbGVzLnRhcmdldC5tYXAoKHRpbGUpID0+IHRpbGUuZ2V0Q29vcmRzKCkpO1xuXG4gICAgICAgICAgICBjb29yZHMuZm9yRWFjaCgoeyByb3csIGNvbCB9KSA9PiB7XG4gICAgICAgICAgICAgICAgdGlsZXNbcm93XVtjb2xdLmNsYXNzTGlzdC5hZGQoJ3ByZXZpZXcnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY2xlYXJQcmV2aWV3KHsgcm93LCBjb2wgfSkge1xuICAgICAgICB0aWxlc1tyb3ddW2NvbF0uY2xhc3NMaXN0LnJlbW92ZSgncHJldmlldycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yb3RhdGVQcmV2aWV3KGUsIHJvdGF0ZSkge1xuICAgICAgICBpZiAoZS5rZXkgPT09ICdDb250cm9sJykge1xuICAgICAgICAgICAgZXZlbnRzLmVtaXQoJ3ByZXZpZXdSb3RhdGVkJywgIXJvdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gIXJvdGF0ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZW1vdmVQcmV2aWV3TGlzdGVuZXJzKCkge1xuICAgICAgICBpZiAocHJldmlld0Nvb3JkcyAhPT0gbnVsbCkgcHJldmlld0Nvb3Jkcy5mb3JFYWNoKF9jbGVhclByZXZpZXcpO1xuXG4gICAgICAgIGlmIChyZW5kZXJQcmV2aWV3SGFuZGxlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICB0aWxlcy5mb3JFYWNoKChyb3csIGkpID0+IHtcbiAgICAgICAgICAgICAgICByb3cuZm9yRWFjaCgodGlsZSwgaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aWxlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHJlbmRlclByZXZpZXdIYW5kbGVyc1tpXVtqXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjbGVhclByZXZpZXdIYW5kbGVycy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIHRpbGVzLmZvckVhY2goKHJvdywgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJvdy5mb3JFYWNoKCh0aWxlLCBqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBjbGVhclByZXZpZXdIYW5kbGVyc1tpXVtqXSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlclByZXZpZXdIYW5kbGVycyA9IFtdO1xuICAgICAgICBjbGVhclByZXZpZXdIYW5kbGVycyA9IFtdO1xuICAgIH1cbn07XG5cbmNvbnN0IHRpbGUgPSAob3duZXIsIHJvdywgY29sKSA9PiB7XG4gICAgbGV0IHNoaXAgPSBudWxsO1xuICAgIGxldCBoaXQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGdldENvb3JkcygpIHtcbiAgICAgICAgcmV0dXJuIHsgcm93LCBjb2wgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDb250ZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHNoaXA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxhY2VTaGlwKG5ld1NoaXApIHtcbiAgICAgICAgLy8gUGxhY2Ugc2hpcCBpbiB0aWxlIGlmIGl0IGlzIGF2YWlsYWJsZSBhbmQgZW1pdCBldmVudFxuICAgICAgICAvLyBJZiBub3QsIHRocm93IGVycm9yXG4gICAgICAgIGlmIChpc0F2YWlsYWJsZSgpKSB7XG4gICAgICAgICAgICBzaGlwID0gbmV3U2hpcDtcbiAgICAgICAgICAgIGV2ZW50cy5lbWl0KCdzaGlwUGxhY2VkJywgeyBwbGF5ZXI6IG93bmVyLCByb3csIGNvbCB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbm5vdCBwbGFjZSBhIHNoaXAgaGVyZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGFyZ2V0KCkge1xuICAgICAgICAvLyBDaGVjayBpcyB0aGUgdGFyZ2V0IHRpbGUgaGFzIGJlZW4gYWxyZWFkeSBoaXQgYnkgYW5kIGF0dGFja1xuICAgICAgICBpZiAoaGl0KSB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdGlsZSBoYXMgYWxyZWFkeSBiZWVuIGF0dGFja2VkJyk7XG5cbiAgICAgICAgLy8gSWYgbm90LCBsYW5kIGF0dGFjayBhbmQgcmVwb3J0IGlmIGl0IGhpdHMgKGFuZC9vciBzaW5rcykgYSBzaGlwIG9yIG1pc3Nlc1xuICAgICAgICAvLyBFbWl0IGFwcHJvcHJpYXRlIGV2ZW50XG4gICAgICAgIGxldCByZXBvcnQgPSB7fTtcbiAgICAgICAgaWYgKHNoaXAgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHNoaXAuaGl0KCk7XG4gICAgICAgICAgICBldmVudHMuZW1pdCgnYXR0YWNrSGl0JywgeyB0YXJnZXQ6IG93bmVyLCByb3csIGNvbCwgc2hpcCB9KTtcbiAgICAgICAgICAgIHJlcG9ydFsnc3RhdHVzJ10gPSAnaGl0JztcblxuICAgICAgICAgICAgaWYgKHNoaXAuZ2V0SFAoKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlcG9ydFsnc2luayddID0gc2hpcDtcbiAgICAgICAgICAgICAgICBldmVudHMuZW1pdCgnc2hpcFN1bmsnLCB7IHRhcmdldDogb3duZXIsIHNoaXAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBvcnRbJ3N0YXR1cyddID0gJ21pc3MnO1xuICAgICAgICAgICAgZXZlbnRzLmVtaXQoJ2F0dGFja01pc3NlZCcsIHsgdGFyZ2V0OiBvd25lciwgcm93LCBjb2wgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaGl0ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZSgpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBzaGlwIG9yIGl0IGhhcyBhbHJlYWR5IGJlZW4gdGFyZ2V0ZWQgYnkgYW5kIGF0dGFja1xuICAgICAgICByZXR1cm4gKHNoaXAgPT09IG51bGwpICYgIWhpdDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRDb29yZHMsXG4gICAgICAgIGdldENvbnRlbnRzLFxuICAgICAgICBwbGFjZVNoaXAsXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgaXNBdmFpbGFibGUsXG4gICAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdhbWVib2FyZDtcbmV4cG9ydCB7IHRpbGUsIGdhbWVib2FyZFZpZXcgfTtcbiIsImltcG9ydCBnYW1lYm9hcmQsIHsgZ2FtZWJvYXJkVmlldyB9IGZyb20gJy4vZ2FtZWJvYXJkJztcbmltcG9ydCBldmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0IHsgc2hpcExpc3QgfSBmcm9tICcuL3NoaXAnO1xuXG5jb25zdCBwbGF5ZXIgPSAobnVtKSA9PiB7XG4gICAgY29uc3QgbmFtZSA9IG51bSA9PT0gMSA/ICdwbGF5ZXInIDogJ2NvbXB1dGVyJztcbiAgICBjb25zdCBib2FyZCA9IGdhbWVib2FyZChuYW1lKTtcbiAgICBjb25zdCBib2FyZFZpZXcgPSBnYW1lYm9hcmRWaWV3KG5hbWUsIGJvYXJkKTtcblxuICAgIGxldCByZW1haW5pbmdTaGlwcyA9IE9iamVjdC52YWx1ZXMoc2hpcExpc3QpO1xuICAgIGxldCBhdHRhY2tIYW5kbGVyO1xuICAgIC8vIGxldCBwcmV2QXR0YWNrID0gbnVsbDtcbiAgICAvLyBsZXQgYXR0YWNrUXVldWUgPSBudWxsO1xuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIHJlbWFpbmluZ1NoaXBzID0gT2JqZWN0LnZhbHVlcyhzaGlwTGlzdCk7XG5cbiAgICAgICAgZXZlbnRzLm9mZigndGlsZVNlbGVjdGVkJywgYXR0YWNrSGFuZGxlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Qm9hcmQoKSB7XG4gICAgICAgIHJldHVybiBib2FyZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCb2FyZFZpZXcoKSB7XG4gICAgICAgIHJldHVybiBib2FyZFZpZXc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVtYWluaW5nU2hpcHMoKSB7XG4gICAgICAgIHJldHVybiByZW1haW5pbmdTaGlwcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVzdHJveVNoaXAoc2hpcCkge1xuICAgICAgICByZW1haW5pbmdTaGlwcyA9IHJlbWFpbmluZ1NoaXBzLmZpbHRlcigoc2hpcENsYXNzKSA9PiBzaGlwLmdldENsYXNzKCkgIT09IHNoaXBDbGFzcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheWVyQXR0YWNrKHRhcmdldCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgYXR0YWNrSGFuZGxlciA9ICh7IHJvdywgY29sIH0pID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuZ2V0Qm9hcmQoKS5yZWNlaXZlQXR0YWNrKHsgcm93LCBjb2wgfSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cy5vZmYoJ3RpbGVTZWxlY3RlZCcsIGF0dGFja0hhbmRsZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGV2ZW50cy5vbigndGlsZVNlbGVjdGVkJywgYXR0YWNrSGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXB1dGVyQXR0YWNrKHRhcmdldCkge1xuICAgICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgQUkgdG8gZm9yIHNtYXJ0IHRhcmdldGluZ1xuICAgICAgICAvLyBjb25zdCBuZXh0T2Zmc2V0cyA9IFstNSwgLTQsIC0zLCAtMiwgMSwgMiwgMywgNF07XG5cbiAgICAgICAgLy8gbGV0IGF0dGFja0Nvb3JkcztcblxuICAgICAgICAvLyBmdW5jdGlvbiBnZXROZXdDb29yZHMoYXR0YWNrQ29vcmRzKSB7XG4gICAgICAgIC8vICAgICAvLyBDYWxjdWxhdGUgcG9zc2libGUgbW92ZXMgaW4gYSBjcm9zcyBzaGFwZSBhbmQgZmlsdGVyIG9uZXMgb3V0IG9mIGJvdW5kc1xuICAgICAgICAvLyAgICAgbGV0IG9mZnNldHMgPSBbXG4gICAgICAgIC8vICAgICAgICAgWy0xLCAwXSxcbiAgICAgICAgLy8gICAgICAgICBbMSwgMF0sXG4gICAgICAgIC8vICAgICAgICAgWzAsIC0xXSxcbiAgICAgICAgLy8gICAgICAgICBbMCwgMV0sXG4gICAgICAgIC8vICAgICBdO1xuICAgICAgICAvLyAgICAgYXR0YWNrUXVldWUgPSBvZmZzZXRzLm1hcCgob2Zmc2V0KSA9PiAoe1xuICAgICAgICAvLyAgICAgICAgIHJvdzogYXR0YWNrQ29vcmRzLnJvdyArIG9mZnNldFswXSxcbiAgICAgICAgLy8gICAgICAgICBjb2w6IGF0dGFja0Nvb3Jkcy5jb2wgKyBvZmZzZXRbMV0sXG4gICAgICAgIC8vICAgICAgICAgcm93T2Zmc2V0OiBvZmZzZXRbMF0sXG4gICAgICAgIC8vICAgICAgICAgY29sT2Zmc2V0OiBvZmZzZXRbMV0sXG4gICAgICAgIC8vICAgICB9KSk7XG4gICAgICAgIC8vICAgICByZXR1cm4gYXR0YWNrUXVldWUuZmlsdGVyKFxuICAgICAgICAvLyAgICAgICAgICh7IHJvdywgY29sIH0pID0+IHJvdyA+PSAwICYmIHJvdyA8PSAxMCAmJiBjb2wgPj0gMCAmJiBjb2wgPD0gMTBcbiAgICAgICAgLy8gICAgICk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICAgICAgICAgICAgICB0YXJnZXQuZ2V0Qm9hcmQoKS5yZWNlaXZlQXR0YWNrKHsgcm93LCBjb2wgfSk7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNvbXB1dGVyQXR0YWNrKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXNldCxcbiAgICAgICAgZ2V0TmFtZSxcbiAgICAgICAgZ2V0Qm9hcmQsXG4gICAgICAgIGdldEJvYXJkVmlldyxcbiAgICAgICAgZ2V0UmVtYWluaW5nU2hpcHMsXG4gICAgICAgIGRlc3Ryb3lTaGlwLFxuICAgICAgICBwbGF5ZXJBdHRhY2ssXG4gICAgICAgIGNvbXB1dGVyQXR0YWNrLFxuICAgIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwbGF5ZXI7XG4iLCJjb25zdCBzaGlwTGlzdCA9IHtcbiAgICBjYXJyaWVyOiA1LFxuICAgIGJhdHRsZXNoaXA6IDQsXG4gICAgZGVzdHJveWVyOiAzLFxuICAgIHN1Ym1hcmluZTogMyxcbiAgICBwYXRyb2w6IDIsXG59O1xuXG5jb25zdCBzaGlwID0gKHNoaXBDbGFzcykgPT4ge1xuICAgIGNvbnN0IGxlbmd0aCA9IHNoaXBMaXN0W3NoaXBDbGFzc107XG4gICAgbGV0IGhwID0gbGVuZ3RoO1xuXG4gICAgZnVuY3Rpb24gaGl0KCkge1xuICAgICAgICAvLyBJZiBzaGlwIGhhcyBub3QgYmVlbiBzdW5rLCB0YWtlIDEgSFBcbiAgICAgICAgaWYgKGlzU3VuaygpKSByZXR1cm47XG5cbiAgICAgICAgaHAgLT0gMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRIUCgpIHtcbiAgICAgICAgcmV0dXJuIGhwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzU3VuaygpIHtcbiAgICAgICAgLy8gUmV0dXJuIHRydWUgaWYgbm8gSFBzIGxlZnRcbiAgICAgICAgcmV0dXJuIGhwID09PSAwID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldExlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDbGFzcygpIHtcbiAgICAgICAgcmV0dXJuIHNoaXBDbGFzcztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRIUCxcbiAgICAgICAgZ2V0TGVuZ3RoLFxuICAgICAgICBnZXRDbGFzcyxcbiAgICAgICAgaXNTdW5rLFxuICAgICAgICBoaXQsXG4gICAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNoaXA7XG5leHBvcnQgeyBzaGlwTGlzdCB9O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgZ2FtZSBmcm9tICcuL2dhbWUnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
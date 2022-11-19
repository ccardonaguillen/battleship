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




(function game() {})();

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

const gameboard = (player, size = 10) => {
    const nrows = size;
    const ncolumns = size;
    let tiles = [];

    for (let i = 0; i < nrows; i++) {
        let temp = [];
        for (let j = 0; j < ncolumns; j++) {
            temp.push(tile(i, j));
        }
        tiles.push(temp);
    }

    function getTiles() {
        return tiles;
    }

    function getTileContents() {
        return tiles.map((row) => row.map((tile) => tile.getContents()));
    }

    function placeShip(row, column, shipClass, horizontal = true) {
        // Check if ship starting position is outside of board limits
        if (row > nrows - 1 || column > ncolumns - 1)
            throw new Error('Cannot place ship outside board limits');

        // Create new ship and assign target tiles to place it
        const newShip = (0,_ship__WEBPACK_IMPORTED_MODULE_0__["default"])(shipClass);
        const targetTiles = [];
        if (horizontal) {
            // Select tiles along columns starting at selected tile
            for (let j = column; j < column + newShip.getLength(); j++) {
                targetTiles.push(tiles[row][j]);
            }
        } else {
            // Select tiles along rows starting at selected tile
            for (let i = row; i < row + newShip.getLength(); i++) {
                targetTiles.push(tiles[i][column]);
            }
        }

        // Check if one of the target tiles is outside of board limits (undefined)
        if (targetTiles.some((tile) => tile === undefined))
            throw new Error('Ship cannot go out of bounds');

        // Check if any of the target tiles is occupied
        try {
            targetTiles.map((tile) => tile.placeShip(newShip));
        } catch (error) {
            throw new Error('One or more tiles are already occupied');
        }

        return newShip;
    }

    function receiveAttack(row, column) {
        try {
            tiles[row][column].target();
        } catch (error) {
            throw error;
        }
    }

    return {
        getTiles,
        getTileContents,
        placeShip,
        receiveAttack,
    };
};

const gameboardView = (gameboard) => {
    const board = document.getElementById('player1-board');
    const shipsContainer = document.getElementById('player1-ships');

    let tiles = [];

    createBoard(board, 10);
    createShipsDisplay(shipsContainer);

    tiles.forEach((tile) =>
        tile.addEventListener('click', () => {
            _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('tileSelected', {
                row: tile.getAttribute('data-row'),
                column: tile.getAttribute('data-column'),
            });
        })
    );

    function placeShips() {}

    function createBoard(board, size, isPlayer1 = true) {
        const table = document.createElement('table');
        const ncolumns = size;

        for (let i = 0; i <= size; i++) {
            let tempArr = [];
            const row = table.insertRow();
            for (let j = 0; j <= ncolumns; j++) {
                const cell = row.insertCell();

                if (
                    (isPlayer1 && i === size && j === 0) ||
                    (!isPlayer1 && i === size && j === ncolumns)
                ) {
                    cell.classList.add('corner-cell');
                    continue;
                }

                if ((isPlayer1 && j === 0) || (!isPlayer1 && j === ncolumns)) {
                    cell.textContent = i;
                    cell.classList.add('row-header');
                    if (isPlayer1) {
                        cell.classList.add('align-right');
                    } else {
                        cell.classList.add('align-left');
                    }
                }

                if (i === size) {
                    const charCode = isPlayer1 ? 65 + j - 1 : 65 + j;
                    cell.textContent = String.fromCharCode(charCode);
                    cell.classList.add('column-header');
                }

                const dataRow = isPlayer1 ? i - 1 : i;

                cell.setAttribute('data-row', data - row);
                cell.setAttribute('data-column', j);
                temp.push(cell);
            }
            tiles.push(temp);
        }

        board.appendChild(table);
    }

    function createShipsDisplay(shipsDisplay, alignRight = true) {
        for (let ship in ships) {
            const shipContainer = document.createElement('div');
            shipContainer.classList.add();
            shipContainer.style.display = 'flex';
            shipContainer.style.gap = '2px';
            shipContainer.style.justifyContent = alignRight ? 'flex-end' : 'flex-start';

            for (let i = 1; i <= ships[ship]; i++) {
                const shipHP = document.createElement('div');
                shipHP.classList.add('ship-hp');

                shipContainer.appendChild(shipHP);
            }

            shipsDisplay.appendChild(shipContainer);
        }
    }
};

const tile = (row, column) => {
    let ship = null;
    let hit = false;

    function getContents() {
        return ship;
    }

    function placeShip(newShip) {
        // Place ship in tile if it is available
        if (isAvailable()) {
            ship = newShip;
        } else {
            throw new Error('You cannot place a ship here');
        }
    }

    function target() {
        if (hit) throw new Error('This tile has already been attacked');

        if (ship !== null) {
            ship.hit();
            _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('attackHit', ship);

            if (ship.getHP() === 0) _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('shipSunk', ship);
        } else {
            _events__WEBPACK_IMPORTED_MODULE_1__["default"].emit('attackMissed');
        }
        hit = true;
    }

    function isAvailable() {
        // Check if there is a ship or it has already been targeted by and attack
        return (ship === null) & !hit;
    }

    return {
        getContents,
        placeShip,
        isAvailable,
        target,
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
const player = (num, name) => {};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (player);


/***/ }),

/***/ "./src/ship.js":
/*!*********************!*\
  !*** ./src/ship.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
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
        if (isSunk()) return;

        hp -= 1;
    }

    function getHP() {
        return hp;
    }

    function isSunk() {
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


console.log('hello');

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNOMEI7O0FBRTFCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9ldmVudHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9nYW1lLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2JhdHRsZXNoaXAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZXZlbnRzID0ge1xuICAgIGV2ZW50czoge30sXG4gICAgb246IGZ1bmN0aW9uIChldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSB0aGlzLmV2ZW50c1tldmVudE5hbWVdIHx8IFtdO1xuICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goZm4pO1xuICAgIH0sXG4gICAgb2ZmOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBmbikge1xuICAgICAgICBpZiAodGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmV2ZW50c1tldmVudE5hbWVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV1baV0gPT09IGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGVtaXQ6IGZ1bmN0aW9uIChldmVudE5hbWUsIGRhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbihkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGV2ZW50cztcbiIsImltcG9ydCB7IGdhbWVib2FyZCwgZ2FtZWJvYXJkVmlldyB9IGZyb20gJy4vZ2FtZWJvYXJkJztcbmltcG9ydCBwbGF5ZXIgZnJvbSAnLi9wbGF5ZXInO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5cbihmdW5jdGlvbiBnYW1lKCkge30pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdhbWU7XG4iLCJpbXBvcnQgc2hpcCBmcm9tICcuL3NoaXAnO1xuaW1wb3J0IGV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5cbmNvbnN0IHNoaXBMaXN0ID0ge1xuICAgIGNhcnJpZXI6IDUsXG4gICAgYmF0dGxlc2hpcDogNCxcbiAgICBkZXN0cm95ZXI6IDMsXG4gICAgc3VibWFyaW5lOiAzLFxuICAgIHBhdHJvbDogMixcbn07XG5cbmNvbnN0IGdhbWVib2FyZCA9IChwbGF5ZXIsIHNpemUgPSAxMCkgPT4ge1xuICAgIGNvbnN0IG5yb3dzID0gc2l6ZTtcbiAgICBjb25zdCBuY29sdW1ucyA9IHNpemU7XG4gICAgbGV0IHRpbGVzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5yb3dzOyBpKyspIHtcbiAgICAgICAgbGV0IHRlbXAgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuY29sdW1uczsgaisrKSB7XG4gICAgICAgICAgICB0ZW1wLnB1c2godGlsZShpLCBqKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGlsZXMucHVzaCh0ZW1wKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRpbGVDb250ZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRpbGVzLm1hcCgocm93KSA9PiByb3cubWFwKCh0aWxlKSA9PiB0aWxlLmdldENvbnRlbnRzKCkpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGFjZVNoaXAocm93LCBjb2x1bW4sIHNoaXBDbGFzcywgaG9yaXpvbnRhbCA9IHRydWUpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgc2hpcCBzdGFydGluZyBwb3NpdGlvbiBpcyBvdXRzaWRlIG9mIGJvYXJkIGxpbWl0c1xuICAgICAgICBpZiAocm93ID4gbnJvd3MgLSAxIHx8IGNvbHVtbiA+IG5jb2x1bW5zIC0gMSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHBsYWNlIHNoaXAgb3V0c2lkZSBib2FyZCBsaW1pdHMnKTtcblxuICAgICAgICAvLyBDcmVhdGUgbmV3IHNoaXAgYW5kIGFzc2lnbiB0YXJnZXQgdGlsZXMgdG8gcGxhY2UgaXRcbiAgICAgICAgY29uc3QgbmV3U2hpcCA9IHNoaXAoc2hpcENsYXNzKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0VGlsZXMgPSBbXTtcbiAgICAgICAgaWYgKGhvcml6b250YWwpIHtcbiAgICAgICAgICAgIC8vIFNlbGVjdCB0aWxlcyBhbG9uZyBjb2x1bW5zIHN0YXJ0aW5nIGF0IHNlbGVjdGVkIHRpbGVcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBjb2x1bW47IGogPCBjb2x1bW4gKyBuZXdTaGlwLmdldExlbmd0aCgpOyBqKyspIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRUaWxlcy5wdXNoKHRpbGVzW3Jvd11bal0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2VsZWN0IHRpbGVzIGFsb25nIHJvd3Mgc3RhcnRpbmcgYXQgc2VsZWN0ZWQgdGlsZVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHJvdzsgaSA8IHJvdyArIG5ld1NoaXAuZ2V0TGVuZ3RoKCk7IGkrKykge1xuICAgICAgICAgICAgICAgIHRhcmdldFRpbGVzLnB1c2godGlsZXNbaV1bY29sdW1uXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiBvbmUgb2YgdGhlIHRhcmdldCB0aWxlcyBpcyBvdXRzaWRlIG9mIGJvYXJkIGxpbWl0cyAodW5kZWZpbmVkKVxuICAgICAgICBpZiAodGFyZ2V0VGlsZXMuc29tZSgodGlsZSkgPT4gdGlsZSA9PT0gdW5kZWZpbmVkKSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2hpcCBjYW5ub3QgZ28gb3V0IG9mIGJvdW5kcycpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGFueSBvZiB0aGUgdGFyZ2V0IHRpbGVzIGlzIG9jY3VwaWVkXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0YXJnZXRUaWxlcy5tYXAoKHRpbGUpID0+IHRpbGUucGxhY2VTaGlwKG5ld1NoaXApKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignT25lIG9yIG1vcmUgdGlsZXMgYXJlIGFscmVhZHkgb2NjdXBpZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXdTaGlwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlY2VpdmVBdHRhY2socm93LCBjb2x1bW4pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRpbGVzW3Jvd11bY29sdW1uXS50YXJnZXQoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0VGlsZXMsXG4gICAgICAgIGdldFRpbGVDb250ZW50cyxcbiAgICAgICAgcGxhY2VTaGlwLFxuICAgICAgICByZWNlaXZlQXR0YWNrLFxuICAgIH07XG59O1xuXG5jb25zdCBnYW1lYm9hcmRWaWV3ID0gKGdhbWVib2FyZCkgPT4ge1xuICAgIGNvbnN0IGJvYXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcjEtYm9hcmQnKTtcbiAgICBjb25zdCBzaGlwc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXIxLXNoaXBzJyk7XG5cbiAgICBsZXQgdGlsZXMgPSBbXTtcblxuICAgIGNyZWF0ZUJvYXJkKGJvYXJkLCAxMCk7XG4gICAgY3JlYXRlU2hpcHNEaXNwbGF5KHNoaXBzQ29udGFpbmVyKTtcblxuICAgIHRpbGVzLmZvckVhY2goKHRpbGUpID0+XG4gICAgICAgIHRpbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBldmVudHMuZW1pdCgndGlsZVNlbGVjdGVkJywge1xuICAgICAgICAgICAgICAgIHJvdzogdGlsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcm93JyksXG4gICAgICAgICAgICAgICAgY29sdW1uOiB0aWxlLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2x1bW4nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICk7XG5cbiAgICBmdW5jdGlvbiBwbGFjZVNoaXBzKCkge31cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUJvYXJkKGJvYXJkLCBzaXplLCBpc1BsYXllcjEgPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IHRhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICAgICAgY29uc3QgbmNvbHVtbnMgPSBzaXplO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHNpemU7IGkrKykge1xuICAgICAgICAgICAgbGV0IHRlbXBBcnIgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRhYmxlLmluc2VydFJvdygpO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPD0gbmNvbHVtbnM7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGwgPSByb3cuaW5zZXJ0Q2VsbCgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAoaXNQbGF5ZXIxICYmIGkgPT09IHNpemUgJiYgaiA9PT0gMCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKCFpc1BsYXllcjEgJiYgaSA9PT0gc2l6ZSAmJiBqID09PSBuY29sdW1ucylcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC5jbGFzc0xpc3QuYWRkKCdjb3JuZXItY2VsbCcpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoKGlzUGxheWVyMSAmJiBqID09PSAwKSB8fCAoIWlzUGxheWVyMSAmJiBqID09PSBuY29sdW1ucykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIGNlbGwuY2xhc3NMaXN0LmFkZCgncm93LWhlYWRlcicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQbGF5ZXIxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ2FsaWduLXJpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ2FsaWduLWxlZnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChpID09PSBzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoYXJDb2RlID0gaXNQbGF5ZXIxID8gNjUgKyBqIC0gMSA6IDY1ICsgajtcbiAgICAgICAgICAgICAgICAgICAgY2VsbC50ZXh0Q29udGVudCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xuICAgICAgICAgICAgICAgICAgICBjZWxsLmNsYXNzTGlzdC5hZGQoJ2NvbHVtbi1oZWFkZXInKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhUm93ID0gaXNQbGF5ZXIxID8gaSAtIDEgOiBpO1xuXG4gICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtcm93JywgZGF0YSAtIHJvdyk7XG4gICAgICAgICAgICAgICAgY2VsbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtY29sdW1uJywgaik7XG4gICAgICAgICAgICAgICAgdGVtcC5wdXNoKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGlsZXMucHVzaCh0ZW1wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJvYXJkLmFwcGVuZENoaWxkKHRhYmxlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTaGlwc0Rpc3BsYXkoc2hpcHNEaXNwbGF5LCBhbGlnblJpZ2h0ID0gdHJ1ZSkge1xuICAgICAgICBmb3IgKGxldCBzaGlwIGluIHNoaXBzKSB7XG4gICAgICAgICAgICBjb25zdCBzaGlwQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBzaGlwQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoKTtcbiAgICAgICAgICAgIHNoaXBDb250YWluZXIuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICAgICAgICAgIHNoaXBDb250YWluZXIuc3R5bGUuZ2FwID0gJzJweCc7XG4gICAgICAgICAgICBzaGlwQ29udGFpbmVyLnN0eWxlLmp1c3RpZnlDb250ZW50ID0gYWxpZ25SaWdodCA/ICdmbGV4LWVuZCcgOiAnZmxleC1zdGFydCc7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHNoaXBzW3NoaXBdOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaGlwSFAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBzaGlwSFAuY2xhc3NMaXN0LmFkZCgnc2hpcC1ocCcpO1xuXG4gICAgICAgICAgICAgICAgc2hpcENvbnRhaW5lci5hcHBlbmRDaGlsZChzaGlwSFApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzaGlwc0Rpc3BsYXkuYXBwZW5kQ2hpbGQoc2hpcENvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCB0aWxlID0gKHJvdywgY29sdW1uKSA9PiB7XG4gICAgbGV0IHNoaXAgPSBudWxsO1xuICAgIGxldCBoaXQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGdldENvbnRlbnRzKCkge1xuICAgICAgICByZXR1cm4gc2hpcDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGFjZVNoaXAobmV3U2hpcCkge1xuICAgICAgICAvLyBQbGFjZSBzaGlwIGluIHRpbGUgaWYgaXQgaXMgYXZhaWxhYmxlXG4gICAgICAgIGlmIChpc0F2YWlsYWJsZSgpKSB7XG4gICAgICAgICAgICBzaGlwID0gbmV3U2hpcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbm5vdCBwbGFjZSBhIHNoaXAgaGVyZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGFyZ2V0KCkge1xuICAgICAgICBpZiAoaGl0KSB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdGlsZSBoYXMgYWxyZWFkeSBiZWVuIGF0dGFja2VkJyk7XG5cbiAgICAgICAgaWYgKHNoaXAgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHNoaXAuaGl0KCk7XG4gICAgICAgICAgICBldmVudHMuZW1pdCgnYXR0YWNrSGl0Jywgc2hpcCk7XG5cbiAgICAgICAgICAgIGlmIChzaGlwLmdldEhQKCkgPT09IDApIGV2ZW50cy5lbWl0KCdzaGlwU3VuaycsIHNoaXApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnRzLmVtaXQoJ2F0dGFja01pc3NlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGhpdCA9IHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNBdmFpbGFibGUoKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgc2hpcCBvciBpdCBoYXMgYWxyZWFkeSBiZWVuIHRhcmdldGVkIGJ5IGFuZCBhdHRhY2tcbiAgICAgICAgcmV0dXJuIChzaGlwID09PSBudWxsKSAmICFoaXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0Q29udGVudHMsXG4gICAgICAgIHBsYWNlU2hpcCxcbiAgICAgICAgaXNBdmFpbGFibGUsXG4gICAgICAgIHRhcmdldCxcbiAgICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2FtZWJvYXJkO1xuZXhwb3J0IHsgdGlsZSwgZ2FtZWJvYXJkVmlldyB9O1xuIiwiY29uc3QgcGxheWVyID0gKG51bSwgbmFtZSkgPT4ge307XG5cbmV4cG9ydCBkZWZhdWx0IHBsYXllcjtcbiIsImNvbnN0IHNoaXBMaXN0ID0ge1xuICAgIGNhcnJpZXI6IDUsXG4gICAgYmF0dGxlc2hpcDogNCxcbiAgICBkZXN0cm95ZXI6IDMsXG4gICAgc3VibWFyaW5lOiAzLFxuICAgIHBhdHJvbDogMixcbn07XG5cbmNvbnN0IHNoaXAgPSAoc2hpcENsYXNzKSA9PiB7XG4gICAgY29uc3QgbGVuZ3RoID0gc2hpcExpc3Rbc2hpcENsYXNzXTtcbiAgICBsZXQgaHAgPSBsZW5ndGg7XG5cbiAgICBmdW5jdGlvbiBoaXQoKSB7XG4gICAgICAgIGlmIChpc1N1bmsoKSkgcmV0dXJuO1xuXG4gICAgICAgIGhwIC09IDE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SFAoKSB7XG4gICAgICAgIHJldHVybiBocDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1N1bmsoKSB7XG4gICAgICAgIHJldHVybiBocCA9PT0gMCA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRMZW5ndGgoKSB7XG4gICAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q2xhc3MoKSB7XG4gICAgICAgIHJldHVybiBzaGlwQ2xhc3M7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0SFAsXG4gICAgICAgIGdldExlbmd0aCxcbiAgICAgICAgZ2V0Q2xhc3MsXG4gICAgICAgIGlzU3VuayxcbiAgICAgICAgaGl0LFxuICAgIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzaGlwO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgZ2FtZSBmcm9tICcuL2dhbWUnO1xuXG5jb25zb2xlLmxvZygnaGVsbG8nKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==
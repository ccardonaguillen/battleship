import ship from './ship';
import events from './events';

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

    events.on('gameReset', _initBoard);

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

        const newShip = ship(shipClass);
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

    events.on('shipPlaced', _renderNewShip);
    events.on('shipPlaced', _clearPreview);
    events.on('attackHit', _renderAttack);
    events.on('attackMissed', _renderMiss);
    events.on('enablePreview', _previewPlacement);
    events.on('gameReset', _initView);

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
                        events.emit('tileSelected', { owner, row: i, col: colIdx });
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

        const newShip = ship(shipClass);
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
            events.emit('previewRotated', !rotate);
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
            events.emit('shipPlaced', { player: owner, row, col });
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
            events.emit('attackHit', { target: owner, row, col, ship });
            report['status'] = 'hit';

            if (ship.getHP() === 0) {
                report['sink'] = ship;
                events.emit('shipSunk', { target: owner, ship });
            }
        } else {
            report['status'] = 'miss';
            events.emit('attackMissed', { target: owner, row, col });
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

export default gameboard;
export { tile, gameboardView };

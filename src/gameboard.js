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

    for (let i = 0; i < nrows; i++) {
        let temp = [];
        for (let j = 0; j < ncolumns; j++) {
            temp.push(tile(owner, i, j));
        }
        tiles.push(temp);
    }

    function getTiles() {
        return tiles;
    }

    function getTileContents() {
        return tiles.map((row) => row.map((tile) => tile.getContents()));
    }

    function checkPlacement(row, col, ship, rotate) {
        // Create new ship and assign target tiles to place it
        const targetTiles = [];
        const shipLength = ship.getLength();

        // Check if one of the target tiles is outside of board limits
        if ((rotate && row + shipLength > size) || (!rotate && col + shipLength > size))
            return { valid: false, status: 'outOfBounds' };

        if (rotate) {
            // Select tiles along rows starting at selected tile
            for (let i = row; i < row + shipLength; i++) {
                targetTiles.push(tiles[i][col]);
            }
        } else {
            // Select tiles along columns starting at selected tile
            for (let j = col; j < col + shipLength; j++) {
                targetTiles.push(tiles[row][j]);
            }
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

    function receiveAttack({ target, row, col }) {
        if (owner != target) return;

        try {
            tiles[row][col].target();
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
    const isPlayer1 = owner === 'player' ? true : false;
    const shipsDisplay = {};

    let tiles = [];

    let previewCoords = null;
    let renderPreviewHandlers = [];
    let clearPreviewHandlers = [];

    _initView();

    events.on('shipPlaced', _renderNewShip);
    events.on('shipPlaced', clearPreview);
    events.on('attackHit', _renderAttack);
    events.on('attackMissed', _renderMiss);

    function getPlayerTiles() {
        return { player: owner, tiles };
    }

    function _initView() {
        const board = document.getElementById(`${owner}-board`);
        const shipsContainer = document.getElementById(`${owner}-ships`);

        _createBoard(board, 10);
        _createShipsDisplay(shipsContainer);
    }

    function _createBoard(board, size) {
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
                } else if ((isPlayer1 && j === 0) || (!isPlayer1 && j === ncolumns)) {
                    cell.textContent = i + 1;
                    cell.classList.add('row-header');
                    if (isPlayer1) {
                        cell.classList.add('align-right');
                    } else {
                        cell.classList.add('align-left');
                    }
                } else if (i === size) {
                    const charCode = isPlayer1 ? 65 + j - 1 : 65 + j;
                    cell.textContent = String.fromCharCode(charCode);
                    cell.classList.add('column-header');
                } else {
                    const dataColumn = isPlayer1 ? j - 1 : j;

                    cell.setAttribute('data-row', i);
                    cell.setAttribute('data-column', dataColumn);

                    cell.addEventListener('click', () => {
                        events.emit('tileSelected', { owner, row: i, col: dataColumn });
                    });

                    tempArr.push(cell);
                }
            }
            tiles.push(tempArr);
        }

        board.appendChild(table);
    }

    function _createShipsDisplay(display) {
        for (let ship in shipList) {
            const container = document.createElement('div');
            container.classList.add();
            container.style.display = 'flex';
            container.style.gap = '2px';
            container.style.justifyContent = isPlayer1 ? 'flex-end' : 'flex-start';

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
        if (player === owner && owner != 'computer') {
            tiles[row][col].classList.add('ship');
            removePreviewListeners();
        }
    }

    function _renderAttack({ target, row, col, ship }) {
        if (target === owner) {
            tiles[row][col].style.backgroundColor = 'red';

            const shipClass = ship.getClass();
            const shipHP = ship.getHP();

            const index = owner === 'player' ? shipHP : shipList[shipClass] - shipHP - 1;
            const hpDiv = shipsDisplay[shipClass][index];
            hpDiv.style.backgroundColor = 'red';
        }
    }

    function _renderMiss({ target, row, col }) {
        if (target === owner) {
            tiles[row][col].style.backgroundColor = 'blue';
        }
    }

    function previewShipPlacement(shipClass) {
        const newShip = ship(shipClass);
        let rotate = false;

        tiles.forEach((row, i) => {
            let tempArr = [];
            row.forEach((tile, j) => {
                const wrapper = (e) => {
                    previewCoords = renderPreview(i, j, newShip, rotate);
                };
                tile.addEventListener('mouseover', wrapper);
                tempArr.push(wrapper);
            });
            renderPreviewHandlers.push(tempArr);
        });

        tiles.forEach((row, i) => {
            let tempArr = [];
            row.forEach((tile, j) => {
                const wrapper = (e) => {
                    if (previewCoords !== null) previewCoords.forEach(clearPreview);
                };
                tile.addEventListener('mouseout', wrapper);
                tempArr.push(wrapper);
            });
            clearPreviewHandlers.push(tempArr);
        });

        document.addEventListener('keydown', (e) => {
            rotate = rotatePreview(e, rotate);
        });
    }

    function renderPreview(row, col, ship, rotate) {
        const checkTiles = gameboard.checkPlacement(row, col, ship, rotate);

        if (checkTiles.valid) {
            const targetTilesCoords = checkTiles.target.map((tile) => tile.getCoords());

            targetTilesCoords.forEach(({ row, col }) => {
                tiles[row][col].classList.add('preview');
            });

            return targetTilesCoords;
        } else {
            return null;
        }
    }

    function clearPreview({ row, col }) {
        tiles[row][col].classList.remove('preview');
    }

    function rotatePreview(e, rotate) {
        if (e.key === 'Control') {
            events.emit('previewRotated', !rotate);
            return !rotate;
        }
    }

    function removePreviewListeners() {
        if (previewCoords !== null) previewCoords.forEach(clearPreview);

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

    return {
        previewShipPlacement,
        getPlayerTiles,
    };
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
        // Place ship in tile if it is available
        if (isAvailable()) {
            ship = newShip;
            events.emit('shipPlaced', { player: owner, row, col });
        } else {
            throw new Error('You cannot place a ship here');
        }
    }

    function target() {
        if (hit) throw new Error('This tile has already been attacked');

        if (ship !== null) {
            ship.hit();
            events.emit('attackHit', { target: owner, row, col, ship });

            if (ship.getHP() === 0) events.emit('shipSunk', { target: owner, ship });
        } else {
            events.emit('attackMissed', { target: owner, row, col });
        }
        hit = true;
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

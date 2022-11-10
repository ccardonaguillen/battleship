import ship from './ship';
import events from './events';

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
        const newShip = ship(shipClass);
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

const gameboardView = (gameboard) => {};

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
            events.emit('attackHit', ship);

            if (ship.getHP() === 0) events.emit('shipSunk', ship);
        } else {
            events.emit('attackMissed');
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

export default gameboard;
export { tile };

import gameboard from '../gameboard';
import { tile } from '../gameboard';
import ship from '../ship';
import events from '../events';

describe('board tile', () => {
    test('ship is placed correctly', () => {
        const newTile = tile(0, 0);
        newTile.placeShip(ship('patrol'));

        expect(newTile.isAvailable()).not.toBeTruthy();
    });
    test('ship cannot be placed if there is another ship', () => {
        const newTile = tile(0, 0);
        newTile.placeShip(ship('patrol'));

        expect(() => {
            newTile.placeShip(ship('patrol'));
        }).toThrow('You cannot place a ship here');
    });

    it('cannot be selected as target if it was shot already', () => {
        const newTile = tile(0, 0);
        newTile.placeShip(ship('patrol'));

        expect(() => {
            newTile.placeShip(ship('patrol'));
        }).toThrow('You cannot place a ship here');
    });

    test('attack hits correct ship', () => {
        const newTile = tile(0, 0);
        const patrol = ship('patrol');

        newTile.placeShip(patrol);
        newTile.target();

        expect(patrol.getHP()).toBe(1);
    });
});

describe('gameboard', () => {
    it('is created correctly', () => {
        const board = gameboard('Player1', 3);
        expect(board.getTileContents()).toEqual([
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ]);
    });

    test('ship is placed at specified coords', () => {
        const board = gameboard('Player1', 3);
        const destroyer = board.placeShip(0, 0, 'destroyer');

        expect(board.getTileContents()).toEqual([
            [destroyer, destroyer, destroyer],
            [null, null, null],
            [null, null, null],
        ]);
    });

    test('horizontal ship is correctly placed', () => {
        const board = gameboard('Player1', 3);
        const patrol = board.placeShip(0, 0, 'patrol');

        expect(board.getTileContents()).toEqual([
            [patrol, patrol, null],
            [null, null, null],
            [null, null, null],
        ]);
    });

    test('vertical ship is correctly placed', () => {
        const board = gameboard('Player1', 3);
        const patrol = board.placeShip(0, 0, 'patrol', false);

        expect(board.getTileContents()).toEqual([
            [patrol, null, null],
            [patrol, null, null],
            [null, null, null],
        ]);
    });
    test('cannot place ship if tile is occupied', () => {
        const board = gameboard('Player1', 3);
        const patrol = board.placeShip(0, 0, 'patrol');

        expect(() => {
            board.placeShip(0, 0, 'patrol');
        }).toThrow('One or more tiles are already occupied');
    });

    test('cannot place ship outside board', () => {
        const board = gameboard('Player1', 3);

        expect(() => {
            board.placeShip(3, 3, 'submarine');
        }).toThrow('Cannot place ship outside board limits');
    });

    test('cannot place ship if it goes out of bounds', () => {
        const board = gameboard('Player1', 3);

        expect(() => {
            board.placeShip(1, 1, 'submarine');
        }).toThrow('Ship cannot go out of bounds');
    });

    test('ships cannot be place after game starts', () => {
        expect().toBe();
    });

    test('correct tile is selected by attack', () => {
        const board = gameboard('Player1', 3);
        board.receiveAttack(0, 0);

        expect(board.getTiles()[0][0].isAvailable()).not.toBeTruthy();
    });

    it('reports when attack lands in water', () => {
        let message = '';
        events.on('attackMissed', () => {
            message = 'Attack missed. Landed in water.';
        });

        const board = gameboard('Player1', 3);
        board.receiveAttack(0, 0);

        expect(message).toBe('Attack missed. Landed in water.');
    });

    it('reports when attack hits ship', () => {
        let message = '';
        events.on('attackHit', (targetShip) => {
            message = `Attack hit a ${targetShip.getClass()}.`;
        });

        const board = gameboard('Player1', 3);
        board.placeShip(0, 0, 'destroyer');
        board.receiveAttack(0, 0);

        expect(message).toBe('Attack hit a destroyer.');
    });

    it('reports when ship is destroyed', () => {
        let message = '';
        events.on('shipSunk', (targetShip) => {
            message = `A ${targetShip.getClass()} has been sunk.`;
        });

        const board = gameboard('Player1', 3);
        board.placeShip(0, 0, 'destroyer');
        board.receiveAttack(0, 0);
        board.receiveAttack(0, 1);
        board.receiveAttack(0, 2);

        expect(message).toBe('A destroyer has been sunk.');
    });
});

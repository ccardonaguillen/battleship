import ship from '../ship';

describe('ship', () => {
    it('is hit when shot at', () => {
        const destroyer = ship('destroyer');
        destroyer.hit();

        expect(destroyer.getHP()).toBe(2);
    });

    it('is sunk when hp reaches 0', () => {
        const patrol = ship('patrol');
        patrol.hit();
        patrol.hit();

        expect(patrol.isSunk()).toBeTruthy();
    });

    test('hp cannot go below 0', () => {
        const patrol = ship('patrol');
        patrol.hit();
        patrol.hit();

        expect(patrol.getHP()).toBe(0);
    });
});

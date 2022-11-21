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

export default ship;
export { shipList };

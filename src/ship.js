const shipHP = {
    carrier: 5,
    battleship: 4,
    destroyer: 3,
    submarine: 3,
    patrol: 2,
};

const ship = (shipClass) => {
    const length = shipHP[shipClass];
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

    return {
        getHP,
        isSunk,
        hit,
    };
};

export default ship;

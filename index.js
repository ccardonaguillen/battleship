function createPlayerBoard(board, nrows, rowLabelLeft = true) {
    const table = document.createElement('table');
    const ncolumns = nrows;

    for (let i = 0; i <= nrows; i++) {
        const row = table.insertRow();
        for (let j = 0; j <= ncolumns; j++) {
            const cell = row.insertCell();

            if (
                (rowLabelLeft && i === nrows && j === 0) ||
                (!rowLabelLeft && i === nrows && j === ncolumns)
            ) {
                cell.classList.add('corner-cell');
                continue;
            }

            if ((rowLabelLeft && j === 0) || (!rowLabelLeft && j === ncolumns)) {
                cell.textContent = i;
                cell.classList.add('row-header');
                if (rowLabelLeft) {
                    cell.classList.add('align-right');
                } else {
                    cell.classList.add('align-left');
                }
            }

            if (i === nrows) {
                const charCode = rowLabelLeft ? 65 + j - 1 : 65 + j;
                cell.textContent = String.fromCharCode(charCode);
                cell.classList.add('column-header');
            }
        }
    }

    board.appendChild(table);
}

const player1Board = document.getElementById('player1-board');
const player2Board = document.getElementById('player2-board');

createPlayerBoard(player1Board, 10);
createPlayerBoard(player2Board, 10, false);

const ships = {
    patrol: 2,
    destroyer: 3,
    submarine: 3,
    battleship: 4,
    carrier: 5,
};

function addShipDisplay(shipsDisplay, alignRight = true) {
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

const player1Ships = document.getElementById('player1-ships');
const player2Ships = document.getElementById('player2-ships');

addShipDisplay(player1Ships);
addShipDisplay(player2Ships, false);

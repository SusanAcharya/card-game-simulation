//scripts.js:

const playerGrid = document.getElementById('player-grid');
const opponentGrid = document.getElementById('opponent-grid');
const cardContainer = document.getElementById('card-container');
const startBattleBtn = document.getElementById('start-battle');
const battleLog = document.getElementById('battle-log');
const playerStatsBeforeTable = document.getElementById('player-stats-before');
const playerStatsAfterTable = document.getElementById('player-stats-after');
const opponentStatsBeforeTable = document.getElementById('opponent-stats-before');
const opponentStatsAfterTable = document.getElementById('opponent-stats-after');
const randomizeGridBtn = document.getElementById('randomize-grid');
const debuffContainer = document.getElementById('debuff-container');
const gridInfo = document.getElementById('grid-info');
const resetGameBtn = document.getElementById('reset-game');
const showAnalyticsBtn = document.getElementById('show-analytics');
const aboutBtn = document.getElementById('about-btn');
const aboutDialog = document.getElementById('about-dialog');
const closeAboutBtn = document.getElementById('close-about-btn');

let gridEffects = [
    { health: 0.2, damage: -0.1, healing: -0.05, speed: 0.8 },
    { health: 0.15, damage: -0.05, healing: 0.1, speed: 0.8 },
    { health: 0.1, damage: -0.15, healing: -0.1, speed: 0.8 },
    { health: 0.05, damage: -0.05, healing: 0.05, speed: 1 },
    { health: 0.15, damage: -0.1, healing: 0.15, speed: 1 },
    { health: 0.1, damage: -0.1, healing: -0.15, speed: 1 },
    { health: 0.05, damage: -0.15, healing: 0.1, speed: 1.3 },
    { health: 0.1, damage: -0.05, healing: -0.05, speed: 1.3 },
    { health: 0.2, damage: -0.1, healing: 0.05, speed: 1.3 }
];

const cards = [
    { name: 'Behemoth', health: 100, damage: 20, healing: 5, speed: 10, image: 'images/behemoth.png' },
    { name: 'Sapphira', health: 80, damage: 25, healing: 10, speed: 15, image: 'images/sapphira.png' },
    { name: 'Knuckle', health: 120, damage: 15, healing: 7, speed: 12, image: 'images/knuckle.png' },
    { name: 'Drake', health: 90, damage: 18, healing: 7, speed: 11, image: 'images/drake.png' },
    { name: 'Oni', health: 110, damage: 22, healing: 5, speed: 13, image: 'images/oni.png' },
    { name: 'Blink', health: 100, damage: 20, healing: 10, speed: 14, image: 'images/blink.png' }
];

const debuffCards = [
    { name: 'Health Drain', effect: { health: -0.20 }, image: 'images/health-drain.png' },
    { name: 'Damage Weaken', effect: { damage: -0.25 }, image: 'images/damage-weaken.png' },
    { name: 'Healing Reduce', effect: { healing: -0.30 }, image: 'images/healing-reduce.png' },
    { name: 'Speed Slow', effect: { speed: -0.15 }, image: 'images/speed-slow.png' },
    { name: 'All Stat Reduce', effect: { health: -0.10, damage: -0.10, healing: -0.10, speed: -0.10 }, image: 'images/all-stat-reduce.png' },
    { name: 'Major Weaken', effect: { health: -0.20, damage: -0.20 }, image: 'images/major-weaken.png' },
];

const typeSynergyBoosts = {
    'Behemoth': { health: 0.1, damage: 0.1, healing: 0.1, speed: 0 },
    'Sapphira': { health: 0.1, damage: 0.1, healing: 0.1, speed: 0 },
    'Knuckle': { health: 0.1, damage: 0.1, healing: 0.1, speed: 0 },
    'Drake': { health: 0.1, damage: 0.1, healing: 0.1, speed: 0 },
    'Oni': { health: 0.1, damage: 0.1, healing: 0.1, speed: 0 },
    'Blink': { health: 0.1, damage: 0.1, healing: 0.1, speed: 0 }
};

const eventCards = [{
        name: "Poison Gas",
        description: "At the start of each round, all cards' health will be reduced by 10 HP.",
        image: "images/poison-gas.png",
        effect: function(cards, round) {
            cards.forEach(card => {
                card.health = Math.max(card.health - 10, 0);
            });
            return "All cards lost 10 HP due to Poison Gas";
        }
    },
    {
        name: "Lucky Shot",
        description: "At odd rounds (1, 3, 5, 7, 9, ...) one random card from either the player or opponent will deal 2x damage.",
        image: "images/lucky-shot.png",
        effect: function(cards, round) {
            if (round % 2 === 1) {
                const luckyCard = cards[Math.floor(Math.random() * cards.length)];
                luckyCard.damage *= 2;
                return `${luckyCard.owner} ${luckyCard.name} got a Lucky Shot and will deal 2x damage this round!`;
            }
            return "No Lucky Shot this round";
        }
    },
    {
        name: "Focus on One",
        description: "In round 5, all the damage from one side will be focused on the card with the most health from the opposite side.",
        image: "images/focus-on-one.png",
        effect: function(cards, round) {
            if (round === 5) {
                const playerCards = cards.filter(card => card.owner === 'Player');
                const opponentCards = cards.filter(card => card.owner === 'Opponent');
                const playerTarget = playerCards.reduce((max, card) => card.health > max.health ? card : max, playerCards[0]);
                const opponentTarget = opponentCards.reduce((max, card) => card.health > max.health ? card : max, opponentCards[0]);
                playerCards.forEach(card => card.focusTarget = opponentTarget);
                opponentCards.forEach(card => card.focusTarget = playerTarget);
                return "All damage will be focused on the card with the most health from the opposite side this round";
            }
            return "No focus effect this round";
        }
    },
    {
        name: "Tactical Retreat",
        description: "If at round 5, a character has less than 10% of its health before the battle, they will take cover and restore 10% HP, joining the battle in the next round.",
        image: "images/tactical-retreat.png",
        effect: function(cards, round) {
            if (round === 5) {
                cards.forEach(card => {
                    if (card.health < card.initialHealth * 0.1) {
                        card.isRetreating = true;
                        card.health += card.initialHealth * 0.1;
                        return `${card.owner} ${card.name} retreated and restored 10% HP`;
                    }
                });
                return "Characters with less than 10% health have retreated";
            } else if (round === 6) {
                cards.forEach(card => {
                    if (card.isRetreating) {
                        card.isRetreating = false;
                        return `${card.owner} ${card.name} has rejoined the battle`;
                    }
                });
                return "Retreated characters have rejoined the battle";
            }
            return "No tactical retreat effect this round";
        }

    },
    {
        name: "Neutral",
        description: "This event has no effect on the battle. The fight will proceed normally.",
        image: "images/neutral.png", // Make sure to add this image to your images folder
        effect: function(cards, round) {
            return "No effect this round";
        }
    }
];


let playerCards = [];
let opponentCards = [];
let placedDebuffs = [];
let opponentCardPositions = [];
let analyticsDialog;
let selectedEvent = null;

function initializeGame() {
    createGrid(playerGrid, true);
    createGrid(opponentGrid, false);
    createCards();
    createDebuffCards();
    createEventCards();

    // Add event listener to hide dialog box when clicking anywhere else
    document.addEventListener('click', hideDialogBox);
    startBattleBtn.addEventListener('click', startBattle);
}

function getRandomEffect() {
    return Math.random() * 0.4 - 0.2;
}

function randomizeGridEffects() {
    gridEffects = gridEffects.map(effect => ({
        health: getRandomEffect(),
        damage: getRandomEffect(),
        healing: getRandomEffect(),
        speed: effect.speed // Keep the original speed
    }));
}



function createGrid(grid, isPlayer) {
    grid.innerHTML = ''; // Clear existing cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = `H: ${(gridEffects[i].health * 100).toFixed(0)}%, D: ${(gridEffects[i].damage * 100).toFixed(0)}%, He: ${(gridEffects[i].healing * 100).toFixed(0)}%`;
        cell.addEventListener('dragover', (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => dropCard(e, isPlayer));
        cell.addEventListener('click', (e) => showDialogBox(e, i));
        grid.appendChild(cell);
    }
}

function updateGrids() {
    createGrid(playerGrid, true);
    createGrid(opponentGrid, false);
}

function showDialogBox(e, cellIndex) {
    e.stopPropagation(); // Prevent event from propagating to document

    const existingDialog = document.querySelector('.dialog-box');
    if (existingDialog) {
        existingDialog.remove(); // Remove any existing dialog box
    }

    const dialogBox = document.createElement('div');
    dialogBox.classList.add('dialog-box');

    const gridEffect = gridEffects[cellIndex];
    const debuff = placedDebuffs.find(d => d.cellIndex === cellIndex);

    let infoHTML = `<h4>Grid ${cellIndex + 1} Effects:</h4>`;
    infoHTML += `<p>Health: ${(gridEffect.health * 100).toFixed(0)}%<br>`;
    infoHTML += `Damage: ${(gridEffect.damage * 100).toFixed(0)}%<br>`;
    infoHTML += `Healing: ${(gridEffect.healing * 100).toFixed(0)}%<br>`;
    infoHTML += `Speed: ${(gridEffect.speed * 100).toFixed(0)}%</p>`;

    if (debuff) {
        infoHTML += `<h4>Debuff Effect:</h4>`;
        infoHTML += `<p>${debuff.name}<br>`;
        infoHTML += Object.entries(debuff.effect).map(([stat, value]) => `${stat}: ${value * 100}%`).join('<br>');
        infoHTML += '</p>';
    }

    dialogBox.innerHTML = infoHTML;

    dialogBox.style.position = 'absolute';
    dialogBox.style.left = `${e.pageX}px`;
    dialogBox.style.top = `${e.pageY}px`;

    document.body.appendChild(dialogBox);
}

function hideDialogBox() {
    const existingDialog = document.querySelector('.dialog-box');
    if (existingDialog) {
        existingDialog.remove();
    }
}



function randomizeGrid() {
    randomizeGridEffects();
    updateGrids();

    // Reset game state
    playerCards = [];
    opponentCards = [];
    opponentGrid.classList.add('hidden');
    startBattleBtn.classList.add('hidden');

    // Clear stat tables
    [playerStatsBeforeTable, playerStatsAfterTable, opponentStatsBeforeTable, opponentStatsAfterTable].forEach(table => {
        table.innerHTML = '';
        table.classList.add('hidden');
    });
}

randomizeGridBtn.addEventListener('click', randomizeGrid);


function createCards() {
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.draggable = true;

        cardElement.style.backgroundImage = `url(${card.image})`;
        cardElement.style.backgroundSize = 'cover';
        cardElement.style.backgroundPosition = 'center';

        const cardName = document.createElement('div');
        cardName.classList.add('card-name');
        cardName.textContent = card.name;
        cardElement.appendChild(cardName);

        cardElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
        });

        // Add hover event listeners
        cardElement.addEventListener('mouseover', (e) => {
            const cardDetails = `
                <h3>${card.name}</h3>
                <p>Health: ${card.health}</p>
                <p>Damage: ${card.damage}</p>
                <p>Healing: ${card.healing}</p>
                <p>Speed: ${card.speed}</p>
            `;
            showCardPopup(e, cardDetails);
        });
        cardElement.addEventListener('mouseout', hideCardPopup);

        cardContainer.appendChild(cardElement);
    });
}

function createDebuffCards() {
    debuffCards.forEach((debuff, index) => {
                const debuffElement = document.createElement('div');
                debuffElement.classList.add('debuff-card');
                debuffElement.draggable = true;

                debuffElement.style.backgroundImage = `url(${debuff.image})`;
                debuffElement.style.backgroundSize = 'cover';
                debuffElement.style.backgroundPosition = 'center';

                const debuffName = document.createElement('div');
                debuffName.classList.add('debuff-name');
                debuffName.textContent = debuff.name;
                debuffElement.appendChild(debuffName);

                debuffElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', `debuff-${index}`);
                });

                // Add hover event listeners
                debuffElement.addEventListener('mouseover', (e) => {
                            const debuffDetails = `
                <h3>${debuff.name}</h3>
                ${Object.entries(debuff.effect).map(([stat, value]) => `<p>${stat}: ${value * 100}%</p>`).join('')}
            `;
            showCardPopup(e, debuffDetails);
        });
        debuffElement.addEventListener('mouseout', hideCardPopup);

        debuffContainer.appendChild(debuffElement);
    });
}

function placeOpponentCards() {
    opponentGrid.classList.remove('hidden');
    const debuffedCells = placedDebuffs.map(d => d.cellIndex);
    opponentCardPositions = []; // Reset positions
    
    while (opponentCards.length < 3) {
        const randomCardIndex = Math.floor(Math.random() * cards.length);
        const randomCard = {...cards[randomCardIndex] };
        let randomCellIndex;

        do {
            randomCellIndex = Math.floor(Math.random() * 9);
        } while (opponentCardPositions.includes(randomCellIndex) || !opponentGrid.children[randomCellIndex].textContent.includes('H:'));

        const cardBefore = {...randomCard };
        applyGridEffect(randomCard, randomCellIndex);
        opponentCards.push({ before: cardBefore, after: randomCard });
        opponentGrid.children[randomCellIndex].textContent = randomCard.name;
        opponentGrid.children[randomCellIndex].style.backgroundColor = '#ffaaaa';
        opponentCardPositions.push(randomCellIndex); // Remember the position
    }
    updateStatsTable(opponentStatsBeforeTable, opponentCards, 'before');
    applyTypeSynergy(opponentCards);
    applyDebuffs(); // Apply debuffs after placing cards
    updateStatsTable(opponentStatsAfterTable, opponentCards, 'after');
}

function applyDebuffs() {
    console.log("Applying debuffs"); // Debug log
    console.log("Placed debuffs:", placedDebuffs); // Debug log
    console.log("Opponent cards:", opponentCards); // Debug log
    opponentCards.forEach((card, index) => {
        const position = opponentCardPositions[index];
        const debuff = placedDebuffs.find(d => d.cellIndex === position);
        if (debuff) {
            console.log(`Applying debuff to card at position ${position}:`, debuff); // Debug log
            Object.entries(debuff.effect).forEach(([stat, value]) => {
                card.after[stat] *= (1 + value); // Changed from += to *=
                console.log(`Updated ${stat}: ${card.after[stat]}`); // Debug log
            });
        }
    });
    updateStatsTable(opponentStatsAfterTable, opponentCards, 'after');
}

function setupAboutDialog() {
    aboutBtn.onclick = function() {
        aboutDialog.style.display = "block";
    }

    closeAboutBtn.onclick = function() {
        aboutDialog.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == aboutDialog) {
            aboutDialog.style.display = "none";
        }
    }
}

function updateCellContent(cell, cellIndex, cardName = '') {
    const gridEffect = gridEffects[cellIndex];
    const debuff = placedDebuffs.find(d => d.cellIndex === cellIndex);
    let cellContent = cardName ? `${cardName}<br>` : '';
    cellContent += `H: ${(gridEffect.health * 100).toFixed(0)}%, D: ${(gridEffect.damage * 100).toFixed(0)}%, He: ${(gridEffect.healing * 100).toFixed(0)}%, S: ${(gridEffect.speed * 100).toFixed(0)}%`;
    if (debuff) {
        cellContent += `<br>Debuff: ${debuff.name}`;
    }
    cell.innerHTML = cellContent;
    updateCellAppearance(cell);
}

function updateCellAppearance(cell) {
    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    const hasCard = cell.textContent.trim() !== '';
    const hasDebuff = placedDebuffs.some(debuff => debuff.cellIndex === cellIndex);

    cell.classList.remove('card-placed', 'debuff-placed', 'both-placed');

    if (hasCard && hasDebuff) {
        cell.classList.add('both-placed');
    } else if (hasCard) {
        cell.classList.add('card-placed');
    } else if (hasDebuff) {
        cell.classList.add('debuff-placed');
    }
}


let selectedEventIndex = null;

function selectEventCard(index) {
    const cards = document.querySelectorAll('.event-card');
    
    if (selectedEventIndex === index) {
        // If clicking the same card, deselect it
        cards[index].classList.remove('selected');
        selectedEventIndex = null;
        selectedEvent = null;
    } else {
        // Deselect the previously selected card (if any)
        if (selectedEventIndex !== null) {
            cards[selectedEventIndex].classList.remove('selected');
        }
        
        // Select the new card
        cards[index].classList.add('selected');
        selectedEventIndex = index;
        selectedEvent = eventCards[index];
    }

    console.log("Selected event:", selectedEvent); // Add this line for debugging
}

function dropCard(e, isPlayer) {
    e.preventDefault();

    const cell = e.target;
    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    const data = e.dataTransfer.getData('text');

    if (data.startsWith('debuff-')) {
        // Handle debuff card placement
        if (placedDebuffs.length >= 3) {
            return; // Max 3 debuff cards allowed
        }
        const debuffIndex = parseInt(data.split('-')[1]);
        const debuff = { ...debuffCards[debuffIndex], cellIndex };
        placedDebuffs.push(debuff);
        updateCellContent(cell, cellIndex);
        console.log("Debuff placed:", debuff); // Debug log
    } else {
    
        // Allow only 3 player cards to be dropped
        if ((isPlayer && playerCards.length >= 3) || (!isPlayer && opponentCards.length >= 3)) {
            return;
        }
        const cardIndex = parseInt(data);
        const card = { ...cards[cardIndex] };
        const cardBefore = { ...card };

        applyGridEffect(card, cellIndex);

        if (isPlayer) {
            playerCards.push({ before: cardBefore, after: card });
            updateStatsTable(playerStatsBeforeTable, playerCards, 'before');
            updateStatsTable(playerStatsAfterTable, playerCards, 'after');
            if (playerCards.length === 3) {
                document.querySelector('.opponent-heading').classList.remove('hidden');
                placeOpponentCards();
                startBattleBtn.classList.remove('hidden');
            }
        } else {
            opponentCards.push({ before: cardBefore, after: card });
            updateStatsTable(opponentStatsBeforeTable, opponentCards, 'before');
            updateStatsTable(opponentStatsAfterTable, opponentCards, 'after');
        }

        // Apply type synergy after all cards are placed
        if ((isPlayer && playerCards.length === 3) || (!isPlayer && opponentCards.length === 3)) {
            applyTypeSynergy(isPlayer ? playerCards : opponentCards);
            updateStatsTable(isPlayer ? playerStatsAfterTable : opponentStatsAfterTable, isPlayer ? playerCards : opponentCards, 'after');
        }

        updateCellContent(cell, cellIndex, card.name); // Update cell content after placing card
    }

    // Check if it's time to place opponent cards or start battle
    if (playerCards.length === 3 && opponentCards.length === 0) {
        
        placeOpponentCards();
        startBattleBtn.classList.remove('hidden');

    }

    if (playerCards.length === 3 && opponentCards.length === 3) {
        applyDebuffs(); // Apply debuffs after all cards are placed
        updateStatsTable(opponentStatsAfterTable, opponentCards, 'after');
    }

    updateGridInfo();
}



function updateGridInfo() {
    gridInfo.innerHTML = '';
    gridInfo.classList.remove('hidden');

    playerGrid.childNodes.forEach((cell, index) => {
        cell.addEventListener('click', () => showGridInfo(index));
    });
}

function showGridInfo(cellIndex) {
    const gridEffect = gridEffects[cellIndex];
    const debuff = placedDebuffs.find(d => d.cellIndex === cellIndex);

    let infoHTML = `<h4>Grid ${cellIndex + 1} Effects:</h4>`;
    infoHTML += `<p>Health: ${(gridEffect.health * 100).toFixed(0)}%<br>`;
    infoHTML += `Damage: ${(gridEffect.damage * 100).toFixed(0)}%<br>`;
    infoHTML += `Healing: ${(gridEffect.healing * 100).toFixed(0)}%<br>`;
    infoHTML += `Speed: ${(gridEffect.speed * 100).toFixed(0)}%</p>`;

    if (debuff) {
        infoHTML += `<h4>Debuff Effect:</h4>`;
        infoHTML += `<p>${debuff.name}<br>`;
        infoHTML += Object.entries(debuff.effect).map(([stat, value]) => `${stat}: ${value * 100}%`).join('<br>');
        infoHTML += '</p>';
    }

    gridInfo.innerHTML = infoHTML;
}

function applyGridEffect(card, cellIndex) {
    const effect = gridEffects[cellIndex];
    const debuff = placedDebuffs.find(d => d.cellIndex === cellIndex);

    card.health += card.health * effect.health;
    card.damage += card.damage * effect.damage;
    card.healing += card.healing * effect.healing;
    card.speed *= effect.speed;

    if (debuff) {
        // Apply debuff effects on opponent cards
        Object.entries(debuff.effect).forEach(([stat, value]) => {
            card[stat] += card[stat] * value;
        });
    }
}

function applyTypeSynergy(cards) {
    const typeCounts = cards.reduce((acc, card) => {
        acc[card.after.name] = (acc[card.after.name] || 0) + 1;
        return acc;
    }, {});

    Object.entries(typeCounts).forEach(([type, count]) => {
        if (count === 3) {
            const boost = typeSynergyBoosts[type];
            cards.forEach(card => {
                if (card.after.name === type) {
                    card.after.health += card.after.health * boost.health;
                    card.after.damage += card.after.damage * boost.damage;
                    card.after.healing += card.after.healing * boost.healing;
                    card.after.speed += card.after.speed * boost.speed;
                }
            });
        }
    });
}

function showCardPopup(e, cardDetails) {
    const popup = document.createElement('div');
    popup.classList.add('card-popup');
    popup.innerHTML = cardDetails;
    popup.style.position = 'absolute';
    popup.style.left = `${e.pageX + 10}px`;
    popup.style.top = `${e.pageY + 10}px`;
    document.body.appendChild(popup);
}

function hideCardPopup() {
    const popup = document.querySelector('.card-popup');
    if (popup) {
        popup.remove();
    }
}

function updateStatsTable(table, cards, stage) {
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Health</th>
            <th>Damage</th>
            <th>Healing</th>
            <th>Speed</th>
        </tr>
    `;

    cards.forEach(card => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${card[stage].name}</td>
            <td>${Math.round(card[stage].health)}</td>
            <td>${Math.round(card[stage].damage)}</td>
            <td>${Math.round(card[stage].healing)}</td>
            <td>${Math.round(card[stage].speed)}</td>
        `;
        table.appendChild(row);

        // Update card values to rounded values
        card[stage].health = Math.round(card[stage].health);
        card[stage].damage = Math.round(card[stage].damage);
        card[stage].healing = Math.round(card[stage].healing);
        card[stage].speed = Math.round(card[stage].speed);
    });

    table.classList.remove('hidden');
}

function placeOpponentCards() {
    opponentGrid.classList.remove('hidden');
    opponentCardPositions = []; // Reset positions
    
    while (opponentCards.length < 3) {
        const randomCardIndex = Math.floor(Math.random() * cards.length);
        const randomCard = {...cards[randomCardIndex] };
        let randomCellIndex;

        do {
            randomCellIndex = Math.floor(Math.random() * 9);
        } while (opponentCardPositions.includes(randomCellIndex));

        const cardBefore = {...randomCard };
        applyGridEffect(randomCard, randomCellIndex);
        opponentCards.push({ before: cardBefore, after: randomCard });
        opponentGrid.children[randomCellIndex].textContent = randomCard.name;
        opponentGrid.children[randomCellIndex].style.backgroundColor = '#f35656';
        opponentCardPositions.push(randomCellIndex); // Remember the position
    }
    console.log("Opponent card positions:", opponentCardPositions); // Debug log
    updateStatsTable(opponentStatsBeforeTable, opponentCards, 'before');
    applyTypeSynergy(opponentCards);
    updateStatsTable(opponentStatsAfterTable, opponentCards, 'after');
}

function createEventCards() {
    const eventContainer = document.getElementById('event-container');
    eventCards.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('event-card');
        eventElement.style.backgroundImage = `url(${event.image})`;
        eventElement.style.backgroundSize = 'cover';
        eventElement.style.backgroundPosition = 'center';

        const eventName = document.createElement('div');
        eventName.classList.add('event-name');
        eventName.textContent = event.name;
        eventElement.appendChild(eventName);

        eventElement.addEventListener('click', () => selectEventCard(index));

        // Add hover event listeners
        eventElement.addEventListener('mouseover', (e) => {
            const eventDetails = `
                <h3>${event.name}</h3>
                <p>${event.description}</p>
            `;
            showCardPopup(e, eventDetails);
        });
        eventElement.addEventListener('mouseout', hideCardPopup);

        eventContainer.appendChild(eventElement);
    });
}

async function startBattle() {
    console.log("Battle started. Selected event:", selectedEvent); // Add this line for debugging

    if (!selectedEvent) {
        alert("Please select an event to continue");
        return;
    }

    startBattleBtn.classList.add('hidden');
    battleLog.classList.remove('hidden');
    await logBattle('Battle starts!');

    startBattleBtn.classList.add('hidden');
    battleLog.classList.remove('hidden');
    await logBattle('Battle starts!');

    let round = 1;
    let remainingPlayerCards = playerCards.map(card => ({...card.after, owner: 'Player' }));
    let remainingOpponentCards = opponentCards.map(card => ({...card.after, owner: 'Opponent' }));

    // Log initial stats of each card before battle starts
    await logAllCardStats(remainingPlayerCards, remainingOpponentCards);

    while (remainingPlayerCards.length > 0 && remainingOpponentCards.length > 0) {
        await logBattle(`Round ${round}`);

        if (selectedEvent && selectedEvent.name !== "Neutral") {
            const effectDescription = selectedEvent.effect([...remainingPlayerCards, ...remainingOpponentCards], round);
            await logBattle(`Event: ${selectedEvent.name} activated - ${effectDescription}`);
            
            // Log the stats after applying the event effect
            await logAllCardStats(remainingPlayerCards, remainingOpponentCards);
        } else if (selectedEvent && selectedEvent.name === "Neutral") {
            await logBattle("Neutral event: No effect this round");
        }

        // Apply event effect at the start of the round if an event is selected
        if (selectedEvent) {
            const effectDescription = selectedEvent.effect([...remainingPlayerCards, ...remainingOpponentCards], round);
            await logBattle(`Event: ${selectedEvent.name} activated - ${effectDescription}`);
            
            // Log the stats after applying the event effect
            await logAllCardStats(remainingPlayerCards, remainingOpponentCards);
        }

            // Sort cards by speed (highest to lowest)
            remainingPlayerCards.sort((a, b) => b.speed - a.speed);
            remainingOpponentCards.sort((a, b) => b.speed - a.speed);

            // Player attacks
            remainingPlayerCards = await battleRound(remainingPlayerCards, remainingOpponentCards, 'Player', round);

            // Opponent attacks
            remainingOpponentCards = await battleRound(remainingOpponentCards, remainingPlayerCards, 'Opponent', round);

            // Filter out defeated cards
            remainingPlayerCards = remainingPlayerCards.filter(card => card.health > 0);
            remainingOpponentCards = remainingOpponentCards.filter(card => card.health > 0);

            // Apply healing surge effect after the round if it's the selected event
            if (selectedEvent && selectedEvent.name === "Healing Surge") {
    const effectDescription = selectedEvent.effect([...remainingPlayerCards, ...remainingOpponentCards]);
    await logBattle(`Healing Surge activated: ${effectDescription}`);
    
    // Log the stats after applying the healing surge
    await logAllCardStats(remainingPlayerCards, remainingOpponentCards);
}

            round++;
        }

        const winner = remainingPlayerCards.length > 0 ? 'Player' : 'Opponent';
        await logBattle(`${winner} wins the battle!`);

        // Show reset and analytics buttons
        resetGameBtn.classList.remove('hidden');
        showAnalyticsBtn.classList.remove('hidden');
    }


function logAttack(attacker, defender) {
    defender.health -= attacker.damage;
    logBattle(`${attacker.owner} ${attacker.name} attacks ${defender.owner} ${defender.name}`);
    logBattle(`${defender.owner} ${defender.name} takes ${attacker.damage.toFixed(2)} damage, health is now ${defender.health.toFixed(2)}`);
}

function logHeal(card, owner) {
    logBattle(`${owner} ${card.name} heals for ${card.healing.toFixed(2)}, health is now ${card.health.toFixed(2)}`);
}




function logBattle(message) {
    return new Promise(resolve => {
        setTimeout(() => {
            const logEntry = document.createElement('div');
            logEntry.textContent = message;
            battleLog.appendChild(logEntry);
            battleLog.scrollTop = battleLog.scrollHeight;
            resolve();
        }, 10);``
    });
}

async function logInitialCardStats(card, owner) {
    await logBattle(`${owner} ${card.name} - Health: ${card.health.toFixed(2)}, Damage: ${card.damage.toFixed(2)}, Healing: ${card.healing.toFixed(2)}, Speed: ${card.speed.toFixed(2)}`);
}

async function battleRound(attackers, defenders, owner, round) {
    for (const attacker of attackers) {
        if (defenders.length === 0) break;
        if (attacker.isRetreating) {
            await logBattle(`${attacker.owner} ${attacker.name} is taking cover and healing`);
            continue;
        }

        let defender;
        if (round === 5 && attacker.focusTarget) {
            defender = attacker.focusTarget;
        } else {
            defender = defenders[Math.floor(Math.random() * defenders.length)];
        }

        let damage = attacker.damage;
        if (round % 2 === 1 && attacker.damage === attacker.initialDamage * 2) {
            await logBattle(`${attacker.owner} ${attacker.name} is using their Lucky Shot!`);
            damage = attacker.damage;
            attacker.damage = attacker.initialDamage; // Reset damage after use
        }

        defender.health -= damage;
        await logBattle(`${attacker.owner} ${attacker.name} attacks ${defender.owner} ${defender.name}`);
        await logBattle(`${defender.owner} ${defender.name} takes ${damage.toFixed(2)} damage, health is now ${defender.health.toFixed(2)}`);

        if (defender.health <= 0) {
            await logBattle(`${defender.owner} ${defender.name} is defeated!`);
        } else {
            defender.health = Math.min(defender.health + defender.healing, 100); // Cap health to 100
            await logHeal(defender, defender.owner);
        }
    }
    return attackers;
}

function logAttack(attacker, defender) {
    defender.health -= attacker.damage;
    logBattle(`${attacker.owner} ${attacker.name} attacks ${defender.owner} ${defender.name}`);
    logBattle(`${defender.owner} ${defender.name} takes ${attacker.damage.toFixed(2)} damage, health is now ${defender.health.toFixed(2)}`);
}

function logHeal(card, owner) {
    logBattle(`${owner} ${card.name} heals for ${card.healing.toFixed(2)}, health is now ${card.health.toFixed(2)}`);
}

async function logAllCardStats(playerCards, opponentCards) {
    await logBattle("Current stats:");
    for (const card of playerCards) {
        await logBattle(`Player ${card.name} - Health: ${card.health.toFixed(2)}, Damage: ${card.damage.toFixed(2)}, Healing: ${card.healing.toFixed(2)}, Speed: ${card.speed.toFixed(2)}`);
    }
    for (const card of opponentCards) {
        await logBattle(`Opponent ${card.name} - Health: ${card.health.toFixed(2)}, Damage: ${card.damage.toFixed(2)}, Healing: ${card.healing.toFixed(2)}, Speed: ${card.speed.toFixed(2)}`);
    }
}

// Add this function to reset the game
function resetGame() {
    // Clear all game state
    playerCards = [];
    opponentCards = [];
    placedDebuffs = [];
    opponentCardPositions = [];

    // Clear and hide battle log
    battleLog.innerHTML = '';
    battleLog.classList.add('hidden');

    // Clear and hide stat tables
    [playerStatsBeforeTable, playerStatsAfterTable, opponentStatsBeforeTable, opponentStatsAfterTable].forEach(table => {
        table.innerHTML = '';
        table.classList.add('hidden');
    });

    // Reset grids
    createGrid(playerGrid, true);
    createGrid(opponentGrid, false);
    opponentGrid.classList.add('hidden');

    // Hide buttons
    startBattleBtn.classList.add('hidden');
    resetGameBtn.classList.add('hidden');
    showAnalyticsBtn.classList.add('hidden');
    document.querySelector('.opponent-heading').classList.add('hidden');


    // Clear card container and recreate cards
    cardContainer.innerHTML = '';
    createCards();

    // Clear debuff container and recreate debuff cards
    debuffContainer.innerHTML = '';
    createDebuffCards();
}

// Add this function to show analytics
function showAnalytics() {
    const currentWinner = playerCards.length > opponentCards.length ? 'Player' : 'Opponent';
    const possibleOutcomes = simulateAllPositions();

    // Create dialog if it doesn't exist
    if (!analyticsDialog) {
        analyticsDialog = document.createElement('div');
        analyticsDialog.id = 'analytics-dialog';
        analyticsDialog.style.display = 'none';
        document.body.appendChild(analyticsDialog);
    }

    let analyticsMessage = '<h2>Battle Analytics</h2>';
    if (currentWinner === 'Player') {
        const losingPositions = possibleOutcomes.filter(outcome => outcome.winner === 'Opponent');
        analyticsMessage += `<p>You won! Here are scenarios where you could have lost:</p><ul>`;
        
        // Scenario where changing 1 card position leads to a loss
        const oneCardChange = losingPositions.find(pos => countChanges(playerCards, pos) === 1);
        if (oneCardChange) {
            analyticsMessage += `<li>Changing 1 card: ${formatPositionChange(playerCards, oneCardChange)}</li>`;
        }

        // Scenario where changing 2 card positions leads to a loss
        const twoCardChange = losingPositions.find(pos => countChanges(playerCards, pos) === 2);
        if (twoCardChange) {
            analyticsMessage += `<li>Changing 2 cards: ${formatPositionChange(playerCards, twoCardChange)}</li>`;
        }

        // Scenario where changing all 3 card positions leads to a loss
        const threeCardChange = losingPositions.find(pos => countChanges(playerCards, pos) === 3);
        if (threeCardChange) {
            analyticsMessage += `<li>Changing all 3 cards: ${formatPositionChange(playerCards, threeCardChange)}</li>`;
        }

        analyticsMessage += `</ul>`;
    } else {
        const winningPositions = possibleOutcomes.filter(outcome => outcome.winner === 'Player');
        analyticsMessage += `<p>You lost. Here are scenarios where you could have won:</p><ul>`;
        
        // Scenario where changing 1 card position leads to a win
        const oneCardChange = winningPositions.find(pos => countChanges(playerCards, pos) === 1);
        if (oneCardChange) {
            analyticsMessage += `<li>Changing 1 card: ${formatPositionChange(playerCards, oneCardChange)}</li>`;
        }

        // Scenario where changing 2 card positions leads to a win
        const twoCardChange = winningPositions.find(pos => countChanges(playerCards, pos) === 2);
        if (twoCardChange) {
            analyticsMessage += `<li>Changing 2 cards: ${formatPositionChange(playerCards, twoCardChange)}</li>`;
        }

        // Scenario where changing all 3 card positions leads to a win
        const threeCardChange = winningPositions.find(pos => countChanges(playerCards, pos) === 3);
        if (threeCardChange) {
            analyticsMessage += `<li>Changing all 3 cards: ${formatPositionChange(playerCards, threeCardChange)}</li>`;
        }

        analyticsMessage += `</ul>`;
    }

    analyticsDialog.innerHTML = analyticsMessage + '<button onclick="closeAnalyticsDialog()">Close</button>';
    analyticsDialog.style.display = 'block';
}

function countChanges(originalCards, newPosition) {
    return originalCards.reduce((count, card, index) => {
        const originalPos = Array.from(playerGrid.children).findIndex(cell => cell.textContent.includes(card.after.name));
        return count + (originalPos !== newPosition.positions[index] ? 1 : 0);
    }, 0);
}


// Helper function to format position changes
function formatPositionChange(originalCards, newPosition) {
    let changes = [];
    originalCards.forEach((card, index) => {
        const originalPos = Array.from(playerGrid.children).findIndex(cell => cell.textContent.includes(card.after.name));
        const newPos = newPosition.positions[index];
        if (originalPos !== newPos) {
            changes.push(`${card.after.name} from grid ${originalPos + 1} to grid ${newPos + 1}`);
        }
    });
    const changeCount = changes.length;
    return `Move ${changes.join(' and ')} (${changeCount} card${changeCount > 1 ? 's' : ''} changed)`;
}

// Function to close the analytics dialog
function closeAnalyticsDialog() {
    analyticsDialog.style.display = 'none';
}


// Helper function to simulate all possible card positions
function simulateAllPositions() {
    const allPositions = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            for (let k = 0; k < 9; k++) {
                if (i !== j && i !== k && j !== k) {
                    allPositions.push([i, j, k]);
                }
            }
        }
    }

    return allPositions.map(positions => {
        const simulatedPlayerCards = positions.map((pos, index) => {
            const card = { ...playerCards[index].before };
            applyGridEffect(card, pos);
            return { before: playerCards[index].before, after: card };
        });

        const winner = simulateBattle(simulatedPlayerCards, opponentCards);
        return { positions, winner };
    });
}

// Helper function to simulate a battle with given card positions
function simulateBattle(playerCards, opponentCards) {
    let remainingPlayerCards = playerCards.map(card => ({...card.after, owner: 'Player' }));
    let remainingOpponentCards = opponentCards.map(card => ({...card.after, owner: 'Opponent' }));

    while (remainingPlayerCards.length > 0 && remainingOpponentCards.length > 0) {
        remainingPlayerCards.sort((a, b) => b.speed - a.speed);
        remainingOpponentCards.sort((a, b) => b.speed - a.speed);

        remainingPlayerCards = simulateBattleRound(remainingPlayerCards, remainingOpponentCards);
        remainingOpponentCards = simulateBattleRound(remainingOpponentCards, remainingPlayerCards);

        remainingPlayerCards = remainingPlayerCards.filter(card => card.health > 0);
        remainingOpponentCards = remainingOpponentCards.filter(card => card.health > 0);
    }

    return remainingPlayerCards.length > 0 ? 'Player' : 'Opponent';
}

function simulateBattleRound(attackers, defenders) {
    for (const attacker of attackers) {
        if (defenders.length === 0) break;

        const defender = defenders[Math.floor(Math.random() * defenders.length)];
        defender.health -= attacker.damage;

        if (defender.health > 0) {
            defender.health = Math.min(defender.health + defender.healing, 100);
        }
    }
    return attackers;
}

startBattleBtn.addEventListener('click', startBattle);
// Add event listeners for the new buttons
resetGameBtn.addEventListener('click', resetGame);
showAnalyticsBtn.addEventListener('click', showAnalytics);
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupAboutDialog();
});
// Global Variables
const cardImages = {};
const cardWidth = 50;
const cardHeight = 100;
const cardsPerPlayer = 5;
const numPlayers = 4;
const deck = [];
let hands = {};
let backImg;
let playerIndex = 0; // Global variable for player index

// Load images
function preload() {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
    const values = [
        { value: 2, name: '2' }, { value: 3, name: '3' }, { value: 4, name: '4' },
        { value: 5, name: '5' }, { value: 6, name: '6' }, { value: 7, name: '7' },
        { value: 8, name: '8' }, { value: 9, name: '9' }, { value: 10, name: '10' },
        { value: 11, name: 'jack' }, { value: 12, name: 'queen' }, { value: 13, name: 'king' },
        { value: 14, name: 'ace' }
    ];

    for (let suit of suits) {
        for (let { value, name } of values) {
            const filePath = `svg/${name}_of_${suit}.svg`;
            cardImages[filePath] = filePath; // Store the path
        }
    }
}

function setup() {
    preload(); // Load images

    // Generate and shuffle the deck
    deck.push(...generateDeck());
    shuffleDeck(deck);

    // Deal cards to players
    dealCards(numPlayers);

    // Render cards to the DOM
    renderCards();

    // Evaluate hands and log to console
    evaluateHands();
}

function generateDeck() {
    const deck = [];
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
    const values = [
        { value: 2, name: '2' }, { value: 3, name: '3' }, { value: 4, name: '4' },
        { value: 5, name: '5' }, { value: 6, name: '6' }, { value: 7, name: '7' },
        { value: 8, name: '8' }, { value: 9, name: '9' }, { value: 10, name: '10' },
        { value: 11, name: 'jack' }, { value: 12, name: 'queen' }, { value: 13, name: 'king' },
        { value: 14, name: 'ace' }
    ];

    for (let suit of suits) {
        for (let { value, name } of values) {
            const filePath = `svg/${name}_of_${suit}.svg`;
            deck.push({ value, suit, name, filePath });
        }
    }

    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards(numPlayers) {
    hands = {};
    for (let i = 0; i < numPlayers; i++) {
        hands[`Player ${i + 1}`] = [];
    }

    for (let i = 0; i < numPlayers * cardsPerPlayer; i++) {
        let playerIndex = i % numPlayers;
        hands[`Player ${playerIndex + 1}`].push(deck.pop());
    }
}

function renderCards() {
    const playersDiv = document.querySelector('.players');
    playersDiv.innerHTML = ''; // Clear existing content

    // Create a div for the middle row
    const middleRowDiv = document.createElement('div');
    middleRowDiv.id = 'middle-row';

    for (let i = 1; i <= numPlayers; i++) {
        const hand = hands[`Player ${i}`];
        const playerDiv = document.createElement('div');
        const playerDivMiddle = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.id = `player-${i}`; // Set ID based on player number
        playerDiv.innerHTML = `<h3>Player ${i}</h3>`; // Add player title

        // Create rows for the player
        const rowDiv = document.createElement('div');
        rowDiv.className = 'player-row';

        // Add cards to the row
        for (let card of hand) {
            // Container for the card (both front and back)
            const cardContainer = document.createElement('div');
            cardContainer.className = 'card-container';

            // Create the back of the card
            const back = document.createElement('div');
            back.className = 'back';
            const backImg = document.createElement('img');
            
            backImg.className = 'card-img';
            backImg.src = 'svg/back.png';
            back.appendChild(backImg);

            // Create the front of the card
            const front = document.createElement('div');
            front.className = 'front';
            const frontImg = document.createElement('img');
            frontImg.className = 'card-img';
            frontImg.src = cardImages[card.filePath]; // Use a default image if filePath is not found
            front.appendChild(frontImg);

            // Container for both back and front
            const backAndFront = document.createElement('div');
            backAndFront.className = 'back-and-front';

            // Append both back and front to the backAndFront container
            backAndFront.appendChild(back);
            backAndFront.appendChild(front);

            // Append backAndFront to cardContainer
            cardContainer.appendChild(backAndFront);

            // Append cardContainer to the row
            rowDiv.appendChild(cardContainer);
        }

        playerDiv.appendChild(rowDiv);

        // Append player rows to appropriate container
        if (i === 1) {
            // Player 1 at the bottom
            playersDiv.appendChild(playerDiv);
        } else if (i === 2 || i === 3) {
            // Player 2 and Player 3 in the middle
            middleRowDiv.appendChild(playerDiv);
        } else if (i === 4) {
            // Player 4 at the top
            playersDiv.insertBefore(playerDiv, playersDiv.firstChild);
        }

        // Add click event to toggle card row flip
        rowDiv.addEventListener('click', () => {
            rowDiv.classList.toggle('flipped');
        });
    }

    // Append the middleRowDiv to the main playersDiv, placing it between Players 1 and 4
    playersDiv.insertBefore(middleRowDiv, playersDiv.firstChild.nextSibling);
}

function evaluateHands() {
    for (let player in hands) {
        const hand = hands[player];
        const handRank = determineHandRank(hand);
        console.log(`${player} has ${handRank}`);
    }
}

function determineHandRank(hand) {
    const suits = hand.map(card => card.suit);
    const values = hand.map(card => card.value).sort((a, b) => a - b);

    const isFlush = new Set(suits).size === 1;
    const isStraight = values.every((val, index) => index === 0 || val === values[index - 1] + 1);
    const valueCounts = values.reduce((acc, val) => (acc[val] = (acc[val] || 0) + 1, acc), {});
    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    if (isFlush && isStraight && values[0] === 10) return 'Royal Flush';
    if (isFlush && isStraight) return 'Straight Flush';
    if (counts[0] === 4) return 'Four of a Kind';
    if (counts[0] === 3 && counts[1] === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (counts[0] === 3) return 'Three of a Kind';
    if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
    if (counts[0] === 2) return 'One Pair';
    return 'High Card';
}

// Initialize the game
setup();
document.querySelectorAll('.card-container').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Select all card images
    const images = document.querySelectorAll('.card-img');
    
    if (images.length > 0) {
      // Get the computed width of the first image
      const imageWidth = images[0].clientWidth;
      
      // Define the gap as a proportion of the image width
      const gapProportion = 0.5; // 20% of image width for the gap
      
      // Calculate the actual gap value
      const gap = imageWidth * gapProportion;
      
      // Set the gap for the player rows using flexbox
      const playerRows = document.querySelectorAll('.player-row');
      playerRows.forEach(row => {
        row.style.gap = `${gap}px`;
      });
    }
});

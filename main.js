// Creates a standard 52-card deck
function getDeck() {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit: suit, value: value });
    }
  }
  return deck;
}

// Shuffles the deck using Fisher-Yates algorithm
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
  }
  return deck;
}

// Gets the numerical value of a card (J,Q,K = 10, A = 11 initially)
function getCardValue(card) {
  if (!card) return 0; // Handle potential undefined card during dealing
  if (['J', 'Q', 'K'].includes(card.value)) {
    return 10;
  } else if (card.value === 'A') {
    return 11; // Ace is initially 11
  } else {
    return parseInt(card.value);
  }
}

// Calculates the total value of a hand, handling Aces correctly
function getHandValue(hand) {
  let value = 0;
  let aceCount = 0;
  for (let card of hand) {
    value += getCardValue(card);
    if (card.value === 'A') {
      aceCount++;
    }
  }
  // If value > 21 and there are Aces, convert Ace value from 11 to 1
  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }
  return value;
}

// Creates and displays a single card element using Unicode characters
function displayCard(card, targetElement, isHidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    if (isHidden) {
        cardDiv.classList.add('hidden');
        cardDiv.innerHTML = '?'; // Keep '?' for hidden card, styled by .hidden CSS
        // Or use a Unicode character for a card back if preferred:
        // cardDiv.innerHTML = '&#x1F0A0;'; // Example: Unicode card back
    } else {
        // Add suit class for coloring
        cardDiv.classList.add(card.suit.toLowerCase());

        // Unicode Playing Card characters mapping
        // Base characters for A, K, Q, J, T (10) per suit
        const baseUnicode = {
            'Spades':   0x1F0A1, // Ace of Spades
            'Hearts':   0x1F0B1, // Ace of Hearts
            'Diamonds': 0x1F0C1, // Ace of Diamonds
            'Clubs':    0x1F0D1  // Ace of Clubs
        };

        // Value mapping (Ace is 1, 2-9 are face value, T=A, J=B, Q=D, K=E in hex offset)
        // Note: Unicode skips 'C' for Knight offset in some sets
        const valueOffset = {
            'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, 'J': 0xA, 'Q': 0xC, 'K': 0xD
             // Offset: A=0, 2=1,... 9=8, 10=9, J=A(10), Q=C(12), K=D(13) -- Corrected Offsets
        };
         const correctValueOffset = {
            'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '10': 9, 'J': 0xA, 'Q': 0xC, 'K': 0xD
        };


        let unicodeValue = baseUnicode[card.suit] + correctValueOffset[card.value];

         // Handle potential undefined lookup (fallback)
         if (isNaN(unicodeValue)) {
              cardDiv.innerHTML = `${card.value}${card.suit.charAt(0)}`; // Fallback text
         } else {
            cardDiv.innerHTML = `&#x${unicodeValue.toString(16)};`; // Convert hex value to HTML entity
         }
    }
    targetElement.appendChild(cardDiv);
}

// Displays all cards in a hand
function displayHand(hand, targetElement, hideFirstCard = false) {
  targetElement.innerHTML = ''; // Clear previous display
  hand.forEach((card, index) => {
    displayCard(card, targetElement, hideFirstCard && index === 0);
  });
}

// --- Basic Strategy Implementation ---
// Determines the optimal move based on player hand and dealer's upcard
function getBasicStrategyMove(playerHand, dealerUpCard) {
  const playerValue = getHandValue(playerHand);
  const dealerValue = getCardValue(dealerUpCard); // Only use the visible dealer card
  const isSoft = playerHand.some(card => card.value === 'A') && playerValue <= 21 && getHandValue(playerHand.filter(c => c.value !== 'A')) + playerHand.filter(c => c.value === 'A').length -1 < playerValue; // Check if it's a soft hand (Ace counts as 11)
  const numCards = playerHand.length;

  // Handle Blackjack immediately
  if (playerValue === 21 && numCards === 2) {
    return 'STAND'; // Natural Blackjack
  }

  // Soft Hands (Ace counts as 11)
  if (isSoft) {
    if (playerValue >= 19) return 'STAND'; // Soft 19, 20, 21 always stand
    if (playerValue === 18) {
      // Stand against 2, 7, 8. Hit against 9, 10, A. Double if allowed, otherwise stand vs 3-6. (Simplifying to Hit/Stand for now)
      return (dealerValue >= 2 && dealerValue <= 6) || dealerValue === 7 || dealerValue === 8 ? 'STAND' : 'HIT';
    }
    if (playerValue === 17) return 'HIT'; // Soft 17 always hits (or doubles)
    if (playerValue === 16) return 'HIT'; // Soft 16 always hits (or doubles)
    if (playerValue === 15) return 'HIT'; // Soft 15 always hits (or doubles)
    if (playerValue === 14) return 'HIT'; // Soft 14 always hits (or doubles)
    if (playerValue === 13) return 'HIT'; // Soft 13 always hits (or doubles)
    // Soft 12 is effectively 2, handled by hard hands logic
  }

  // Hard Hands (No Ace counts as 11, or Ace must count as 1)
  if (playerValue >= 17) return 'STAND'; // Hard 17+ always stands
  if (playerValue >= 13 && playerValue <= 16) {
    // Stand against dealer 2-6, otherwise Hit
    return (dealerValue >= 2 && dealerValue <= 6) ? 'STAND' : 'HIT';
  }
  if (playerValue === 12) {
    // Stand against dealer 4-6, otherwise Hit
    return (dealerValue >= 4 && dealerValue <= 6) ? 'STAND' : 'HIT';
  }
  if (playerValue <= 11) return 'HIT'; // Hard 11 or less always hits (or doubles)

  // Default fallback (shouldn't be reached with comprehensive logic)
  return 'HIT';
}


// --- Game Variables ---
let deck;
let dealerHand = [];
let playerHands = [[], [], [], [], []]; // Array for 5 player hands
let playerResults = ['', '', '', '', '']; // Stores result string for each player
let playerStatuses = ['', '', '', '', '']; // Stores status like BUST, STAND
let dealerWins = 0;
let dealerLosses = 0;
let playerWins = [0, 0, 0, 0, 0];
let playerLosses = [0, 0, 0, 0, 0];
let gameInProgress = false; // Flag to prevent starting multiple games
let dealerTurnInProgress = false; // Flag for dealer's turn animation


// --- Get HTML Elements ---
const dealerCardsDiv = document.getElementById('dealerCards');
const dealerHandValueDisplay = document.getElementById('dealerHandValue');
const playerHandsDivs = Array.from({ length: 5 }, (_, i) => document.getElementById(`player${i + 1}Cards`));
const playerHandValueDisplays = Array.from({ length: 5 }, (_, i) => document.getElementById(`player${i + 1}HandValue`));
const playerResultsDisplays = Array.from({ length: 5 }, (_, i) => document.getElementById(`player${i + 1}Result`));
const resultsDiv = document.getElementById('results');
const playAgainButton = document.getElementById('playAgain');
const playerWinCounts = Array.from({ length: 5 }, (_, i) => document.getElementById(`player${i + 1}Wins`));
const playerLossCounts = Array.from({ length: 5 }, (_, i) => document.getElementById(`player${i + 1}Losses`));
const dealerWinCount = document.getElementById('dealerWins');
const dealerLossCount = document.getElementById('dealerLosses');

// --- Event Listeners ---
playAgainButton.addEventListener('click', startGame);

// --- Game Logic Functions ---

// Initializes and starts a new game round
function startGame() {
  if (gameInProgress) return; // Don't start if already running
  gameInProgress = true;
  dealerTurnInProgress = false;
  playAgainButton.disabled = true; // Disable button during play
  playAgainButton.style.opacity = 0.6;

  console.log("--- New Game Started ---");
  resultsDiv.textContent = 'Dealing cards...';
  resultsDiv.className = ''; // Reset result styling

  // Reset hands and results
  deck = shuffleDeck(getDeck());
  dealerHand = [];
  playerHands = [[], [], [], [], []];
  playerResults = ['', '', '', '', ''];
  playerStatuses = ['', '', '', '', ''];

  // Clear previous display
  dealerCardsDiv.innerHTML = '';
  dealerHandValueDisplay.textContent = '';
  playerHandsDivs.forEach(div => div.innerHTML = '');
  playerHandValueDisplays.forEach(display => display.textContent = '');
  playerResultsDisplays.forEach(display => {
    display.textContent = '';
    display.className = ''; // Reset result styling
  });


  // Deal initial hands with slight delay for visual effect
  let dealDelay = 500; // ms delay between card deals
  function dealCard(targetHand, targetDiv, isPlayer = true, playerIndex = 0, isHidden = false) {
    setTimeout(() => {
      const card = deck.pop();
      targetHand.push(card);
      if (isPlayer) {
        displayHand(targetHand, targetDiv);
        playerHandValueDisplays[playerIndex].textContent = getHandValue(targetHand);
      } else {
        // For dealer, hide the first card initially
        displayHand(targetHand, targetDiv, true); // Pass true to hide first card
        if (targetHand.length > 1) {
          dealerHandValueDisplay.textContent = getCardValue(targetHand[1]); // Show only value of upcard
        }
      }
    }, dealDelay);
    dealDelay += 1000; // Increment delay for next card
  }

  // Deal two cards to each player and the dealer
  for (let i = 0; i < 2; i++) {
    for (let p = 0; p < 5; p++) {
      dealCard(playerHands[p], playerHandsDivs[p], true, p);
    }
    dealCard(dealerHand, dealerCardsDiv, false);
  }

  // After dealing finishes, start player turns
  setTimeout(() => {
    resultsDiv.textContent = 'Players playing...';
    playPlayerTurns(0); // Start with the first player
  }, dealDelay);
}


// Manages turns for each player sequentially
function playPlayerTurns(playerIndex) {
  if (playerIndex >= 5) { // All players have played
    revealDealerCardAndPlay();
    return;
  }

  const hand = playerHands[playerIndex];
  const handDiv = playerHandsDivs[playerIndex];
  const valueDisplay = playerHandValueDisplays[playerIndex];
  const resultDisplay = playerResultsDisplays[playerIndex];
  const dealerUpCard = dealerHand[1]; // Dealer's second card is the upcard

  // Highlight current player (optional visual cue)
  playerHandsDivs.forEach((div, idx) => {
    div.parentElement.style.borderColor = idx === playerIndex ? '#f1c40f' : '#2980b9'; // Yellow border for active player
  });


  function takeTurn() {
    const playerValue = getHandValue(hand);
    valueDisplay.textContent = playerValue; // Update value display

    if (playerValue >= 21) { // Player busts or has 21
      if (playerValue > 21) {
        playerStatuses[playerIndex] = 'BUST';
        resultDisplay.textContent = 'BUST';
        resultDisplay.className = 'status-bust';
        console.log(`Player ${playerIndex + 1} BUSTS with ${playerValue}`);
      } else if (playerValue === 21 && hand.length === 2) {
        playerStatuses[playerIndex] = 'BLACKJACK';
        resultDisplay.textContent = 'BLACKJACK!';
        resultDisplay.className = 'status-win'; // Blackjack is a win condition
        console.log(`Player ${playerIndex + 1} has BLACKJACK!`);
      }
      else {
        playerStatuses[playerIndex] = 'STAND'; // Stands on 21 if not blackjack
        resultDisplay.textContent = 'STAND';
        resultDisplay.className = 'status-stand';
        console.log(`Player ${playerIndex + 1} stands with 21`);
      }
      setTimeout(() => playPlayerTurns(playerIndex + 1), 900); // Move to next player after a short delay
      return;
    }

    // Get basic strategy move
    const move = getBasicStrategyMove(hand, dealerUpCard);
    console.log(`Player ${playerIndex + 1} (Value: ${playerValue}, Dealer: ${getCardValue(dealerUpCard)}) -> Strategy: ${move}`);

    if (move === 'HIT') {
      resultDisplay.textContent = 'Hitting...';
      resultDisplay.className = '';
      setTimeout(() => {
        const newCard = deck.pop();
        hand.push(newCard);
        displayCard(newCard, handDiv); // Display only the new card
        console.log(`Player ${playerIndex + 1} HITS, gets ${newCard.value}`);
        takeTurn(); // Re-evaluate hand after hitting
      }, 500); // Delay for hit animation/visual
    } else { // STAND
      playerStatuses[playerIndex] = 'STAND';
      resultDisplay.textContent = 'STAND';
      resultDisplay.className = 'status-stand';
      console.log(`Player ${playerIndex + 1} STANDS with ${playerValue}`);
      setTimeout(() => playPlayerTurns(playerIndex + 1), 500); // Move to next player
    }
  }
  takeTurn(); // Start the turn logic for the current player
}

// Reveals dealer's hidden card and plays the dealer's hand
function revealDealerCardAndPlay() {
  // Unhighlight players
  playerHandsDivs.forEach(div => div.parentElement.style.borderColor = '#2980b9');

  console.log("Dealer's turn...");
  resultsDiv.textContent = "Dealer's turn...";
  dealerTurnInProgress = true;

  // Reveal the hidden card
  displayHand(dealerHand, dealerCardsDiv, false); // Show both cards
  dealerHandValueDisplay.textContent = getHandValue(dealerHand);

  function dealerHitLoop() {
    const dealerValue = getHandValue(dealerHand);
    dealerHandValueDisplay.textContent = dealerValue; // Update value

    if (dealerValue > 21) {
      console.log(`Dealer BUSTS with ${dealerValue}`);
      resultsDiv.textContent = 'Dealer Busts!';
      resultsDiv.className = 'status-win'; // Players generally win if dealer busts
      determineResults(); // Go to results calculation
      return;
    }

    if (dealerValue >= 17) { // Dealer stands on 17 or more (including soft 17 based on common rules)
      console.log(`Dealer STANDS with ${dealerValue}`);
      resultsDiv.textContent = `Dealer Stands on ${dealerValue}`;
      resultsDiv.className = 'status-stand';
      determineResults(); // Go to results calculation
      return;
    }

    // Dealer hits on 16 or less
    console.log(`Dealer HITS with ${dealerValue}`);
    resultsDiv.textContent = 'Dealer Hits...';
    resultsDiv.className = '';
    setTimeout(() => {
      const newCard = deck.pop();
      dealerHand.push(newCard);
      displayCard(newCard, dealerCardsDiv); // Display the new card
      console.log(`Dealer gets ${newCard.value}`);
      dealerHitLoop(); // Continue dealer's turn
    }, 700); // Delay for dealer hit
  }

  // Start the dealer's hitting loop after a short delay
  setTimeout(dealerHitLoop, 700);
}


// Determines the winner of the round for each player
function determineResults() {
  console.log("Determining results...");
  resultsDiv.textContent = 'Round Results:'; // Clear previous message
  const dealerValue = getHandValue(dealerHand);
  const dealerBust = dealerValue > 21;
  let currentDealerWins = 0;
  let currentDealerLosses = 0;


  for (let i = 0; i < 5; i++) {
    const playerValue = getHandValue(playerHands[i]);
    const resultDisplay = playerResultsDisplays[i];

    // Skip players who busted or got Blackjack (already determined)
    if (playerStatuses[i] === 'BUST') {
      playerLosses[i]++;
      currentDealerWins++;
      console.log(`Player ${i + 1} (Bust) LOSES`);
      continue; // Already lost
    }
    if (playerStatuses[i] === 'BLACKJACK') {
      // Check if dealer also has blackjack
      if (getHandValue(dealerHand) === 21 && dealerHand.length === 2) {
        resultDisplay.textContent = 'PUSH (Blackjack)';
        resultDisplay.className = 'status-tie';
        console.log(`Player ${i + 1} (Blackjack) PUSHES vs Dealer Blackjack`);
      } else {
        playerWins[i]++;
        currentDealerLosses++;
        console.log(`Player ${i + 1} (Blackjack) WINS`);
        // Result already set to WIN/BLACKJACK
      }
      continue;
    }

    // Compare hands for players who stood
    if (dealerBust) {
      playerWins[i]++;
      currentDealerLosses++;
      resultDisplay.textContent = 'WIN (Dealer Bust)';
      resultDisplay.className = 'status-win';
      console.log(`Player ${i + 1} (Value: ${playerValue}) WINS vs Dealer Bust`);
    } else if (playerValue > dealerValue) {
      playerWins[i]++;
      currentDealerLosses++;
      resultDisplay.textContent = 'WIN';
      resultDisplay.className = 'status-win';
      console.log(`Player ${i + 1} (Value: ${playerValue}) WINS vs Dealer ${dealerValue}`);
    } else if (playerValue === dealerValue) {
      resultDisplay.textContent = 'PUSH';
      resultDisplay.className = 'status-tie';
      console.log(`Player ${i + 1} (Value: ${playerValue}) PUSHES vs Dealer ${dealerValue}`);
      // No win/loss change for push
    } else { // playerValue < dealerValue
      playerLosses[i]++;
      currentDealerWins++;
      resultDisplay.textContent = 'LOSE';
      resultDisplay.className = 'status-lose';
      console.log(`Player ${i + 1} (Value: ${playerValue}) LOSES vs Dealer ${dealerValue}`);
    }
  }

  // Update overall win/loss counts
  dealerWins += currentDealerWins;
  dealerLosses += currentDealerLosses;

  playerWinCounts.forEach((display, index) => display.textContent = playerWins[index]);
  playerLossCounts.forEach((display, index) => display.textContent = playerLosses[index]);
  dealerWinCount.textContent = dealerWins;
  dealerLossCount.textContent = dealerLosses;

  gameInProgress = false; // Game round finished
  dealerTurnInProgress = false;
  playAgainButton.disabled = false; // Re-enable button
  playAgainButton.style.opacity = 1;
  console.log("--- Round End ---");
}

// --- Initial Game Start ---
// Start the game automatically when the page loads
window.onload = startGame;

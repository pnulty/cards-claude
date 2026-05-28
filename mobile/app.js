let currentSuit = null;
let lastCardIndex = null;
let wakeLock = null;

const suitScreen = document.getElementById('suit-screen');
const cardScreen = document.getElementById('card-screen');
const cardImage = document.getElementById('card-image');
const cardSuitLabel = document.getElementById('card-suit-label');
const cardNameLabel = document.getElementById('card-name-label');

// Build suit buttons
const suitList = document.getElementById('suit-list');
Object.entries(SUITS).forEach(([name, suit]) => {
  const btn = document.createElement('button');
  btn.className = 'suit-btn';
  btn.style.backgroundColor = suit.color;
  btn.innerHTML =
    `<span class="suit-btn-name">${name}</span>` +
    `<span class="suit-btn-count">${suit.cards.length} cards</span>`;
  btn.addEventListener('click', () => enterSuit(name));
  suitList.appendChild(btn);
});

function enterSuit(suitName) {
  currentSuit = suitName;
  lastCardIndex = null;
  showCard();
  suitScreen.classList.remove('active');
  cardScreen.classList.add('active');
  requestWakeLock();
}

function showCard() {
  const cards = SUITS[currentSuit].cards;
  let index;
  do {
    index = Math.floor(Math.random() * cards.length);
  } while (cards.length > 1 && index === lastCardIndex);
  lastCardIndex = index;

  const card = cards[index];
  cardImage.classList.add('fading');
  setTimeout(() => {
    cardImage.src = card.image;
    cardImage.alt = card.name;
    cardSuitLabel.textContent = currentSuit;
    cardNameLabel.textContent = card.name;
    cardImage.classList.remove('fading');
  }, 180);
}

document.getElementById('card-tap-area').addEventListener('click', showCard);

document.getElementById('back-btn').addEventListener('click', () => {
  cardScreen.classList.remove('active');
  suitScreen.classList.add('active');
  releaseWakeLock();
});

// Wake lock
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    // silently ignore — not critical
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

// Re-acquire wake lock when the page becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentSuit) {
    requestWakeLock();
  }
});

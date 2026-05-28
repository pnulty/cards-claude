let currentSuit = null;
let lastCardIndex = null;
let isFlipped = false;
let wakeLock = null;

const suitScreen  = document.getElementById('suit-screen');
const cardScreen  = document.getElementById('card-screen');
const cardInner   = document.getElementById('card-inner');
const cardImage   = document.getElementById('card-image');
const flipHint    = document.getElementById('flip-hint');

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
  isFlipped = false;
  cardInner.classList.remove('flipped');
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

  // Update front
  cardImage.classList.add('fading');
  setTimeout(() => {
    cardImage.src = card.image;
    cardImage.alt = card.name;
    cardImage.classList.remove('fading');
  }, 180);
  document.getElementById('card-suit-front').textContent = currentSuit;
  document.getElementById('card-name-front').textContent = card.name;

  // Update back
  document.getElementById('card-suit-back').textContent = currentSuit;
  document.getElementById('card-name-back').textContent = card.name;

  const shortTextEl = document.getElementById('card-short-text');
  shortTextEl.textContent = card.shortText || '';
  shortTextEl.style.display = card.shortText ? '' : 'none';

  const bodyEl = document.getElementById('card-body-text');
  bodyEl.innerHTML = '';
  if (card.text) {
    card.text.split('\n\n').forEach(para => {
      const p = document.createElement('p');
      p.textContent = para.trim();
      bodyEl.appendChild(p);
    });
  }
}

// Flip on card tap
document.getElementById('card-flip').addEventListener('click', () => {
  isFlipped = !isFlipped;
  cardInner.classList.toggle('flipped', isFlipped);
  flipHint.textContent = isFlipped ? 'Tap card to flip back' : 'Tap card to read';
  // Reset scroll on back when flipping to front
  if (!isFlipped) {
    document.querySelector('.card-back-scroll').scrollTop = 0;
  }
});

// Draw another card
document.getElementById('draw-btn').addEventListener('click', () => {
  isFlipped = false;
  cardInner.classList.remove('flipped');
  flipHint.textContent = 'Tap card to read';
  document.querySelector('.card-back-scroll').scrollTop = 0;
  showCard();
});

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
  } catch (_) {}
}

function releaseWakeLock() {
  if (wakeLock) { wakeLock.release(); wakeLock = null; }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentSuit) requestWakeLock();
});

import { useState } from 'react';
import { SUITS, CARDS } from './cards-data.js';

export default function SessionView({ sessionId, hand, participants, onDraw, onRemoveCard, onClear }) {
  const [selectedSuit, setSelectedSuit] = useState('All');
  const [lastDrawnId, setLastDrawnId] = useState(null);
  const [copied, setCopied] = useState(false);

  function draw() {
    const pool = selectedSuit === 'All' ? CARDS : SUITS[selectedSuit].cards;
    let card;
    do {
      card = pool[Math.floor(Math.random() * pool.length)];
    } while (pool.length > 1 && card.id === lastDrawnId);
    setLastDrawnId(card.id);
    onDraw(card);
  }

  function copyLink() {
    const url = `${window.location.origin}/zoom/?session=${sessionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const suitColor = selectedSuit !== 'All' ? SUITS[selectedSuit].color : '#555';

  return (
    <div className="session-view">
      <header className="session-header">
        <div className="session-meta">
          <span className="session-code">{sessionId}</span>
          <button className="copy-btn" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <span className="participants">{participants} online</span>
        </div>

        <div className="controls">
          <select
            value={selectedSuit}
            onChange={e => setSelectedSuit(e.target.value)}
            style={{ borderColor: suitColor }}
          >
            <option value="All">All suits</option>
            {Object.keys(SUITS).map(s => (
              <option key={s} value={s}>{s} ({SUITS[s].cards.length})</option>
            ))}
          </select>

          <button
            className="draw-btn"
            style={{ backgroundColor: suitColor }}
            onClick={draw}
          >
            Draw
          </button>

          {hand.length > 0 && (
            <button className="clear-btn" onClick={onClear}>Clear all</button>
          )}
        </div>
      </header>

      <div className="hand">
        {hand.length === 0 ? (
          <div className="hand-empty">
            <p>Select a suit and draw a card to begin.</p>
          </div>
        ) : (
          hand.map((card, i) => (
            <div key={`${card.id}-${i}`} className="card-item">
              <button
                className="card-remove"
                onClick={() => onRemoveCard(i)}
                aria-label={`Remove ${card.name}`}
              >
                ×
              </button>
              <img src={card.image} alt={card.name} />
              <div className="card-label">
                <span className="card-suit-tag" style={{ color: SUITS[card.suit]?.color }}>
                  {card.suit}
                </span>
                <span className="card-name">{card.name}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

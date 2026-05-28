import { useState } from 'react';

const generateId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export default function JoinScreen({ onJoin }) {
  const [code, setCode] = useState('');

  function handleJoin(e) {
    e.preventDefault();
    if (code.trim()) onJoin(code.trim().toUpperCase());
  }

  return (
    <div className="join-screen">
      <h1>Cards</h1>
      <p className="join-subtitle">Enter a session code to join, or start a new session.</p>

      <form className="join-form" onSubmit={handleJoin}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Session code"
          maxLength={8}
          autoFocus
          spellCheck={false}
        />
        <button type="submit" disabled={!code.trim()}>Join</button>
      </form>

      <div className="join-divider">or</div>

      <button className="create-btn" onClick={() => onJoin(generateId())}>
        Create new session
      </button>
    </div>
  );
}

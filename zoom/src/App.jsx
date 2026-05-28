import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import JoinScreen from './JoinScreen.jsx';
import SessionView from './SessionView.jsx';

const socket = io();

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [hand, setHand] = useState([]);
  const [participants, setParticipants] = useState(0);

  // Auto-join from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session');
    if (id) joinSession(id);
  }, []);

  useEffect(() => {
    socket.on('state', ({ hand, participants }) => {
      setHand(hand);
      setParticipants(participants);
    });
    socket.on('participants', (count) => setParticipants(count));
    return () => {
      socket.off('state');
      socket.off('participants');
    };
  }, []);

  function joinSession(id) {
    socket.emit('join', id);
    setSessionId(id);
    const url = new URL(window.location);
    url.searchParams.set('session', id);
    window.history.pushState({}, '', url);
  }

  function drawCard(card) { socket.emit('draw', card); }
  function removeCard(index) { socket.emit('remove-card', index); }
  function clearHand() { socket.emit('clear'); }

  if (!sessionId) {
    return <JoinScreen onJoin={joinSession} />;
  }

  return (
    <SessionView
      sessionId={sessionId}
      hand={hand}
      participants={participants}
      onDraw={drawCard}
      onRemoveCard={removeCard}
      onClear={clearHand}
    />
  );
}

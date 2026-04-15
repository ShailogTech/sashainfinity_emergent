import React, { useEffect, useState } from 'react';
import './Confetti.css';

const Confetti = ({ duration = 3000, pieceCount = 150 }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = [
      '#f4911a', '#082A5E', '#667eea', '#43e97b',
      '#f5576c', '#ffd700', '#00d4ff', '#ff6b6b'
    ];

    const newPieces = Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2000,
      duration: 2000 + Math.random() * 2000,
      size: 5 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 720,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
      swayAmount: 50 + Math.random() * 100,
      swayDuration: 1000 + Math.random() * 1000
    }));

    setPieces(newPieces);

    const timer = setTimeout(() => {
      setPieces([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [pieceCount, duration]);

  return (
    <div className="confetti-container">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`confetti-piece ${piece.shape}`}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            '--sway-amount': `${piece.swayAmount}px`,
            '--sway-duration': `${piece.swayDuration}ms`
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment } from '@react-three/drei';
import { QRCodeSVG } from 'qrcode.react';

/**
 * ARModelCard Component
 * Card component for 3D models in gallery with preview, title, description and "View in AR" button
 */

const categoryColors = {
  hardware: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
  physics: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
  chemistry: 'from-amber-500/20 to-orange-500/20 border-amber-400/30',
  biology: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
  math: 'from-indigo-500/20 to-violet-500/20 border-indigo-400/30',
  engineering: 'from-rose-500/20 to-red-500/20 border-rose-400/30',
};

const categoryBadges = {
  hardware: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  physics: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  chemistry: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  biology: 'bg-green-500/20 text-green-300 border-green-400/30',
  math: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
  engineering: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
};

// Simple 3D preview component
const ModelPreview = ({ type, color }) => {
  return (
    <mesh rotation={[0, Math.PI / 4, 0]}>
      {type === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
      {type === 'box' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
      {type === 'cylinder' && <cylinderGeometry args={[1, 1, 2, 32]} />}
      {type === 'torus' && <torusGeometry args={[0.8, 0.3, 16, 100]} />}
      {type === 'cone' && <coneGeometry args={[1, 2, 32]} />}
      {(!type || type === 'default') && <boxGeometry args={[1.5, 1.5, 1.5]} />}
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
    </mesh>
  );
};

const ARModelCard = ({
  id,
  title,
  description,
  category,
  modelType = 'box',
  color = '#6366f1',
  difficulty = 'Beginner',
  duration = '15 min',
  tags = [],
  onViewInAR,
  showQR = false,
  qrUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);

  const defaultQrUrl = qrUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/ar/viewer/${id}`;

  const handleViewInAR = () => {
    if (onViewInAR) {
      onViewInAR(id);
    }
  };

  return (
    <div
      className={`group relative bg-gradient-to-br ${categoryColors[category] || categoryColors.hardware}
        backdrop-blur-md rounded-2xl border overflow-hidden
        cursor-pointer transition-all duration-500
        hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20
        ${isHovered ? 'ring-2 ring-indigo-400' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Preview Area */}
      <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        <Canvas shadows dpr={[1, 2]}>
          <Stage environment="studio" intensity={0.5}>
            <ModelPreview type={modelType} color={color} />
          </Stage>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI * 2 / 3}
          />
          <Environment preset="studio" />
        </Canvas>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 backdrop-blur-md rounded-full text-xs capitalize border ${categoryBadges[category] || categoryBadges.hardware}`}>
            {category}
          </span>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs text-white`}>
            {difficulty}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Actions on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button
              onClick={handleViewInAR}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              View in AR
            </button>
            {showQR && (
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-2 px-3 rounded-lg text-sm transition-colors"
                title="Show QR Code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-white/60 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Interactive
            </span>
          </div>

          <Link
            to={`/ar/viewer/${id}`}
            className="w-10 h-10 bg-indigo-500 hover:bg-indigo-400 rounded-xl flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* QR Code Dropdown */}
      {showQR && showQRCode && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-white rounded-xl shadow-2xl">
          <div className="text-center">
            <p className="text-gray-700 font-medium text-sm mb-2">Scan to view in AR</p>
            <div className="bg-white p-2 rounded-lg inline-block">
              <QRCodeSVG value={defaultQrUrl} size={120} level="H" />
            </div>
            <p className="text-gray-500 text-xs mt-2 break-all">{defaultQrUrl}</p>
          </div>
        </div>
      )}

      {/* Pulsing Effect on Hover */}
      {isHovered && (
        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default ARModelCard;

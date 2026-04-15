import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import ModelViewer from './ModelViewer';

const ARButton = ({
  modelId,
  modelName,
  size = 'md',
  variant = 'primary',
  showQR = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = React.useState(false);
  const qrUrl = `${window.location.origin}/ar/viewer/${modelId}`;

  const handleClick = () => {
    navigate(`/ar/viewer/${modelId}`);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    outline: 'bg-transparent border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10',
    glass: 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-xl transition-all duration-300 flex items-center gap-2 font-medium`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {modelName ? `View in AR` : 'AR View'}
      </button>

      {showQR && (
        <>
          <button
            onClick={() => setShowQRCode(!showQRCode)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Show QR Code"
          >
            <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>

          {showQRCode && (
            <div className="absolute top-full mt-2 right-0 z-50">
              <div className="bg-white rounded-xl p-4 shadow-2xl">
                <div className="mb-2 text-center">
                  <QRCodeSVG value={qrUrl} size={150} level="H" />
                </div>
                <p className="text-xs text-gray-600 text-center">Scan to open AR view</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ARButton;

import { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

/**
 * QRCodeGenerator Component
 * Generates QR codes for mobile AR viewing using qrcode.react
 * Features: Download as image, style customization, logo support
 */

const QRCodeGenerator = ({
  value = '',
  size = 200,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'H',
  includeMargin = false,
  title = '',
  logoUrl = null,
  downloadFileName = 'ar-qrcode',
  style = 'rounded', // rounded, square, glass
  showDownload = true,
  showCopy = true,
  onDownload = null,
}) => {
  const qrRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${downloadFileName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onDownload) {
        onDownload(url);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const containerStyles = {
    rounded: 'bg-white rounded-2xl shadow-xl p-6',
    square: 'bg-white shadow-lg p-4',
    glass: 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6',
  };

  return (
    <div className="qr-code-generator">
      {title && <div className="qr-title text-gray-800 font-semibold mb-3 text-center">{title}</div>}

      <div
        ref={qrRef}
        className={`qr-code-wrapper flex flex-col items-center ${containerStyles[style] || containerStyles.rounded}`}
      >
        <div className="bg-white p-3 rounded-xl mb-3">
          <QRCodeCanvas
            value={value}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            level={level}
            includeMargin={includeMargin}
          />
        </div>

        {showDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download QR Code
          </button>
        )}

        {showCopy && (
          <button
            onClick={handleCopy}
            className={`mt-2 text-xs ${copied ? 'text-green-600' : 'text-gray-500'} hover:text-gray-700 transition-colors`}
          >
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
        )}
      </div>

      {value && value.length > 0 && (
        <div className="qr-url-display mt-3 p-2 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 break-all text-center">
            {value.length > 60 ? value.substring(0, 60) + '...' : value}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * ARQRCard Component
 * Displays a QR code with AR context for mobile scanning
 */
export const ARQRCard = ({
  arUrl,
  title,
  description,
  modelType,
  size = 200,
  onScan = null,
}) => {
  const fullUrl = arUrl.startsWith('http') ? arUrl : `${window.location.origin}${arUrl}`;

  return (
    <div
      className="ar-qr-card bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white max-w-sm"
    >
      <div className="ar-qr-header mb-4">
        <div className="ar-qr-icon w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-90">{description || 'Scan to view in AR'}</p>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <QRCodeCanvas value={fullUrl} size={size} bgColor="#ffffff" fgColor="#1a1a2e" level="H" />
      </div>

      <div className="ar-qr-instructions text-sm opacity-90 space-y-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Point your camera at the QR code</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Open the link to view AR model</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          <span>Interact with the 3D model</span>
        </div>
      </div>

      {modelType && (
        <div className="ar-qr-model-tag mt-4 inline-block px-3 py-1 bg-white/20 rounded-full text-xs">
          {modelType}
        </div>
      )}
    </div>
  );
};

/**
 * BatchQRCodeGenerator Component
 * Generate QR codes for multiple models/courses
 */
export const BatchQRCodeGenerator = ({ items, title = 'Generate QR Codes' }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [generatedQRs, setGeneratedQRs] = useState([]);

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const generateAll = () => {
    const selected = items.filter((item) => selectedItems.includes(item.id));
    setGeneratedQRs(selected);
  };

  const downloadAll = () => {
    generatedQRs.forEach((item, index) => {
      setTimeout(() => {
        const canvas = document.getElementById(`qr-${item.id}`);
        if (canvas) {
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = url;
          link.download = `${item.title || item.id}-qr.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }, index * 500);
    });
  };

  return (
    <div className="batch-qr-generator bg-white rounded-2xl shadow-xl p-6 max-w-4xl">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Select items to generate QR codes:</label>
          <button
            onClick={() => setSelectedItems(selectedItems.length === items.length ? [] : items.map((i) => i.id))}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleItem(item.id)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="flex-1 text-sm text-gray-700">{item.title || item.name}</span>
              {item.category && (
                <span className="text-xs text-gray-500 capitalize">{item.category}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={generateAll}
          disabled={selectedItems.length === 0}
          className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Generate QR Codes ({selectedItems.length})
        </button>
        {generatedQRs.length > 0 && (
          <button
            onClick={downloadAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Download All
          </button>
        )}
      </div>

      {generatedQRs.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {generatedQRs.map((item) => (
            <div key={item.id} className="text-center">
              <div className="bg-white p-3 rounded-lg shadow inline-block mb-2">
                <QRCodeCanvas
                  id={`qr-${item.id}`}
                  value={item.url || `${window.location.origin}/ar/viewer/${item.id}`}
                  size={120}
                  level="H"
                />
              </div>
              <p className="text-xs text-gray-600 truncate">{item.title || item.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * InlineQRCode Component
 * Compact inline QR code for quick scanning
 */
export const InlineQRCode = ({ url, size = 100, className = '' }) => {
  return (
    <div className={`inline-qr-code ${className}`}>
      <QRCodeCanvas value={url} size={size} level="H" bgColor="#ffffff" fgColor="#000000" />
    </div>
  );
};

export default QRCodeGenerator;

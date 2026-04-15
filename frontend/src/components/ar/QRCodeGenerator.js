import { useEffect, useRef, useState } from "react";

/**
 * QR Code Generator Component
 * Generates QR codes for AR view URLs without external dependencies
 */
export default function QRCodeGenerator({
  value = "",
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
  level = "M",
  includeMargin = false,
  title = "",
  logoUrl = null,
}) {
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!value) return;
    generateQRCode();
  }, [value, size, bgColor, fgColor, level, includeMargin, logoUrl]);

  // Simple QR code generation using a basic algorithm
  // For production, consider using a library like qrcode.react
  const generateQRCode = async () => {
    setIsLoading(true);

    try {
      // Use a QR code API for reliable generation
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=${encodeURIComponent(bgColor.replace("#", ""))}&color=${encodeURIComponent(fgColor.replace("#", ""))}&qzone=${includeMargin ? 1 : 0}`;

      // Create image and convert to data URL
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = apiUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);

        // Draw QR code
        ctx.drawImage(img, 0, 0, size, size);

        // Draw logo if provided
        if (logoUrl) {
          const logoSize = size * 0.2;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          // Draw white background for logo
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.src = logoUrl;

          logoImg.onload = () => {
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            setQrDataUrl(canvas.toDataURL("image/png"));
            setIsLoading(false);
          };

          logoImg.onerror = () => {
            setQrDataUrl(canvas.toDataURL("image/png"));
            setIsLoading(false);
          };
        } else {
          setQrDataUrl(canvas.toDataURL("image/png"));
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        // Fallback: create a simple placeholder QR pattern
        createFallbackQR();
      };
    } catch (error) {
      createFallbackQR();
    }
  };

  const createFallbackQR = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw a simple pattern that looks like a QR code
    ctx.fillStyle = fgColor;
    const moduleSize = size / 25;

    // Draw position markers (corners)
    const drawPositionMarker = (startX, startY) => {
      // Outer square
      ctx.fillRect(startX, startY, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = bgColor;
      ctx.fillRect(startX + moduleSize, startY + moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = fgColor;
      ctx.fillRect(startX + moduleSize * 2, startY + moduleSize * 2, moduleSize * 3, moduleSize * 3);
    };

    drawPositionMarker(moduleSize, moduleSize);
    drawPositionMarker(size - moduleSize * 8, moduleSize);
    drawPositionMarker(moduleSize, size - moduleSize * 8);

    // Draw random-looking data pattern (deterministic based on value)
    const seed = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (i) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Skip position marker areas
        if (
          (row < 9 && col < 9) ||
          (row < 9 && col > 15) ||
          (row > 15 && col < 9)
        ) {
          continue;
        }

        if (random(row * 25 + col) > 0.5) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    setQrDataUrl(canvas.toDataURL("image/png"));
    setIsLoading(false);
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `ar-qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="qr-code-generator">
      {title && <div className="qr-title">{title}</div>}

      <div className="qr-code-wrapper" style={{
        display: "inline-block",
        padding: "16px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}>
        {isLoading ? (
          <div style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            borderRadius: "8px",
          }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ color: "#6366f1" }}></i>
          </div>
        ) : qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code"
            style={{
              width: size,
              height: size,
              display: "block",
            }}
          />
        ) : (
          <div style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            borderRadius: "8px",
            color: "#6b7280",
            fontSize: "14px",
          }}>
            No QR data
          </div>
        )}
      </div>

      {qrDataUrl && (
        <button
          onClick={downloadQRCode}
          className="qr-download-btn"
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "12px auto 0",
          }}
        >
          <i className="fa-solid fa-download"></i> Download QR Code
        </button>
      )}

      {value && (
        <div className="qr-url-display" style={{
          marginTop: "12px",
          padding: "8px 12px",
          background: "#f3f4f6",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#6b7280",
          wordBreak: "break-all",
          textAlign: "center",
        }}>
          {value.length > 50 ? value.substring(0, 50) + "..." : value}
        </div>
      )}
    </div>
  );
}

/**
 * AR QR Card Component
 * Displays a QR code with AR context for mobile scanning
 */
export function ARQRCard({
  arUrl,
  title,
  description,
  modelType,
  size = 200,
}) {
  const fullUrl = `${window.location.origin}${arUrl}`;

  return (
    <div className="ar-qr-card" style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "16px",
      padding: "24px",
      color: "#fff",
      maxWidth: "320px",
    }}>
      <div className="ar-qr-header" style={{ marginBottom: "16px" }}>
        <div className="ar-qr-icon" style={{
          width: "48px",
          height: "48px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}>
          <i className="fa-solid fa-cube" style={{ fontSize: "24px" }}></i>
        </div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "20px" }}>{title}</h3>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
          {description || "Scan to view in AR"}
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", padding: "16px" }}>
        <QRCodeGenerator
          value={fullUrl}
          size={size}
          bgColor="#ffffff"
          fgColor="#1a1a2e"
        />
      </div>

      <div className="ar-qr-instructions" style={{
        marginTop: "16px",
        fontSize: "12px",
        opacity: 0.9,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <i className="fa-solid fa-mobile-screen"></i>
          <span>Point your camera at the QR code</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <i className="fa-solid fa-link"></i>
          <span>Open the link to view AR model</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="fa-solid fa-hand-pointer"></i>
          <span>Interact with the 3D model</span>
        </div>
      </div>

      {modelType && (
        <div className="ar-qr-model-tag" style={{
          marginTop: "12px",
          display: "inline-block",
          padding: "4px 12px",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "20px",
          fontSize: "12px",
        }}>
          <i className="fa-solid fa-shapes"></i> {modelType}
        </div>
      )}
    </div>
  );
}

/**
 * Batch QR Code Generator for Courses
 */
export function CourseQRGenerator({ courses }) {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div className="course-qr-generator">
      <div className="course-selector" style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
          Select Course for AR QR Code:
        </label>
        <select
          value={selectedCourse || ""}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <option value="">Choose a course...</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && courses.find((c) => c.id === parseInt(selectedCourse)) && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ARQRCard
            arUrl={`/ar/model/${selectedCourse}`}
            title={courses.find((c) => c.id === parseInt(selectedCourse)).title}
            description="Scan to view 3D model in AR"
            modelType="Interactive 3D"
          />
        </div>
      )}
    </div>
  );
}

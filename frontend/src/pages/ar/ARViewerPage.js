import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Model3DViewer from "@/components/ar/Model3DViewer";

/**
 * AR Viewer Page
 * Mobile-friendly page for viewing AR 3D models with camera background
 */
export default function ARViewerPage() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelConfig, setModelConfig] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const streamRef = useRef(null);

  // Model configurations
  const modelConfigs = {
    trigonometry: {
      type: "triangle",
      title: "Trigonometry Triangle",
      color: "#6366f1",
      annotations: [
        { label: "Hypotenuse", text: "The longest side of a right triangle" },
        { label: "Opposite", text: "Side opposite to the angle" },
        { label: "Adjacent", text: "Side next to the angle" },
      ],
    },
    geometry: {
      type: "icosahedron",
      title: "Geometric Solid",
      color: "#8b5cf6",
      annotations: [
        { label: "Faces", text: "20 triangular faces" },
        { label: "Vertices", text: "12 corner points" },
        { label: "Edges", text: "30 line segments" },
      ],
    },
    algebra: {
      type: "graph",
      title: "3D Function Graph",
      color: "#06b6d4",
      annotations: [
        { label: "X-Axis", text: "Horizontal axis" },
        { label: "Y-Axis", text: "Vertical axis" },
        { label: "Z-Axis", text: "Depth axis" },
      ],
    },
    calculus: {
      type: "torusknot",
      title: "Calculus Surface",
      color: "#ec4899",
      annotations: [
        { label: "Curvature", text: "Rate of change of direction" },
        { label: "Torsion", text: "Rate of change of the curve's twisting" },
      ],
    },
    physics: {
      type: "atom",
      title: "Atomic Structure",
      color: "#10b981",
      annotations: [
        { label: "Nucleus", text: "Contains protons and neutrons" },
        { label: "Electron Shells", text: "Orbiting electrons" },
        { label: "Valence", text: "Outermost electrons" },
      ],
    },
    chemistry: {
      type: "molecule",
      title: "Molecular Structure",
      color: "#f59e0b",
      annotations: [
        { label: "Bonds", text: "Chemical bonds between atoms" },
        { label: "Central Atom", text: "Core atom of the molecule" },
      ],
    },
    mechanics: {
      type: "gear",
      title: "Mechanical Gear",
      color: "#6366f1",
      annotations: [
        { label: "Teeth", text: "Interlocking projections" },
        { label: "Pitch Circle", text: "Effective diameter" },
        { label: "Bore", text: "Center hole" },
      ],
    },
    spring: {
      type: "spring",
      title: "Spring Mechanism",
      color: "#8b5cf6",
      annotations: [
        { label: "Coil", text: "Helical winding" },
        { label: "Pitch", text: "Distance between coils" },
        { label: "Wire Diameter", text: "Thickness of the wire" },
      ],
    },
    biology: {
      type: "dna",
      title: "DNA Double Helix",
      color: "#22c55e",
      annotations: [
        { label: "Base Pairs", text: "A-T and C-G connections" },
        { label: "Sugar-Phosphate", text: "Backbone structure" },
        { label: "Grooves", text: "Major and minor grooves" },
      ],
    },
    crystal: {
      type: "dodecahedron",
      title: "Crystal Structure",
      color: "#0ea5e9",
      annotations: [
        { label: "Lattice", text: "Regular repeating pattern" },
        { label: "Unit Cell", text: "Basic building block" },
      ],
    },
  };

  useEffect(() => {
    // Load model configuration
    const config = modelConfigs[modelId] || {
      type: "box",
      title: "AR Model",
      color: "#6366f1",
      annotations: [],
    };

    setModelConfig(config);
    setAnnotations(config.annotations || []);

    // Set up hotspots based on model type
    const setupHotspots = () => {
      const commonHotspots = [
        { x: 1, y: 0, z: 0, title: "Front", description: "Front view of the model" },
        { x: -1, y: 0, z: 0, title: "Back", description: "Back view of the model" },
        { x: 0, y: 1, z: 0, title: "Top", description: "Top view of the model" },
      ];
      setHotspots(commonHotspots);
    };

    setupHotspots();

    return () => {
      // Clean up camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [modelId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Prefer back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setCameraError(null);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError(
        "Unable to access camera. Please allow camera permissions or use a device with a camera."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="ar-viewer-page" style={{
      minHeight: "100vh",
      background: "#000",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Camera Background */}
      {cameraActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      )}

      {/* Fallback Background when camera is off */}
      {!cameraActive && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          zIndex: 0,
        }} />
      )}

      {/* Header */}
      <header style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(10px)",
      }}>
        <Link
          to="/meiporul-ar"
          style={{
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </Link>

        <h1 style={{
          margin: 0,
          fontSize: "18px",
          color: "#fff",
          textAlign: "center",
        }}>
          {modelConfig?.title || "AR Viewer"}
        </h1>

        <button
          onClick={toggleCamera}
          style={{
            background: cameraActive ? "#ef4444" : "#10b981",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <i className={`fa-solid ${cameraActive ? "fa-video-slash" : "fa-video"}`}></i>
          {cameraActive ? "Stop" : "Camera"}
        </button>
      </header>

      {/* Camera Error Message */}
      {cameraError && (
        <div style={{
          position: "relative",
          zIndex: 10,
          margin: "20px",
          padding: "16px",
          background: "rgba(239, 68, 68, 0.9)",
          color: "#fff",
          borderRadius: "12px",
          fontSize: "14px",
        }}>
          <i className="fa-solid fa-exclamation-triangle"></i> {cameraError}
        </div>
      )}

      {/* 3D Model Viewer */}
      <div style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "20px",
      }}>
        {modelConfig && (
          <Model3DViewer
            modelType={modelConfig.type}
            color={modelConfig.color}
            width="100%"
            height="60vh"
            autoRotate={true}
            rotationSpeed={0.005}
            backgroundColor="transparent"
            hotspots={hotspots}
            annotations={annotations}
            enableHotspots={true}
            showControls={true}
          />
        )}
      </div>

      {/* Welcome Overlay */}
      {showOverlay && !cameraActive && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "#1a1a2e",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "400px",
            textAlign: "center",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <i className="fa-solid fa-cube" style={{ fontSize: "36px", color: "#fff" }}></i>
            </div>

            <h2 style={{ margin: "0 0 12px 0", color: "#fff", fontSize: "24px" }}>
              Welcome to AR Viewer
            </h2>

            <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
              Experience 3D models in augmented reality! Enable your camera to place
              the model in your real-world environment, or continue without AR to
              explore the model on screen.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => {
                  startCamera();
                  setShowOverlay(false);
                }}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <i className="fa-solid fa-camera"></i> Enable AR Camera
              </button>

              <button
                onClick={() => setShowOverlay(false)}
                style={{
                  background: "transparent",
                  color: "#94a3b8",
                  border: "1px solid #374151",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                View Without AR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Hint */}
      {cameraActive && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "24px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          backdropFilter: "blur(8px)",
        }}>
          <span><i className="fa-solid fa-hand-pointer"></i> Drag to rotate</span>
          <span><i className="fa-solid fa-magnifying-glass"></i> Pinch to zoom</span>
          <span><i className="fa-solid fa-arrows-up-down-left-right"></i> Two fingers to pan</span>
        </div>
      )}
    </div>
  );
}

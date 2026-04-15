import { Link } from "react-router-dom";
import { useState } from "react";
import Model3DViewer from "@/components/ar/Model3DViewer";
import { ARQRCard } from "@/components/ar/QRCodeGenerator";

/**
 * AR Gallery Page
 * Showcase of 3D models organized by subject
 */
export default function ARGalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedModel, setSelectedModel] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const categories = [
    { id: "all", name: "All Models", icon: "fa-solid fa-shapes" },
    { id: "math", name: "Mathematics", icon: "fa-solid fa-calculator" },
    { id: "physics", name: "Physics", icon: "fa-solid fa-atom" },
    { id: "chemistry", name: "Chemistry", icon: "fa-solid fa-flask" },
    { id: "biology", name: "Biology", icon: "fa-solid fa-dna" },
    { id: "engineering", name: "Engineering", icon: "fa-solid fa-gears" },
  ];

  const models = [
    // Mathematics
    {
      id: "trigonometry",
      title: "Trigonometry Triangle",
      category: "math",
      type: "box",
      color: "#6366f1",
      description: "Interactive right triangle for understanding sine, cosine, and tangent",
      difficulty: "Beginner",
      duration: "15 min",
    },
    {
      id: "geometry",
      title: "Platonic Solids",
      category: "math",
      type: "icosahedron",
      color: "#8b5cf6",
      description: "Explore the five regular convex polyhedra",
      difficulty: "Beginner",
      duration: "20 min",
    },
    {
      id: "algebra",
      title: "3D Function Graph",
      category: "math",
      type: "graph",
      color: "#06b6d4",
      description: "Visualize mathematical functions in 3D space",
      difficulty: "Intermediate",
      duration: "30 min",
    },
    {
      id: "calculus",
      title: "Parametric Surface",
      category: "math",
      type: "torusknot",
      color: "#ec4899",
      description: "Understand curvature and torsion on complex surfaces",
      difficulty: "Advanced",
      duration: "45 min",
    },
    // Physics
    {
      id: "physics",
      title: "Atomic Structure",
      category: "physics",
      type: "atom",
      color: "#10b981",
      description: "Interactive atom with electron shells and nucleus",
      difficulty: "Beginner",
      duration: "25 min",
    },
    {
      id: "pendulum",
      title: "Pendulum Motion",
      category: "physics",
      type: "sphere",
      color: "#f59e0b",
      description: "Visualize harmonic motion and energy conservation",
      difficulty: "Intermediate",
      duration: "20 min",
    },
    {
      id: "waves",
      title: "Wave Interference",
      category: "physics",
      type: "grid",
      color: "#3b82f6",
      description: "See how waves interact and create interference patterns",
      difficulty: "Advanced",
      duration: "35 min",
    },
    // Chemistry
    {
      id: "chemistry",
      title: "Molecular Structure",
      category: "chemistry",
      type: "molecule",
      color: "#f59e0b",
      description: "Build and explore molecular bonds and structures",
      difficulty: "Intermediate",
      duration: "30 min",
    },
    {
      id: "crystal",
      title: "Crystal Lattice",
      category: "chemistry",
      type: "dodecahedron",
      color: "#0ea5e9",
      description: "Understand crystal structures and unit cells",
      difficulty: "Advanced",
      duration: "40 min",
    },
    // Biology
    {
      id: "biology",
      title: "DNA Double Helix",
      category: "biology",
      type: "dna",
      color: "#22c55e",
      description: "Explore the structure of DNA with base pairs",
      difficulty: "Beginner",
      duration: "25 min",
    },
    {
      id: "cell",
      title: "Cell Structure",
      category: "biology",
      type: "sphere",
      color: "#84cc16",
      description: "Interactive model of cell organelles",
      difficulty: "Intermediate",
      duration: "35 min",
    },
    // Engineering
    {
      id: "mechanics",
      title: "Gear Mechanism",
      category: "engineering",
      type: "gear",
      color: "#6366f1",
      description: "Understand mechanical advantage and gear ratios",
      difficulty: "Beginner",
      duration: "20 min",
    },
    {
      id: "spring",
      title: "Spring System",
      category: "engineering",
      type: "spring",
      color: "#8b5cf6",
      description: "Learn about Hooke's Law and spring dynamics",
      difficulty: "Intermediate",
      duration: "25 min",
    },
    {
      id: "structure",
      title: "Truss Bridge",
      category: "engineering",
      type: "cylinder",
      color: "#ef4444",
      description: "Analyze forces in truss structures",
      difficulty: "Advanced",
      duration: "45 min",
    },
  ];

  const filteredModels =
    selectedCategory === "all"
      ? models
      : models.filter((m) => m.category === selectedCategory);

  return (
    <div className="ar-gallery-page" style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      {/* Header */}
      <header style={{
        padding: "24px 20px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
        borderBottom: "1px solid rgba(99, 102, 241, 0.2)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Link
                to="/meiporul-ar"
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}
              >
                <i className="fa-solid fa-arrow-left"></i> Back to AR Home
              </Link>
              <h1 style={{ margin: 0, fontSize: "32px", color: "#fff", fontWeight: "800" }}>
                AR Model Gallery
              </h1>
              <p style={{ margin: "8px 0 0 0", color: "#94a3b8", fontSize: "16px" }}>
                Explore interactive 3D models for hands-on learning
              </p>
            </div>

            <button
              onClick={() => setShowQR(!showQR)}
              style={{
                background: showQR ? "#ef4444" : "#6366f1",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <i className="fa-solid fa-qrcode"></i>
              {showQR ? "Hide QR" : "Show QR Codes"}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Category Filter */}
        <div style={{ marginBottom: "32px", overflowX: "auto", paddingBottom: "8px" }}>
          <div style={{ display: "flex", gap: "12px", minWidth: "fit-content" }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? "#6366f1" : "rgba(255,255,255,0.05)",
                  color: selectedCategory === cat.id ? "#fff" : "#94a3b8",
                  border: selectedCategory === cat.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <i className={cat.icon}></i>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Models Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "24px",
        }}>
          {filteredModels.map((model) => (
            <div
              key={model.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                overflow: "hidden",
                transition: "all 0.3s",
              }}
            >
              {/* 3D Preview */}
              <div style={{ height: "200px", position: "relative" }}>
                <Model3DViewer
                  modelType={model.type}
                  color={model.color}
                  width="100%"
                  height="200px"
                  autoRotate={true}
                  rotationSpeed={0.01}
                  backgroundColor="#1a1a2e"
                  showControls={false}
                />

                {/* Quick View Button */}
                <button
                  onClick={() => setSelectedModel(model)}
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "12px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <i className="fa-solid fa-expand"></i> Quick View
                </button>
              </div>

              {/* Model Info */}
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", color: "#fff", fontSize: "18px" }}>
                      {model.title}
                    </h3>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      background: `rgba(${parseInt(model.color.slice(1,3), 16)}, ${parseInt(model.color.slice(3,5), 16)}, ${parseInt(model.color.slice(5,7), 16)}, 0.2)`,
                      color: model.color,
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "500",
                    }}>
                      {categories.find(c => c.id === model.category)?.name || model.category}
                    </span>
                  </div>

                  <Link
                    to={`/ar/viewer/${model.id}`}
                    style={{
                      background: "#6366f1",
                      color: "#fff",
                      textDecoration: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="fa-solid fa-cube"></i> View in AR
                  </Link>
                </div>

                <p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
                  {model.description}
                </p>

                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b" }}>
                  <span><i className="fa-solid fa-signal"></i> {model.difficulty}</span>
                  <span><i className="fa-solid fa-clock"></i> {model.duration}</span>
                </div>

                {/* QR Code Toggle */}
                {showQR && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <ARQRCard
                      arUrl={`/ar/viewer/${model.id}`}
                      title={model.title}
                      description="Scan to open AR view"
                      modelType={model.type}
                      size={120}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredModels.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#64748b",
          }}>
            <i className="fa-solid fa-cube" style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}></i>
            <p style={{ fontSize: "16px" }}>No models found in this category.</p>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedModel && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.9)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "#1a1a2e",
            borderRadius: "20px",
            maxWidth: "600px",
            width: "100%",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "20px" }}>{selectedModel.title}</h3>
              <button
                onClick={() => setSelectedModel(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div style={{ height: "350px" }}>
              <Model3DViewer
                modelType={selectedModel.type}
                color={selectedModel.color}
                width="100%"
                height="350px"
                autoRotate={true}
                backgroundColor="transparent"
                showControls={true}
              />
            </div>

            <div style={{ padding: "20px", display: "flex", gap: "12px" }}>
              <Link
                to={`/ar/viewer/${selectedModel.id}`}
                onClick={() => setSelectedModel(null)}
                style={{
                  flex: 1,
                  background: "#6366f1",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                <i className="fa-solid fa-cube"></i> Open Full AR View
              </Link>
              <button
                onClick={() => setSelectedModel(null)}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "#94a3b8",
                  border: "1px solid #374151",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

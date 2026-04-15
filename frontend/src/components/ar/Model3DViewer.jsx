import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html, Stage, Sky, Stars, Float, MeshTransmissionMaterial, Grid, GizmoHelper, GizmoViewport, Bounds, useBounds, Stats } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Enhanced Model3DViewer Component
 * Three.js-based 3D model viewer with React Three Fiber
 * Features: OrbitControls, lighting, shadows, auto-rotate, fullscreen, screenshot
 */

// Loading fallback component
const LoadingFallback = () => (
  <Html center>
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 text-sm">Loading 3D model...</p>
    </div>
  </Html>
);

// Procedural model component
const ProceduralModel = ({ type = 'cpu', color = '#6366f1', autoRotate = true }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'cpu':
        return <boxGeometry args={[2, 0.3, 2]} />;
      case 'gpu':
        return <boxGeometry args={[2.5, 0.5, 1.5]} />;
      case 'memory':
        return <boxGeometry args={[0.5, 1.5, 0.2]} />;
      case 'physics':
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'atom':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'molecule':
        return <octahedronGeometry args={[1, 0]} />;
      case 'cylinder':
        return <cylinderGeometry args={[1, 1, 2, 32]} />;
      case 'cone':
        return <coneGeometry args={[1, 2, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.8, 0.3, 16, 100]} />;
      case 'torusknot':
        return <torusKnotGeometry args={[1, 0.3, 128, 32]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1, 0]} />;
      default:
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    }
  };

  const getMaterial = () => {
    if (type === 'physics' || type === 'sphere') {
      return (
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      );
    }
    if (type === 'atom') {
      return (
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      );
    }
    return (
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={0.2}
      />
    );
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {getGeometry()}
        {getMaterial()}
      </mesh>
    </Float>
  );
};

// Atom model component with electrons
const AtomModel = ({ color = '#ef4444' }) => {
  const groupRef = useRef();
  const electronsRef = useRef([]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
    electronsRef.current.forEach((electron, i) => {
      if (electron) {
        const speed = 1 + i * 0.5;
        electron.position.x = Math.cos(state.clock.elapsedTime * speed + i * 2) * 2;
        electron.position.z = Math.sin(state.clock.elapsedTime * speed + i * 2) * 2;
        electron.position.y = Math.sin(state.clock.elapsedTime * speed * 0.5 + i) * 0.5;
      }
    });
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[Math.PI / 3 * i, 0, 0]}>
          <mesh ref={(el) => (electronsRef.current[i] = el)}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`orbit-${i}`} rotation={[Math.PI / 3 * i, 0, 0]}>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#94a3b8"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// Molecule model component
const MoleculeModel = ({ color = '#6366f1' }) => {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.3}
          roughness={0.2}
          clearcoat={0.8}
        />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.cos(angle) * 1.2;
        const z = Math.sin(angle) * 1.2;
        const y = i % 2 === 0 ? 0.5 : -0.5;
        return (
          <group key={i}>
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[0.35, 32, 32]} />
              <meshPhysicalMaterial
                color={color}
                metalness={0.3}
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
            <mesh position={[x / 2, y / 2, z / 2]} rotation={[Math.atan2(y, Math.sqrt(x * x + z * z)), 0, Math.atan2(x, z)]}>
              <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
              <meshStandardMaterial
                color="#94a3b8"
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// DNA Helix model component
const DNAHelixModel = ({ color = '#8b5cf6' }) => {
  return (
    <group>
      {Array.from({ length: 15 }).map((_, i) => {
        const y = (i - 7.5) * 0.3;
        const angle = i * 0.5;
        return (
          <group key={i}>
            <mesh position={[Math.cos(angle), y, Math.sin(angle)]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshPhysicalMaterial
                color={color}
                metalness={0.2}
                roughness={0.3}
                emissive="#4c1d95"
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh position={[Math.cos(angle + Math.PI), y, Math.sin(angle + Math.PI)]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshPhysicalMaterial
                color={color}
                metalness={0.2}
                roughness={0.3}
                emissive="#4c1d95"
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh position={[0, y, 0]} rotation={[0, angle + Math.PI / 2, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
              <meshPhysicalMaterial
                color="#06b6d4"
                metalness={0.2}
                roughness={0.3}
                emissive="#164e63"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Loaded model component
const LoadedModel = ({ url, format = 'gltf', autoRotate = true }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  let model = null;

  try {
    if (format === 'gltf' || format === 'glb') {
      const gltf = useLoader(GLTFLoader, url);
      model = gltf.scene;
    } else if (format === 'obj') {
      model = useLoader(OBJLoader, url);
    }
  } catch (e) {
    console.error('Error loading model:', e);
  }

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current && !hovered) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  useEffect(() => {
    if (model) {
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.envMapIntensity = 1;
        }
      });
    }
  }, [model]);

  if (!model) {
    return (
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
    );
  }

  return (
    <primitive
      ref={meshRef}
      object={model}
      scale={2}
      position={[0, -1, 0]}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    />
  );
};

// Bounds component for auto-fitting
const FitBounds = ({ fit }) => {
  const bounds = useBounds();
  useEffect(() => {
    if (fit) bounds.refresh().clip();
  }, [fit, bounds]);
  return null;
};

// Main Model3DViewer component
const Model3DViewer = ({
  modelUrl = null,
  modelFormat = 'gltf',
  modelType = 'box',
  proceduralType = null,
  autoRotate = true,
  rotationSpeed = 1,
  backgroundColor = '#0f172a',
  lighting = 'studio',
  showGrid = false,
  showGizmo = false,
  showStats = false,
  className = '',
  width = '100%',
  height = '400px',
  onScreenshot = null,
  showControls = true,
  annotations = [],
  enableBounds = true,
  color = '#6366f1',
}) => {
  const canvasRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(autoRotate);
  const [gridEnabled, setGridEnabled] = useState(showGrid);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const takeScreenshot = () => {
    if (canvasRef.current && onScreenshot) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      onScreenshot(dataURL);
    } else if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `model-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  const resetCamera = () => {
    // This would reset camera to default position
    // Implementation depends on camera ref
  };

  const effectiveModelType = proceduralType || modelType;

  const renderModel = () => {
    if (modelUrl) {
      return <LoadedModel url={modelUrl} format={modelFormat} autoRotate={autoRotateEnabled} />;
    }

    switch (effectiveModelType) {
      case 'atom':
        return <AtomModel color={color} />;
      case 'molecule':
        return <MoleculeModel color={color} />;
      case 'dna':
        return <DNAHelixModel color={color} />;
      default:
        return <ProceduralModel type={effectiveModelType} color={color} autoRotate={autoRotateEnabled} />;
    }
  };

  const qrUrl = modelUrl
    ? modelUrl
    : `${typeof window !== 'undefined' ? window.location.origin : ''}/ar/viewer/${effectiveModelType}`;

  return (
    <>
      <div
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
        style={{ width, height }}
      >
        <div
          className="glassmorphic-container overflow-hidden shadow-2xl rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Canvas
            ref={canvasRef}
            shadows
            dpr={[1, 2]}
            style={{ background: backgroundColor }}
          >
            <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />

            {lighting === 'studio' ? (
              <>
                <Environment preset="studio" />
                <Stage environment="studio" intensity={0.5}>
                  <Suspense fallback={<LoadingFallback />}>
                    {renderModel()}
                  </Suspense>
                </Stage>
              </>
            ) : (
              <>
                <Sky sunPosition={[100, 20, 100]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
                <Suspense fallback={<LoadingFallback />}>
                  {renderModel()}
                </Suspense>
              </>
            )}

            {gridEnabled && (
              <Grid
                args={[20, 20]}
                cellColor="#6366f1"
                sectionColor="#1e293b"
                position={[0, -2, 0]}
              />
            )}

            {showGizmo && (
              <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport axesColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
              </GizmoHelper>
            )}

            {showStats && <Stats />}

            {enableBounds && <FitBounds fit={true} />}

            <OrbitControls
              autoRotate={autoRotateEnabled}
              autoRotateSpeed={rotationSpeed}
              enablePan={true}
              enableZoom={true}
              enableDamping
              dampingFactor={0.05}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI * 5 / 6}
              minDistance={3}
              maxDistance={15}
            />

            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
          </Canvas>

          {/* Controls */}
          {showControls && (
            <>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors"
                  title={autoRotateEnabled ? 'Disable Auto-Rotate' : 'Enable Auto-Rotate'}
                >
                  <svg
                    className={`w-5 h-5 text-white ${autoRotateEnabled ? 'animate-spin-slow' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ animationDuration: '3s' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setGridEnabled(!gridEnabled)}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors"
                  title={gridEnabled ? 'Hide Grid' : 'Show Grid'}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={takeScreenshot}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors"
                  title="Take Screenshot"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors"
                  title="Show QR Code"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="absolute bottom-4 left-4 glassmorphic-container px-4 py-2 rounded-xl">
                <div className="flex items-center gap-4 text-white text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                    <span>Drag to rotate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                    <span>Scroll to zoom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                      />
                    </svg>
                    <span>Right-click to pan</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* QR Code Modal */}
          {showQR && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Scan for AR View</h3>
                  <button
                    onClick={() => setShowQR(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl mb-4">
                    <QRCodeSVG value={qrUrl} size={200} level="H" />
                  </div>
                  <p className="text-sm text-gray-600 text-center break-all">{qrUrl}</p>
                  <button
                    onClick={() => {
                      const canvas = document.querySelector('canvas');
                      if (canvas) {
                        const qrCanvas = document.querySelector('svg');
                        // Create download link for QR
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Download QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Model3DViewer;

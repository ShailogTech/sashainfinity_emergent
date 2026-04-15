import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html, useAnimations, Stage, Sky, Stars, Float, MeshTransmissionMaterial } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

const Model = ({ url, format = 'gltf', autoRotate = true, annotation, onClickAnnotation }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  let model = null;

  if (format === 'gltf' || format === 'glb') {
    try {
      const gltf = useLoader(GLTFLoader, url);
      model = gltf.scene;
    } catch (e) {
      console.error('Error loading GLTF model:', e);
    }
  } else if (format === 'obj') {
    try {
      model = useLoader(OBJLoader, url);
    } catch (e) {
      console.error('Error loading OBJ model:', e);
    }
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
    <>
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
        onClick={(e) => {
          if (annotation) {
            setShowAnnotation(!showAnnotation);
            onClickAnnotation?.(annotation);
          }
        }}
      />
      {annotation && hovered && (
        <Html position={[0, 2, 0]} center distanceFactor={10}>
          <div className="annotation-tooltip">
            <p className="text-sm font-semibold text-white bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm">
              {annotation.title}
            </p>
          </div>
        </Html>
      )}
      {annotation && showAnnotation && (
        <Html position={[0, 2.5, 0]} center distanceFactor={10}>
          <div className="annotation-detail bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl max-w-xs">
            <h4 className="font-bold text-gray-900 mb-2">{annotation.title}</h4>
            <p className="text-sm text-gray-700">{annotation.description}</p>
            {annotation.extraInfo && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">{annotation.extraInfo}</p>
              </div>
            )}
          </div>
        </Html>
      )}
    </>
  );
};

const ProceduralModel = ({ type = 'cpu', color = '#6366f1' }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const createGeometry = () => {
    switch (type) {
      case 'cpu':
        return (
          <>
            <boxGeometry args={[2, 0.3, 2]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </>
        );
      case 'gpu':
        return (
          <>
            <boxGeometry args={[2.5, 0.5, 1.5]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
          </>
        );
      case 'memory':
        return (
          <>
            <boxGeometry args={[0.5, 1.5, 0.2]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
          </>
        );
      case 'physics':
        return (
          <>
            <sphereGeometry args={[1, 32, 32]} />
            <meshPhysicalMaterial
              color={color}
              metalness={0.1}
              roughness={0.1}
              transmission={0.9}
              thickness={0.5}
            />
          </>
        );
      case 'atom':
        return (
          <>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </>
        );
      case 'molecule':
        return (
          <>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </>
        );
      default:
        return (
          <>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color={color} />
          </>
        );
    }
  };

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {createGeometry()}
      </mesh>
    </Float>
  );
};

const AtomModel = () => {
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
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[Math.PI / 3 * i, 0, 0]}>
          <mesh ref={(el) => (electronsRef.current[i] = el)}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`orbit-${i}`} rotation={[Math.PI / 3 * i, 0, 0]}>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

const LoadingFallback = () => (
  <Html center>
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 text-sm">Loading 3D model...</p>
    </div>
  </Html>
);

const ModelViewer = ({
  modelUrl = null,
  modelFormat = 'gltf',
  proceduralType = null,
  autoRotate = true,
  annotations = [],
  backgroundColor = '#0f172a',
  lighting = 'studio',
  showGrid = true,
  className = '',
  onModelClick = null,
}) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const viewerStyle = `
    .glassmorphic-container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
    }
    .annotation-tooltip {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <>
      <style>{viewerStyle}</style>
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
        <div className="glassmorphic-container overflow-hidden shadow-2xl">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={50} />

            {lighting === 'studio' ? (
              <>
                <Environment preset="studio" />
                <Stage environment="studio" intensity={0.5}>
                  <Suspense fallback={<LoadingFallback />}>
                    {modelUrl ? (
                      <Model
                        url={modelUrl}
                        format={modelFormat}
                        autoRotate={autoRotate}
                        annotation={annotations[0]}
                        onClickAnnotation={setSelectedAnnotation}
                      />
                    ) : proceduralType === 'atom' ? (
                      <AtomModel />
                    ) : (
                      <ProceduralModel type={proceduralType || 'cpu'} />
                    )}
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
                  {modelUrl ? (
                    <Model url={modelUrl} format={modelFormat} autoRotate={autoRotate} />
                  ) : proceduralType === 'atom' ? (
                      <AtomModel />
                    ) : (
                      <ProceduralModel type={proceduralType || 'cpu'} />
                    )}
                </Suspense>
              </>
            )}

            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={1}
              enablePan={true}
              enableZoom={true}
              enableDamping
              dampingFactor={0.05}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI * 5 / 6}
              minDistance={3}
              maxDistance={15}
            />

            {showGrid && lighting !== 'studio' && (
              <gridHelper args={[20, 20, '#6366f1', '#1e293b']} position={[0, -2, 0]} />
            )}

            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
          </Canvas>

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>

          <div className="absolute bottom-4 left-4 glassmorphic-container px-4 py-2">
            <div className="flex items-center gap-4 text-white text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span>Drag to rotate</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>Scroll to zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                <span>Right-click to pan</span>
              </div>
            </div>
          </div>

          {selectedAnnotation && (
            <div className="absolute top-4 left-4 glassmorphic-container p-4 max-w-xs">
              <button
                onClick={() => setSelectedAnnotation(null)}
                className="absolute top-2 right-2 text-white/70 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h4 className="text-white font-bold mb-2">{selectedAnnotation.title}</h4>
              <p className="text-white/80 text-sm">{selectedAnnotation.description}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModelViewer;

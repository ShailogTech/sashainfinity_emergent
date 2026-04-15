import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Html, Stage, Float, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { QRCodeSVG } from 'qrcode.react';
import Model3DViewer from '@/components/ar/Model3DViewer';
import { ARQRCard } from '@/components/ar/QRCodeGenerator';
import * as THREE from 'three';

/**
 * ARViewerPage Component
 * Main AR Viewer page for 3D models with interactive viewing, annotations, and QR code generation
 */

// Camera entry component for AR mode
const AREntry = ({ onExit, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Unable to access camera. Please check permissions.');
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/png');
      if (onCapture) onCapture(imageData);
      return imageData;
    }
    return null;
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center p-6">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white text-lg mb-4">{error}</p>
            <p className="text-gray-400 text-sm">Enable camera access to use AR view</p>
            <button
              onClick={onExit}
              className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Back to Viewer
            </button>
          </div>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 right-4">
              <div className="flex justify-between items-start">
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 max-w-xs">
                  <h3 className="text-white font-bold mb-1">AR Mode</h3>
                  <p className="text-white/70 text-sm">Point camera at a flat surface to place the model</p>
                </div>
                <button
                  onClick={onExit}
                  className="bg-black/50 backdrop-blur-md rounded-xl p-3 text-white hover:bg-black/70 transition-colors pointer-events-auto"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-dashed border-white/50 rounded-3xl" />
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
              <button
                onClick={captureFrame}
                className="bg-white/20 backdrop-blur-md rounded-full p-4 hover:bg-white/30 transition-colors"
              >
                <div className="w-16 h-16 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Annotation component
const ModelAnnotation = ({ annotation, active, onClick }) => (
  <div
    className={`absolute cursor-pointer transition-all duration-300 ${active ? 'z-20 scale-110' : 'z-10 hover:scale-105'}`}
    style={{
      left: `${annotation.x}%`,
      top: `${annotation.y}%`,
      transform: 'translate(-50%, -50%)',
    }}
    onClick={() => onClick(annotation)}
  >
    <div className={`relative ${active ? 'animate-pulse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-indigo-500' : 'bg-white/80 backdrop-blur-sm'}`}>
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      {active && (
        <div className="absolute left-full ml-3 top-0 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl max-w-xs">
          <h4 className="font-bold text-gray-900 mb-1">{annotation.title}</h4>
          <p className="text-sm text-gray-700">{annotation.description}</p>
        </div>
      )}
    </div>
  </div>
);

// Main ARViewerPage component
const ARViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('viewer');
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  // Model database
  const models = {
    cpu: {
      id: 'cpu',
      name: 'CPU Architecture',
      description: 'Central Processing Unit - the brain of the computer',
      category: 'hardware',
      proceduralType: 'cpu',
      color: '#6366f1',
      tags: ['hardware', 'processor', 'computer'],
      difficulty: 'Intermediate',
      duration: '25 min',
      annotations: [
        { id: 1, x: 50, y: 30, title: 'ALU', description: 'Arithmetic Logic Unit - performs mathematical calculations' },
        { id: 2, x: 30, y: 50, title: 'Control Unit', description: 'Directs data flow between CPU and other devices' },
        { id: 3, x: 70, y: 50, title: 'Cache', description: 'High-speed memory for quick data access' },
        { id: 4, x: 50, y: 70, title: 'Registers', description: 'Small, fast storage locations' },
      ],
      educationalContent: {
        title: 'Understanding CPU Architecture',
        sections: [
          { heading: 'What is a CPU?', content: 'The CPU (Central Processing Unit) is the primary component that executes instructions and processes data in a computer.' },
          { heading: 'Key Components', content: 'The CPU consists of the Control Unit (CU), Arithmetic Logic Unit (ALU), and registers. These work together to fetch, decode, and execute instructions.' },
          { heading: 'How it Works', content: 'The CPU follows a cycle: Fetch instructions from memory, Decode them, Execute the operation, and Store results.' },
        ],
      },
      relatedModels: ['gpu', 'memory'],
    },
    gpu: {
      id: 'gpu',
      name: 'GPU Architecture',
      description: 'Graphics Processing Unit - specialized for graphics rendering',
      category: 'hardware',
      proceduralType: 'gpu',
      color: '#10b981',
      tags: ['hardware', 'graphics', 'gaming'],
      difficulty: 'Intermediate',
      duration: '30 min',
      annotations: [
        { id: 1, x: 50, y: 25, title: 'CUDA Cores', description: 'Parallel processing units for general computation' },
        { id: 2, x: 25, y: 50, title: 'VRAM', description: 'Video RAM - dedicated graphics memory' },
        { id: 3, x: 75, y: 50, title: 'ROP Units', description: 'Render Output Units handle final pixel processing' },
      ],
      educationalContent: {
        title: 'Understanding GPU Architecture',
        sections: [
          { heading: 'What is a GPU?', content: 'A GPU is specialized for parallel processing, making it ideal for graphics rendering and machine learning.' },
          { heading: 'Parallel Processing', content: 'Unlike CPUs with few cores, GPUs have thousands of smaller cores designed for simultaneous calculations.' },
          { heading: 'Applications', content: 'GPUs power gaming graphics, video editing, 3D rendering, and AI/ML computations.' },
        ],
      },
      relatedModels: ['cpu', 'memory'],
    },
    atom: {
      id: 'atom',
      name: 'Atomic Structure',
      description: 'The basic unit of matter',
      category: 'physics',
      proceduralType: 'atom',
      color: '#ef4444',
      tags: ['physics', 'chemistry', 'science'],
      difficulty: 'Beginner',
      duration: '20 min',
      annotations: [
        { id: 1, x: 50, y: 50, title: 'Nucleus', description: 'Contains protons and neutrons' },
        { id: 2, x: 25, y: 30, title: 'Electron 1', description: 'Negatively charged particle' },
        { id: 3, x: 75, y: 40, title: 'Electron 2', description: 'Orbits the nucleus' },
        { id: 4, x: 50, y: 75, title: 'Electron 3', description: 'Electron shell' },
      ],
      educationalContent: {
        title: 'Understanding Atomic Structure',
        sections: [
          { heading: 'What is an Atom?', content: 'Atoms are the smallest unit of ordinary matter that form a chemical element.' },
          { heading: 'Structure', content: 'An atom consists of a nucleus (protons and neutrons) surrounded by electrons in electron shells.' },
          { heading: 'Electron Configuration', content: 'Electrons occupy specific energy levels or shells around the nucleus in probabilistic orbitals.' },
        ],
      },
      relatedModels: ['molecule', 'physics'],
    },
    physics: {
      id: 'physics',
      name: 'Quantum Sphere',
      description: 'Representing quantum states',
      category: 'physics',
      proceduralType: 'physics',
      color: '#8b5cf6',
      tags: ['physics', 'quantum', 'science'],
      difficulty: 'Advanced',
      duration: '35 min',
      annotations: [
        { id: 1, x: 50, y: 50, title: 'Superposition', description: 'Existing in multiple states simultaneously' },
        { id: 2, x: 30, y: 30, title: 'Entanglement', description: "Spooky action at a distance" },
        { id: 3, x: 70, y: 70, title: 'Wave Function', description: 'Probability amplitude of quantum state' },
      ],
      educationalContent: {
        title: 'Understanding Quantum Mechanics',
        sections: [
          { heading: 'Quantum Superposition', content: 'A quantum system can exist in multiple states at once until measured.' },
          { heading: 'Wave Function', content: 'The mathematical description of quantum states.' },
          { heading: 'Quantum Entanglement', content: 'Particles can be correlated in ways that transcend spatial separation.' },
        ],
      },
      relatedModels: ['atom', 'molecule'],
    },
    molecule: {
      id: 'molecule',
      name: 'Molecular Structure',
      description: 'Chemical compounds visualization',
      category: 'chemistry',
      proceduralType: 'molecule',
      color: '#f59e0b',
      tags: ['chemistry', 'science', 'molecule'],
      difficulty: 'Intermediate',
      duration: '25 min',
      annotations: [
        { id: 1, x: 50, y: 50, title: 'Bond', description: 'Chemical bond between atoms' },
        { id: 2, x: 30, y: 40, title: 'Atom A', description: 'First atom in molecule' },
        { id: 3, x: 70, y: 60, title: 'Atom B', description: 'Second atom in molecule' },
      ],
      educationalContent: {
        title: 'Understanding Molecular Structure',
        sections: [
          { heading: 'Chemical Bonds', content: 'Atoms form molecules through chemical bonds involving electron sharing or transfer.' },
          { heading: 'Molecular Geometry', content: 'The 3D arrangement of atoms determines molecular properties and reactivity.' },
          { heading: 'Intermolecular Forces', content: 'Forces between molecules determine physical properties like boiling point and solubility.' },
        ],
      },
      relatedModels: ['atom', 'crystal'],
    },
    memory: {
      id: 'memory',
      name: 'RAM Module',
      description: 'Random Access Memory',
      category: 'hardware',
      proceduralType: 'memory',
      color: '#3b82f6',
      tags: ['hardware', 'memory', 'computer'],
      difficulty: 'Beginner',
      duration: '15 min',
      annotations: [
        { id: 1, x: 50, y: 30, title: 'Memory Chips', description: 'Integrated circuits storing data' },
        { id: 2, x: 30, y: 50, title: 'PCB', description: 'Printed Circuit Board' },
        { id: 3, x: 70, y: 50, title: 'Pins', description: 'Connection points to motherboard' },
      ],
      educationalContent: {
        title: 'Understanding Computer Memory',
        sections: [
          { heading: 'What is RAM?', content: 'RAM (Random Access Memory) is volatile memory that stores data currently in use by the computer.' },
          { heading: 'How RAM Works', content: 'RAM allows data to be read and written in any order, making it faster than sequential storage.' },
          { heading: 'Types of RAM', content: 'Common types include DDR4, DDR5, with each generation offering improved speed and efficiency.' },
        ],
      },
      relatedModels: ['cpu', 'gpu'],
    },
    dna: {
      id: 'dna',
      name: 'DNA Double Helix',
      description: 'The building block of life',
      category: 'biology',
      proceduralType: 'dna',
      color: '#22c55e',
      tags: ['biology', 'dna', 'genetics'],
      difficulty: 'Intermediate',
      duration: '30 min',
      annotations: [
        { id: 1, x: 50, y: 30, title: 'Base Pairs', description: 'A-T and C-G connections' },
        { id: 2, x: 30, y: 50, title: 'Sugar-Phosphate', description: 'Backbone structure' },
        { id: 3, x: 70, y: 50, title: 'Grooves', description: 'Major and minor grooves' },
      ],
      educationalContent: {
        title: 'Understanding DNA Structure',
        sections: [
          { heading: 'What is DNA?', content: 'DNA (Deoxyribonucleic Acid) carries genetic instructions for the development, functioning, and reproduction of all living organisms.' },
          { heading: 'Double Helix', content: 'DNA has a double helix structure formed by base pairs attached to a sugar-phosphate backbone.' },
          { heading: 'Base Pairs', content: 'Four nucleobases (Adenine, Thymine, Guanine, Cytosine) form pairs: A with T, and G with C.' },
        ],
      },
      relatedModels: ['cell', 'molecule'],
    },
  };

  useEffect(() => {
    const foundModel = models[id];
    if (foundModel) {
      setModel(foundModel);
      setQrUrl(`${window.location.origin}/ar/viewer/${id}`);
    }
    setLoading(false);
  }, [id]);

  const handleAnnotationClick = (annotation) => {
    setActiveAnnotation(activeAnnotation?.id === annotation.id ? null : annotation);
  };

  const shareModel = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: model.name,
          text: model.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading AR Experience...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Model Not Found</h2>
          <button onClick={() => navigate('/ar-gallery')} className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {viewMode === 'ar' ? (
        <AREntry onExit={() => setViewMode('viewer')} onCapture={setCapturedImage} />
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* Header Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/ar-gallery')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Gallery
            </button>

            <div className="flex gap-3 flex-wrap justify-end">
              <button
                onClick={() => setViewMode('ar')}
                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                AR View
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                QR Code
              </button>
              <button
                onClick={shareModel}
                className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col items-center">
              <h3 className="text-white font-semibold mb-4">Scan to view in AR</h3>
              <ARQRCard arUrl={qrUrl} title={model.name} description={model.description} modelType={model.category} size={200} />
            </div>
          )}

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 3D Viewer Section */}
            <div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{model.name}</h1>
                    <p className="text-white/60 text-sm">{model.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm capitalize">{model.category}</span>
                </div>
                <div className="aspect-square md:aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative">
                  <Model3DViewer
                    proceduralType={model.proceduralType}
                    color={model.color}
                    autoRotate={true}
                    lighting="studio"
                    className="w-full h-full"
                    width="100%"
                    height="100%"
                    showControls={true}
                  />

                  {/* Annotations Overlay */}
                  {model.annotations && model.annotations.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {model.annotations.map((annotation) => (
                        <div key={annotation.id} className="pointer-events-auto">
                          <ModelAnnotation
                            annotation={annotation}
                            active={activeAnnotation?.id === annotation.id}
                            onClick={handleAnnotationClick}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Annotations Panel */}
              {model.annotations && model.annotations.length > 0 && (
                <div className="mt-6 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4">Interactive Annotations</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {model.annotations.map((annotation) => (
                      <button
                        key={annotation.id}
                        onClick={() => handleAnnotationClick(annotation)}
                        className={`p-3 rounded-xl text-left transition-all ${
                          activeAnnotation?.id === annotation.id
                            ? 'bg-indigo-500/30 border border-indigo-400'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <p className="text-white font-medium text-sm">{annotation.title}</p>
                        <p className="text-white/60 text-xs mt-1">{annotation.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Models */}
              {model.relatedModels && model.relatedModels.length > 0 && (
                <div className="mt-6 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4">Related 3D Models</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {model.relatedModels.map((relatedId) => {
                      const relatedModel = models[relatedId];
                      if (!relatedModel) return null;
                      return (
                        <Link
                          key={relatedId}
                          to={`/ar/viewer/${relatedId}`}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                        >
                          <p className="text-white font-medium text-sm">{relatedModel.name}</p>
                          <p className="text-white/60 text-xs mt-1">{relatedModel.category}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Educational Content Section */}
            <div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">{model.educationalContent.title}</h2>

                {model.educationalContent.sections.map((section, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-indigo-300 font-semibold mb-2">{section.heading}</h3>
                    <p className="text-white/70 leading-relaxed">{section.content}</p>
                  </div>
                ))}

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Model Info */}
                <div className="mt-6 flex gap-4 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {model.difficulty}
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {model.duration}
                  </div>
                </div>
              </div>

              {/* AR Promo Card */}
              <div className="mt-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-400/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Try AR Mode</h3>
                    <p className="text-white/60 text-sm mb-3">
                      Experience this model in augmented reality. Point your camera at a flat surface to place the 3D
                      model in your real-world environment.
                    </p>
                    <button
                      onClick={() => setViewMode('ar')}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm"
                    >
                      Launch AR View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARViewerPage;

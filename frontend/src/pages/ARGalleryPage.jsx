import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, Float } from '@react-three/drei';
import ARModelCard from '@/components/ar/ARModelCard';
import Model3DViewer from '@/components/ar/Model3DViewer';
import { ARQRCard } from '@/components/ar/QRCodeGenerator';

/**
 * ARGalleryPage Component
 * Gallery of available 3D AR models with filtering, search, and preview
 */

// Simple 3D model preview
const ModelPreview = ({ type, color }) => {
  const meshRef = React.useRef();

  React.useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {type === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
        {type === 'box' && <boxGeometry args={[1.5, 1.5, 1.5]} />}
        {type === 'cylinder' && <cylinderGeometry args={[1, 1, 2, 32]} />}
        {type === 'torus' && <torusGeometry args={[0.8, 0.3, 16, 100]} />}
        {type === 'cone' && <coneGeometry args={[1, 2, 32]} />}
        {type === 'cpu' && <boxGeometry args={[2, 0.3, 2]} />}
        {type === 'gpu' && <boxGeometry args={[2.5, 0.5, 1.5]} />}
        {type === 'memory' && <boxGeometry args={[0.5, 1.5, 0.2]} />}
        {(!type || type === 'default') && <boxGeometry args={[1.5, 1.5, 1.5]} />}
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
    </Float>
  );
};

const ARGalleryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredModel, setFeaturedModel] = useState('cpu');
  const [showQR, setShowQR] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  // Models database
  const models = [
    {
      id: 'cpu',
      name: 'CPU Architecture',
      description: 'Central Processing Unit visualization',
      category: 'hardware',
      proceduralType: 'cpu',
      color: '#6366f1',
      tags: ['hardware', 'processor', 'computer'],
      difficulty: 'Intermediate',
      duration: '25 min',
    },
    {
      id: 'gpu',
      name: 'GPU Architecture',
      description: 'Graphics Processing Unit',
      category: 'hardware',
      proceduralType: 'gpu',
      color: '#10b981',
      tags: ['hardware', 'graphics', 'gaming'],
      difficulty: 'Intermediate',
      duration: '30 min',
    },
    {
      id: 'memory',
      name: 'RAM Module',
      description: 'Random Access Memory',
      category: 'hardware',
      proceduralType: 'memory',
      color: '#3b82f6',
      tags: ['hardware', 'memory', 'computer'],
      difficulty: 'Beginner',
      duration: '15 min',
    },
    {
      id: 'atom',
      name: 'Atomic Structure',
      description: 'Basic unit of matter',
      category: 'physics',
      proceduralType: 'atom',
      color: '#ef4444',
      tags: ['physics', 'chemistry', 'science'],
      difficulty: 'Beginner',
      duration: '20 min',
    },
    {
      id: 'physics',
      name: 'Quantum Sphere',
      description: 'Quantum mechanics visualization',
      category: 'physics',
      proceduralType: 'physics',
      color: '#8b5cf6',
      tags: ['physics', 'quantum', 'science'],
      difficulty: 'Advanced',
      duration: '35 min',
    },
    {
      id: 'molecule',
      name: 'Molecular Structure',
      description: 'Chemical compound visualization',
      category: 'chemistry',
      proceduralType: 'molecule',
      color: '#f59e0b',
      tags: ['chemistry', 'science', 'molecule'],
      difficulty: 'Intermediate',
      duration: '25 min',
    },
    {
      id: 'dna',
      name: 'DNA Double Helix',
      description: 'The building block of life',
      category: 'biology',
      proceduralType: 'dna',
      color: '#22c55e',
      tags: ['biology', 'dna', 'genetics'],
      difficulty: 'Intermediate',
      duration: '30 min',
    },
    {
      id: 'cell',
      name: 'Cell Structure',
      description: 'Interactive model of cell organelles',
      category: 'biology',
      proceduralType: 'sphere',
      color: '#84cc16',
      tags: ['biology', 'cell', 'science'],
      difficulty: 'Intermediate',
      duration: '35 min',
    },
    {
      id: 'crystal',
      name: 'Crystal Lattice',
      description: 'Understand crystal structures',
      category: 'chemistry',
      proceduralType: 'dodecahedron',
      color: '#0ea5e9',
      tags: ['chemistry', 'crystal', 'science'],
      difficulty: 'Advanced',
      duration: '40 min',
    },
    {
      id: 'trigonometry',
      name: 'Trigonometry Triangle',
      description: 'Interactive right triangle',
      category: 'math',
      proceduralType: 'cone',
      color: '#ec4899',
      tags: ['math', 'trigonometry', 'geometry'],
      difficulty: 'Beginner',
      duration: '15 min',
    },
    {
      id: 'geometry',
      name: 'Platonic Solids',
      description: 'Explore regular polyhedra',
      category: 'math',
      proceduralType: 'icosahedron',
      color: '#f97316',
      tags: ['math', 'geometry', 'shapes'],
      difficulty: 'Beginner',
      duration: '20 min',
    },
    {
      id: 'calculus',
      name: 'Parametric Surface',
      description: 'Curvature and torsion visualization',
      category: 'math',
      proceduralType: 'torusknot',
      color: '#06b6d4',
      tags: ['math', 'calculus', 'geometry'],
      difficulty: 'Advanced',
      duration: '45 min',
    },
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All Models', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    {
      id: 'hardware',
      name: 'Hardware',
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    },
    {
      id: 'physics',
      name: 'Physics',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    },
    {
      id: 'biology',
      name: 'Biology',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
    {
      id: 'math',
      name: 'Mathematics',
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    },
  ];

  // Stats
  const stats = [
    { value: models.length, label: '3D Models' },
    { value: categories.length - 1, label: 'Categories' },
    { value: 'AR', label: 'Ready' },
    { value: 'Free', label: 'Access' },
  ];

  // Filter and sort models
  const filteredModels = useMemo(() => {
    let result = models.filter((model) => {
      const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // Sort models
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'difficulty':
          const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        default:
          return 0;
      }
    });

    return result;
  }, [models, selectedCategory, searchQuery, sortBy]);

  const handleViewInAR = (id) => {
    // Navigate to AR viewer
    window.location.href = `/ar/viewer/${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-4">
          <Link to="/" className="text-white/70 hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white font-medium">AR Gallery</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Augmented Reality Gallery</h1>
              <p className="text-white/60 text-lg">Explore interactive 3D models for education and visualization</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Featured Model Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10">
              <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold text-white">Featured Model</h2>
                <div className="flex gap-2">
                  {models.slice(0, 4).map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setFeaturedModel(model.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        featuredModel === model.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {model.id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="aspect-square md:aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                <Model3DViewer
                  proceduralType={models.find((m) => m.id === featuredModel)?.proceduralType}
                  color={models.find((m) => m.id === featuredModel)?.color}
                  autoRotate={true}
                  lighting="studio"
                  className="w-full h-full"
                  showControls={true}
                />
              </div>
              <div className="p-4 border-t border-white/10">
                <h3 className="text-white font-semibold text-lg">{models.find((m) => m.id === featuredModel)?.name}</h3>
                <p className="text-white/60 text-sm">{models.find((m) => m.id === featuredModel)?.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How to Use */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-4">How to Use AR View</h3>
              <ol className="space-y-4">
                {[
                  { step: 1, text: 'Browse and select a 3D model from the gallery' },
                  { step: 2, text: 'Click "AR View" to launch the augmented reality experience' },
                  { step: 3, text: 'Scan the QR code with your mobile device' },
                  { step: 4, text: 'Point camera at a flat surface to place the model' },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {item.step}
                    </span>
                    <span className="text-white/70 text-sm pt-0.5">{item.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Categories */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-400/20">
              <h3 className="text-white font-semibold mb-4">Supported Categories</h3>
              <div className="space-y-3">
                {categories.slice(1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="w-full flex items-center gap-3 text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cat.icon} />
                    </svg>
                    <span className="text-white/80">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Promo */}
            {showQR && (
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-gray-900 font-semibold mb-4">Quick Access QR</h3>
                <ARQRCard
                  arUrl="/ar-gallery"
                  title="AR Gallery"
                  description="Scan to browse all AR models"
                  modelType="Gallery"
                  size={150}
                />
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search models by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {category.id !== 'all' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                  </svg>
                )}
                <span className="capitalize">{category.name}</span>
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="name" className="bg-slate-900">Sort by Name</option>
            <option value="category" className="bg-slate-900">Sort by Category</option>
            <option value="difficulty" className="bg-slate-900">Sort by Difficulty</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-white/60">
          Showing {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'}
          {selectedCategory !== 'all' && ` in ${categories.find((c) => c.id === selectedCategory)?.name}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Empty State */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-white/60 text-lg">No models found</p>
            <p className="text-white/40 text-sm mt-2">Try adjusting your search or filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Model Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModels.map((model) => (
              <ARModelCard
                key={model.id}
                {...model}
                modelType={model.proceduralType}
                showQR={showQR}
                onViewInAR={handleViewInAR}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-white/40 text-sm">Powered by Three.js and React Three Fiber</p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              {showQR ? 'Hide' : 'Show'} QR Codes
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ARGalleryPage;

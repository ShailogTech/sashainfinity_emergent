import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModelViewer from './ModelViewer';

const categoryIcons = {
  hardware: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  physics: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  chemistry: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  biology: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
};

const categoryColors = {
  hardware: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
  physics: 'from-purple-500/20 to-pink-500/20 border-purple-400/30',
  chemistry: 'from-amber-500/20 to-orange-500/20 border-amber-400/30',
  biology: 'from-green-500/20 to-emerald-500/20 border-green-400/30'
};

const ModelCard = ({ model, onClick, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={() => onClick(model.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative bg-gradient-to-br ${categoryColors[model.category]}
        backdrop-blur-md rounded-2xl border overflow-hidden
        cursor-pointer transition-all duration-500
        hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20
        ${isHovered ? 'ring-2 ring-indigo-400' : ''}
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        <ModelViewer
          proceduralType={model.proceduralType}
          color={model.color}
          autoRotate={true}
          lighting="studio"
          className="w-full h-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white capitalize">
            {model.category}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white/80 text-sm">{model.description}</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1">{model.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-sm">{model.description}</p>
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-400 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

const ARGallery = ({ models, title = 'AR Model Gallery' }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories = ['all', 'hardware', 'physics', 'chemistry', 'biology'];

  const filteredModels = React.useMemo(() => {
    return models.filter(model => {
      const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [models, selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/60">Explore interactive 3D models in augmented reality</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2
                ${selectedCategory === category
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }
              `}
            >
              {category !== 'all' && categoryIcons[category]}
              <span className="capitalize">{category}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-white/60 text-lg">No models found</p>
          <p className="text-white/40 text-sm mt-2">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model, index) => (
            <ModelCard
              key={model.id}
              model={model}
              onClick={(id) => navigate(`/ar/viewer/${id}`)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ARGallery;

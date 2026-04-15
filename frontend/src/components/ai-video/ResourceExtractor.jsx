import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const RESOURCE_TYPES = [
  { type: 'website', icon: '🌐', label: 'Website', color: 'bg-blue-100 text-blue-700' },
  { type: 'book', icon: '📚', label: 'Book', color: 'bg-purple-100 text-purple-700' },
  { type: 'article', icon: '📄', label: 'Article', color: 'bg-green-100 text-green-700' },
  { type: 'video', icon: '🎥', label: 'Video', color: 'bg-red-100 text-red-700' },
  { type: 'tool', icon: '🔧', label: 'Tool', color: 'bg-orange-100 text-orange-700' },
  { type: 'other', icon: '📎', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

const ResourceExtractor = ({ videoId, resources, onAddResource, onUpdateResource, onDeleteResource }) => {
  const [localResources, setLocalResources] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [filter, setFilter] = useState('all');

  // Form state
  const [newResource, setNewResource] = useState({
    resource_type: 'website',
    title: '',
    url: '',
    description: '',
    timestamp: ''
  });

  useEffect(() => {
    if (resources) {
      setLocalResources(resources);
    }
  }, [resources]);

  const formatTimestamp = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTimestamp = (timestamp) => {
    if (!timestamp) return 0;
    const parts = timestamp.split(':').map(Number);
    return parts[0] * 60 + (parts[1] || 0);
  };

  const handleAddResource = () => {
    if (!newResource.title.trim()) return;

    const resource = {
      id: `temp-${Date.now()}`,
      video_id: videoId,
      ...newResource,
      timestamp: newResource.timestamp ? parseTimestamp(newResource.timestamp) : null,
      metadata: {
        extracted_from: 'manual',
        added_at: new Date().toISOString()
      }
    };

    const updatedResources = [...localResources, resource].sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return a.timestamp - b.timestamp;
    });

    setLocalResources(updatedResources);
    onAddResource?.(resource);
    resetForm();
  };

  const handleUpdateResource = (resourceId) => {
    const index = localResources.findIndex(r => r.id === resourceId);
    if (index === -1) return;

    const updatedResources = [...localResources];
    updatedResources[index] = {
      ...updatedResources[index],
      ...newResource,
      timestamp: newResource.timestamp ? parseTimestamp(newResource.timestamp) : null
    };

    setLocalResources(updatedResources);
    onUpdateResource?.(updatedResources[index]);
    setEditingResource(null);
    resetForm();
  };

  const handleDeleteResource = (resourceId) => {
    const updatedResources = localResources.filter(r => r.id !== resourceId);
    setLocalResources(updatedResources);
    onDeleteResource?.(resourceId);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource.id);
    setNewResource({
      resource_type: resource.resource_type,
      title: resource.title,
      url: resource.url || '',
      description: resource.description || '',
      timestamp: resource.timestamp ? formatTimestamp(resource.timestamp) : ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setNewResource({
      resource_type: 'website',
      title: '',
      url: '',
      description: '',
      timestamp: ''
    });
    setShowAddForm(false);
    setEditingResource(null);
  };

  const getResourceTypeConfig = (type) => {
    return RESOURCE_TYPES.find(r => r.type === type) || RESOURCE_TYPES[5];
  };

  const filteredResources = filter === 'all'
    ? localResources
    : localResources.filter(r => r.resource_type === filter);

  const resourcesByType = RESOURCE_TYPES.reduce((acc, type) => {
    acc[type.type] = localResources.filter(r => r.resource_type === type.type).length;
    return acc;
  }, {});

  return (
    <div className="glassmorphism-lg rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Resources</h3>
          <p className="text-sm text-gray-500">
            {localResources.length} resources extracted from video
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
            showAddForm
              ? "bg-gray-200 text-gray-700"
              : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg"
          )}
        >
          {showAddForm ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Resource
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Resource Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4 space-y-4"
          >
            <h4 className="font-medium text-gray-800">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h4>

            {/* Resource Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Resource Type</label>
              <div className="flex flex-wrap gap-2">
                {RESOURCE_TYPES.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => setNewResource({ ...newResource, resource_type: type.type })}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                      newResource.resource_type === type.type
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    )}
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="e.g., React Documentation"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* URL */}
            {(newResource.resource_type === 'website' ||
              newResource.resource_type === 'article' ||
              newResource.resource_type === 'video') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">URL</label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                placeholder="Brief description of the resource..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
              />
            </div>

            {/* Timestamp */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mentioned at (optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newResource.timestamp}
                  onChange={(e) => setNewResource({ ...newResource, timestamp: e.target.value })}
                  placeholder="0:00"
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <span className="text-sm text-gray-500">Timestamp when this resource is mentioned in the video</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {editingResource && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={editingResource ? () => handleUpdateResource(editingResource) : handleAddResource}
                disabled={!newResource.title.trim()}
                className={cn(
                  "px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  editingResource ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
                )}
              >
                {editingResource ? 'Update Resource' : 'Add Resource'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
            filter === 'all'
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          All ({localResources.length})
        </button>
        {RESOURCE_TYPES.map((type) => (
          <button
            key={type.type}
            onClick={() => setFilter(type.type)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1",
              filter === type.type
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <span>{type.icon}</span>
            {type.label} ({resourcesByType[type.type] || 0})
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredResources.map((resource) => {
            const typeConfig = getResourceTypeConfig(resource.resource_type);

            return (
              <motion.div
                key={resource.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                {/* Resource Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", typeConfig.color)}>
                    <span className="mr-1">{typeConfig.icon}</span>
                    {typeConfig.label}
                  </span>
                </div>

                {/* Resource Content */}
                <div className="pr-20">
                  {resource.timestamp && (
                    <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      <span>{formatTimestamp(resource.timestamp)}</span>
                    </div>
                  )}

                  <h4 className="font-semibold text-gray-800 pr-4">{resource.title}</h4>

                  {resource.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                  )}

                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {resource.url.length > 40 ? resource.url.slice(0, 40) + '...' : resource.url}
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditResource(resource)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* AI Badge */}
                {resource.metadata?.extracted_from === 'transcript' && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                      AI Detected
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium">
            {filter === 'all' ? 'No resources yet' : `No ${getResourceTypeConfig(filter).label.toLowerCase()} resources`}
          </p>
          <p className="text-sm mt-1">
            {filter === 'all'
              ? 'Resources will be automatically extracted from the transcript, or add them manually'
              : 'Add resources of this type manually'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceExtractor;

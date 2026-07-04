import React, { useState, useEffect } from 'react';
import { X, Pencil, Image, Film, Music } from 'lucide-react';
import MediaUploader from './MediaUploader';

export default function EditGameModal({ isOpen, onClose, onGameUpdated, game }) {
  const [title, setTitle] = useState('');
  const [developer, setDeveloper] = useState('');
  const [collection, setCollection] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const [coverPreview, setCoverPreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [videoPreviews, setVideoPreviews] = useState([null, null, null]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (game && isOpen) {
      setTitle(game.title || '');
      setDeveloper(game.developer || '');
      setCollection(game.collection || '');
      setIsFavorite(!!game.isFavorite);
      setCoverPreview(game.coverUrl || null);
      setBgPreview(game.backgroundUrl || null);
      setAudioPreview(game.audioUrl || null);

      let vUrls = [];
      if (game.videoUrls && game.videoUrls.length > 0) vUrls = game.videoUrls;
      else if (game.videoUrl) vUrls = [game.videoUrl];

      setVideoPreviews([vUrls[0] || null, vUrls[1] || null, vUrls[2] || null]);
    }
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const handleCoverSelect = (fileUrl) => {
    setCoverPreview(fileUrl);
  };

  const handleBgSelect = (fileUrl) => {
    setBgPreview(fileUrl);
  };

  const handleAudioSelect = (fileUrl) => {
    setAudioPreview(fileUrl);
  };

  const handleVideoSelect = (index, fileUrl) => {
    const newPreviews = [...videoPreviews];
    newPreviews[index] = fileUrl;
    setVideoPreviews(newPreviews);
  };

  const handleRemoveVideo = (index) => {
    const newPreviews = [...videoPreviews];
    newPreviews[index] = null;
    setVideoPreviews(newPreviews);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const updatedGame = {
        ...game,
        title: title.trim(),
        developer: developer.trim() || 'Unknown',
        collection: collection.trim(),
        isFavorite,
        coverUrl: coverPreview,
        backgroundUrl: bgPreview,
        audioUrl: audioPreview,
        videoUrls: videoPreviews.filter(Boolean),
        videoUrl: videoPreviews.find(Boolean) || '', // Fallback for old code
      };

      onGameUpdated(updatedGame);
      onClose();
    } catch (err) {
      console.error('Failed to update game:', err);
      alert('Failed to update game. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl p-8 max-h-[90vh] overflow-y-auto animate-[fade-in_0.2s_ease-out] custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Pencil size={24} />
            Edit Game: {game.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title & Developer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Game Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-white/40 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Developer</label>
                <input
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-white/40 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Folder / Collection
                </label>
                <input
                  type="text"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="e.g. Action"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-white/40 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="fav-check"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded border-white/20"
            />
            <label
              htmlFor="fav-check"
              className="text-sm font-bold text-white/90 uppercase tracking-wide cursor-pointer"
            >
              Mark as Favorite
            </label>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Cover Art</label>
              {coverPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverPreview(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <MediaUploader
                  label="Upload Cover"
                  accept="image/*"
                  onFileSelect={handleCoverSelect}
                  icon={Image}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Background</label>
              {bgPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                  <img src={bgPreview} alt="Background" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setBgPreview(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <MediaUploader
                  label="Upload Background"
                  accept="image/*"
                  onFileSelect={handleBgSelect}
                  icon={Image}
                />
              )}
            </div>
          </div>

          {/* Ambient Music */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Background Music (Ambient)
            </label>
            {audioPreview ? (
              <div className="relative w-full h-16 rounded-xl border border-white/20 bg-black overflow-hidden flex items-center p-4 group">
                <Music size={24} className="text-white/50 mr-4" />
                <span className="text-sm text-white/80 truncate flex-1">
                  {audioPreview.split(/[\\/]/).pop()}
                </span>
                <button
                  onClick={() => setAudioPreview(null)}
                  className="ml-4 p-2 rounded-full bg-white/10 hover:bg-red-500/80 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="h-24">
                <MediaUploader
                  label="Upload Music File (.mp3, .wav)"
                  accept="audio/*"
                  onFileSelect={handleAudioSelect}
                  icon={Music}
                />
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Videos (Playlist up to 3)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  {videoPreviews[index] ? (
                    <div className="relative w-full h-24 rounded-xl border border-white/20 bg-black overflow-hidden group flex items-center justify-center p-2">
                      <Film size={24} className="text-white/30" />
                      <span className="absolute bottom-1 right-2 text-[10px] text-white/50">
                        {videoPreviews[index].split(/[\\/]/).pop()}
                      </span>
                      <button
                        onClick={() => handleRemoveVideo(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white hover:text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24">
                      <MediaUploader
                        label={`Video ${index + 1}`}
                        accept="video/*"
                        onFileSelect={(url) => handleVideoSelect(index, url)}
                        icon={Film}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-2">
              Videos will play in sequence automatically with sound enabled.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

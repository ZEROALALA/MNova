import React, { useState } from 'react';
import { X, Gamepad2, Upload, Image, Film, FolderSearch, CheckSquare, Square } from 'lucide-react';
import MediaUploader from './MediaUploader';
import { storage } from '../services/storage';
import { api } from '../services/api';

export default function AddGameModal({ isOpen, onClose, onGameAdded }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'scan'

  // Manual Add State
  const [title, setTitle] = useState('');
  const [developer, setDeveloper] = useState('');
  const [execPath, setExecPath] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [videoPreviews, setVideoPreviews] = useState([null, null, null]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedGames, setScannedGames] = useState([]);
  const [selectedScanned, setSelectedScanned] = useState(new Set());

  if (!isOpen) return null;

  // ----------------------------------------------------
  // MANUAL ADD LOGIC
  // ----------------------------------------------------
  const handleCoverSelect = (fileUrl) => {
    setCoverFile(fileUrl);
    setCoverPreview(fileUrl);
  };

  const handleBgSelect = (fileUrl) => {
    setBackgroundFile(fileUrl);
    setBgPreview(fileUrl);
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

  const handleSaveManual = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const id = `custom_${Date.now()}`;
      let coverUrl = coverFile || '';
      let backgroundUrl = backgroundFile || '';
      let videoUrls = videoPreviews.filter(Boolean);

      const newGame = {
        id,
        title: title.trim(),
        developer: developer.trim() || 'Custom',
        coverUrl,
        backgroundUrl,
        videoUrls,
        videoUrl: videoUrls[0] || '', // Fallback
        logoUrl: '',
        steamId: '',
        isSteam: false,
        execPath: execPath.trim(),
      };

      const existingGames = await storage.getCustomGames();
      await storage.saveCustomGames([...existingGames, newGame]);
      
      onGameAdded([newGame]);
      handleReset();
      onClose();
    } catch (err) {
      console.error('Failed to save game:', err);
      alert('Failed to save game. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // SCAN FOLDER LOGIC
  // ----------------------------------------------------
  const handleScanFolder = async () => {
    setIsScanning(true);
    setScannedGames([]);
    setSelectedScanned(new Set());
    
    try {
      const found = await api.scanFolder();
      setScannedGames(found);
      // Auto-select all by default
      setSelectedScanned(new Set(found.map(g => g.id)));
    } catch (err) {
      console.error('Scan failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedScanned);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedScanned(newSet);
  };

  const handleSaveScanned = async () => {
    if (selectedScanned.size === 0) return;
    setSaving(true);
    
    try {
      const gamesToAdd = scannedGames.filter(g => selectedScanned.has(g.id));
      const existingGames = await storage.getCustomGames();
      await storage.saveCustomGames([...existingGames, ...gamesToAdd]);
      
      onGameAdded(gamesToAdd);
      handleReset();
      onClose();
    } catch (err) {
      console.error('Failed to save scanned games:', err);
      alert('Error: ' + (err.message || err.toString()));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTitle(''); setDeveloper(''); setExecPath('');
    setCoverFile(null); setBackgroundFile(null);
    setCoverPreview(null); setBgPreview(null);
    setVideoPreviews([null, null, null]);
    setScannedGames([]); setSelectedScanned(new Set());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl mx-4 rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Gamepad2 size={24} />
            Add Game
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
          <button 
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'manual' ? 'text-white border-b-2 border-white' : 'text-white/50 hover:text-white/80'}`}
          >
            Manual Entry
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'scan' ? 'text-white border-b-2 border-white' : 'text-white/50 hover:text-white/80'}`}
          >
            Auto Scan Folder
          </button>
        </div>

        {/* =========================================================
            MANUAL ENTRY TAB
            ========================================================= */}
        {activeTab === 'manual' && (
          <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Game Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hollow Knight"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors" />
            </div>

            {/* Developer */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Developer</label>
              <input type="text" value={developer} onChange={(e) => setDeveloper(e.target.value)} placeholder="e.g. Team Cherry"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors" />
            </div>

            {/* Executable Path */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Executable Path (.exe)</label>
              <input type="text" value={execPath} onChange={(e) => setExecPath(e.target.value)} placeholder="e.g. C:\Games\MyGame\game.exe"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/40 font-mono text-sm" />
            </div>

            {/* Media */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Cover Art</label>
                {coverPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <button onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/50">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : <MediaUploader label="Upload Cover" accept="image/*" onFileSelect={handleCoverSelect} icon={Image} />}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Background</label>
                {bgPreview ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden">
                    <img src={bgPreview} alt="Background" className="w-full h-full object-cover" />
                    <button onClick={() => { setBackgroundFile(null); setBgPreview(null); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/50">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : <MediaUploader label="Upload Background" accept="image/*" onFileSelect={handleBgSelect} icon={Image} />}
              </div>
            </div>
            {/* Videos */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Videos (Playlist up to 3)</label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    {videoPreviews[index] ? (
                      <div className="relative w-full h-24 rounded-xl border border-white/20 bg-black overflow-hidden group flex items-center justify-center p-2">
                        <Film size={24} className="text-white/30" />
                        <span className="absolute bottom-1 right-2 text-[10px] text-white/50">{videoPreviews[index].split(/[\\/]/).pop()}</span>
                        <button onClick={() => handleRemoveVideo(index)} className="absolute top-1 right-1 p-1 rounded-full bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} className="text-white hover:text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24">
                        <MediaUploader label={`Video ${index + 1}`} accept="video/*" onFileSelect={(url) => handleVideoSelect(index, url)} icon={Film} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 font-medium">Cancel</button>
              <button onClick={handleSaveManual} disabled={!title.trim() || saving} className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Add Game'}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            AUTO SCAN TAB
            ========================================================= */}
        {activeTab === 'scan' && (
          <div className="space-y-6 animate-[fade-in_0.3s_ease-out] flex flex-col min-h-[350px]">
            <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
              <FolderSearch size={40} className="mx-auto text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Scan Game Directory</h3>
              <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
                Select a folder (e.g. Epic Games, local drives). We will scan for .exe files and automatically extract their icons for you!
              </p>
              <button 
                onClick={handleScanFolder}
                disabled={isScanning}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Select Folder to Scan'}
              </button>
            </div>

            {/* Scan Results */}
            {scannedGames.length > 0 && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Found {scannedGames.length} games</h4>
                  <button 
                    onClick={() => setSelectedScanned(selectedScanned.size === scannedGames.length ? new Set() : new Set(scannedGames.map(g=>g.id)))}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {selectedScanned.size === scannedGames.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {scannedGames.map(game => (
                    <div 
                      key={game.id} 
                      onClick={() => toggleSelect(game.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedScanned.has(game.id) ? 'bg-white/10 border-blue-500/50' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                    >
                      {selectedScanned.has(game.id) ? <CheckSquare size={18} className="text-blue-400" /> : <Square size={18} className="text-white/30" />}
                      {game.coverUrl ? (
                        <img src={game.coverUrl} className="w-10 h-10 object-contain rounded" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center">
                          <Gamepad2 size={16} className="text-white/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{game.title}</div>
                        <div className="text-[10px] text-white/40 truncate" title={game.execPath}>{game.execPath}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {scannedGames.length > 0 && (
              <div className="flex gap-4 mt-auto pt-4 border-t border-white/10">
                <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 font-medium">Cancel</button>
                <button onClick={handleSaveScanned} disabled={selectedScanned.size === 0 || saving} className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 disabled:opacity-40">
                  {saving ? 'Adding...' : `Add ${selectedScanned.size} Games`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

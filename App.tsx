import React, { useState } from 'react';
import { Calendar, Download, Settings2, Plus } from 'lucide-react';
import ThumbnailCanvas from './components/ThumbnailCanvas';
import { ThumbnailConfig } from './types';

// Expanded Palette
const COLOR_PRESETS = [
  '#EF4444', // Red (Default)
  '#F97316', // Orange
  '#FACC15', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
];

const App: React.FC = () => {
  // State
  const [date, setDate] = useState<Date>(new Date());
  const [downloadTrigger, setDownloadTrigger] = useState<number>(0);
  
  // Aesthetic State
  const [accentColor, setAccentColor] = useState<string>('#EF4444');
  const [fontScale, setFontScale] = useState<number>(1); // Default 100%

  const config: ThumbnailConfig = {
    date,
    primaryText: '',
    backgroundColor: '#000000',
    accentColor,
    fontScale
  };

  // Handlers
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.valueAsDate) {
      setDate(e.target.valueAsDate);
    }
  };

  const triggerDownload = () => {
    setDownloadTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-lg font-semibold tracking-tight">DailyStory<span className="text-gray-500 font-light">Gen</span></h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">Gallery</span>
            <span className="hover:text-white cursor-pointer transition-colors">Settings</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* Left Column: Canvas Preview */}
        <div className="lg:col-span-2 space-y-6 sticky top-24">
          <div className="relative group">
            <ThumbnailCanvas config={config} onDownloadTrigger={downloadTrigger} />
            <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>Format: 16:9 • 1920x1080px</p>
            <p>Engine: HTML5 Canvas</p>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-8 shadow-2xl">
          
          {/* Section: Date Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Calendar size={18} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Date Selection</h2>
            </div>
            <input 
              type="date" 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
              value={date.toISOString().split('T')[0]}
              onChange={handleDateChange}
            />
          </div>

          {/* Section: Appearance */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Settings2 size={18} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Appearance</h2>
            </div>
            
            {/* Color Picker */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Accent Color</label>
              <div className="grid grid-cols-7 gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button 
                      key={c}
                      onClick={() => setAccentColor(c)} 
                      className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-gray-900 transition-all ${accentColor === c ? 'ring-white scale-110' : 'ring-transparent hover:scale-105'}`} 
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  {/* Custom Color Input masked as a button */}
                  <label className={`relative w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-offset-gray-900 transition-all hover:scale-105 ${!COLOR_PRESETS.includes(accentColor) ? 'ring-white' : 'ring-transparent'}`}>
                    <input 
                      type="color" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <Plus size={14} className="text-gray-400" />
                  </label>
              </div>
            </div>

            {/* Scale Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <label className="text-xs text-gray-400">Size Scale</label>
                <span className="text-xs text-blue-400 font-mono">{Math.round(fontScale * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="1.0" 
                step="0.05"
                value={fontScale}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Main Action */}
          <div className="pt-4 border-t border-white/10">
            <button 
              onClick={triggerDownload}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg py-4 rounded-2xl shadow-lg shadow-blue-900/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              <Download className="group-hover:-translate-y-1 transition-transform" size={20} />
              Export Thumbnail
            </button>
             <p className="text-center text-xs text-gray-600 mt-4">
              Generated images are royalty-free.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
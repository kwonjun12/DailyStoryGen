import React, { useRef, useEffect, useCallback } from 'react';
import { ThumbnailConfig } from '../types';

interface ThumbnailCanvasProps {
  config: ThumbnailConfig;
  onDownloadTrigger?: number; // Change this value to trigger download
}

// Helper to convert hex to rgba for shadow glow
const hexToRgba = (hex: string, alpha: number) => {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
  }
  return hex; // Return original if not hex (fallback)
};

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({ config, onDownloadTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1920;
    const height = 1080;

    // Reset canvas
    canvas.width = width;
    canvas.height = height;

    // 1. Background
    // Create a subtle gradient based on black to give it depth (Apple style depth)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a1a'); // Dark gray
    gradient.addColorStop(0.5, '#000000'); // Pure black
    gradient.addColorStop(1, '#0f0f0f'); // Slightly lighter black
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Optional: Add a very subtle noise texture or vignette for "premium" feel
    // Vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width / 3, width / 2, height / 2, width);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 2. Text Configuration
    const year = config.date.getFullYear();
    const month = String(config.date.getMonth() + 1).padStart(2, '0');
    const day = String(config.date.getDate()).padStart(2, '0');
    
    // Format: YYYY.MM.DD.
    const dateString = `${year}.${month}.${day}`;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3. Draw Date (The Hero Element)
    const fontSize = 320 * config.fontScale;
    ctx.font = `900 ${fontSize}px 'Inter', sans-serif`;
    
    // Styling logic: Text should match accent color
    ctx.fillStyle = config.accentColor; 
    
    // Shadow for depth - matches accent color
    ctx.shadowColor = hexToRgba(config.accentColor, 0.4);
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    ctx.fillText(dateString, width / 2, height / 2);

    // Reset Shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

  }, [config]);

  useEffect(() => {
    draw();
    // Load font first to ensure canvas draws correctly
    document.fonts.ready.then(() => {
        draw();
    });
  }, [draw, config]);

  // Handle Download
  useEffect(() => {
    if (onDownloadTrigger && onDownloadTrigger > 0 && canvasRef.current) {
        const link = document.createElement('a');
        link.download = `thumbnail_${config.date.toISOString().split('T')[0]}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    }
  }, [onDownloadTrigger, config.date]);

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default ThumbnailCanvas;
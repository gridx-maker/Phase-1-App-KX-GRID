import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Upload, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const ImageUploadWithZoom = ({ 
  value, 
  onChange, 
  onRemove,
  label = "Upload Logo",
  className = "",
  previewSize = "w-32 h-32"
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tempImage, setTempImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setTempImage(reader.result);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      // Limit movement to reasonable bounds
      const limit = 100;
      setPosition({
        x: Math.max(-limit, Math.min(limit, newX)),
        y: Math.max(-limit, Math.min(limit, newY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ 
      x: touch.clientX - position.x, 
      y: touch.clientY - position.y 
    });
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      const limit = 100;
      setPosition({
        x: Math.max(-limit, Math.min(limit, newX)),
        y: Math.max(-limit, Math.min(limit, newY))
      });
    }
  };

  const applyAndSave = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Output size
      const outputSize = 256;
      canvas.width = outputSize;
      canvas.height = outputSize;
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, outputSize, outputSize);
      
      // Calculate scaled dimensions maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      let drawWidth, drawHeight;
      
      if (aspectRatio > 1) {
        // Wider than tall
        drawWidth = outputSize * zoom;
        drawHeight = (outputSize / aspectRatio) * zoom;
      } else {
        // Taller than wide
        drawHeight = outputSize * zoom;
        drawWidth = (outputSize * aspectRatio) * zoom;
      }
      
      // Center position with user offset
      const x = (outputSize - drawWidth) / 2 + position.x;
      const y = (outputSize - drawHeight) / 2 + position.y;
      
      // Draw image
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      
      // Convert to base64
      const result = canvas.toDataURL('image/png');
      onChange(result);
      setTempImage(null);
      setOriginalImage(null);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };
    
    img.src = originalImage;
  }, [originalImage, zoom, position, onChange]);

  const cancelEdit = () => {
    setTempImage(null);
    setOriginalImage(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Editing mode
  if (tempImage) {
    return (
      <div className={`space-y-4 ${className}`}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        <div className="grid grid-cols-2 gap-4">
          {/* Editor Panel */}
          <div>
            <p className="text-xs text-zinc-500 mb-2">Edit Logo</p>
            <div 
              ref={previewRef}
              className="w-40 h-40 rounded-lg bg-zinc-800 border-2 border-primary/50 overflow-hidden cursor-move relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: 'none' }}
              >
                <img 
                  src={originalImage} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                  draggable={false}
                />
              </div>
              {/* Center guide */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview */}
          <div>
            <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Dashboard Preview
            </p>
            <div className="bg-zinc-900 rounded-lg p-4 border border-white/10">
              {/* Simulated marquee item */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-20 h-14 rounded bg-white/5 flex items-center justify-center overflow-hidden">
                  <img 
                    src={originalImage} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`
                    }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 text-center">How it appears in marquee</p>
            </div>
          </div>
        </div>
        
        {/* Zoom controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              type="button"
            >
              <ZoomOut className="w-4 h-4 text-zinc-300" />
            </button>
            
            <div className="flex-1">
              <Slider
                value={[zoom]}
                onValueChange={(val) => setZoom(val[0])}
                min={0.5}
                max={2}
                step={0.05}
                className="w-full"
              />
            </div>
            
            <button 
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              type="button"
            >
              <ZoomIn className="w-4 h-4 text-zinc-300" />
            </button>
            
            <button 
              onClick={handleReset}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              type="button"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4 text-zinc-300" />
            </button>
          </div>
          
          <p className="text-xs text-zinc-500 text-center">
            Drag to reposition • Zoom: {Math.round(zoom * 100)}%
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={applyAndSave} 
            className="flex-1 btn-primary"
            type="button"
          >
            Apply
          </Button>
          <Button 
            onClick={cancelEdit} 
            variant="outline" 
            className="border-white/20 text-zinc-300"
            type="button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Display mode (with existing image or upload prompt)
  if (value) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24">
            <img 
              src={value} 
              alt="Logo" 
              className="w-24 h-24 object-contain rounded-lg bg-white/5 p-1"
            />
            {onRemove && (
              <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center hover:bg-accent/80"
                type="button"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <label className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-zinc-300 cursor-pointer hover:bg-white/20 transition-colors">
            Change Logo
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
        </div>
      </div>
    );
  }

  // Upload prompt
  return (
    <div className={className}>
      <label className="w-24 h-24 rounded-lg bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
        <Upload className="w-6 h-6 text-zinc-500 mb-1" />
        <span className="text-xs text-zinc-500">{label}</span>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </label>
    </div>
  );
};

export default ImageUploadWithZoom;

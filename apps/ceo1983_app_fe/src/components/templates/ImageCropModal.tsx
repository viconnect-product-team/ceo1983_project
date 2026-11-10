import React, { useState, useRef, useEffect, useCallback } from "react";
import { Scissors, ZoomIn, ZoomOut, RotateCw, Check, X, Move, Sparkles } from "lucide-react";

export type CropShape = "circle" | "square" | "arch" | "oval";

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  initialShape?: CropShape;
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  imageUrl,
  initialShape = "circle",
  title = "Cắt Ảnh Chuyên Nghiệp (Studio Crop)",
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [shape, setShape] = useState<CropShape>(initialShape);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShape(initialShape);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, initialShape, imageUrl]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    // Create offscreen canvas for output
    const outputCanvas = document.createElement("canvas");
    const outputSize = 600;
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, outputSize, outputSize);

    // Apply clipping path based on selected shape
    ctx.save();
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    } else if (shape === "oval") {
      ctx.beginPath();
      ctx.ellipse(outputSize / 2, outputSize / 2, outputSize / 2, outputSize * 0.4, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    } else if (shape === "arch") {
      ctx.beginPath();
      const r = outputSize / 2;
      ctx.arc(r, r * 0.7, r, Math.PI, 0, false);
      ctx.lineTo(outputSize, outputSize);
      ctx.lineTo(0, outputSize);
      ctx.closePath();
      ctx.clip();
    } else {
      // Square with slight rounded corners
      ctx.beginPath();
      const radius = 24;
      ctx.roundRect(0, 0, outputSize, outputSize, radius);
      ctx.closePath();
      ctx.clip();
    }

    // Translate to center and draw
    ctx.translate(outputSize / 2 + offset.x * (outputSize / 260), outputSize / 2 + offset.y * (outputSize / 260));
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const drawW = img.naturalWidth || 600;
    const drawH = img.naturalHeight || 600;
    const maxSide = Math.max(drawW, drawH);
    const scaleFactor = outputSize / maxSide;
    const finalW = drawW * scaleFactor;
    const finalH = drawH * scaleFactor;

    ctx.drawImage(img, -finalW / 2, -finalH / 2, finalW, finalH);
    ctx.restore();

    const dataUrl = outputCanvas.toDataURL("image/png");
    onCropComplete(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Scissors className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500">Kéo di chuyển và căn chỉnh khung ảnh theo ý muốn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Shape Picker */}
        <div className="flex items-center gap-2">
          {[
            { id: "circle", label: "Tròn Hoàng Gia 3D" },
            { id: "square", label: "Vuông 1:1" },
            { id: "arch", label: "Vòm Cung Heian" },
            { id: "oval", label: "Bầu Dục Luxury" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setShape(s.id as CropShape)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                shape === s.id
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Viewport Canvas Frame */}
        <div className="flex justify-center items-center py-2">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-[280px] h-[280px] bg-slate-950 relative overflow-hidden flex items-center justify-center cursor-move select-none rounded-2xl shadow-inner border-2 border-dashed border-amber-400/50"
          >
            {/* Guide Mask Overlay */}
            <div
              className={`absolute inset-0 pointer-events-none border-2 border-amber-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ${
                shape === "circle"
                  ? "rounded-full"
                  : shape === "oval"
                  ? "rounded-[45%]"
                  : shape === "arch"
                  ? "rounded-t-[140px] rounded-b-xl"
                  : "rounded-xl"
              }`}
            />

            {/* Draggable & Scalable Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop target"
              crossOrigin="anonymous"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                maxWidth: "none",
                maxHeight: "none",
                width: "240px",
                height: "auto",
              }}
              className="pointer-events-none select-none"
            />

            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white/80 pointer-events-none flex items-center gap-1">
              <Move className="size-3" />
              <span>Kéo để di chuyển</span>
            </div>
          </div>
        </div>

        {/* Controls: Zoom & Rotate */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3">
            <ZoomOut className="size-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer"
            />
            <ZoomIn className="size-4 text-slate-400 shrink-0" />
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleRotate}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="size-3.5" />
              <span>Xoay 90°</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
              }}
              className="text-xs text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              Đặt lại vị trí
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="size-4" />
            <span>Áp Dụng Ảnh Đã Cắt</span>
          </button>
        </div>
      </div>
    </div>
  );
}


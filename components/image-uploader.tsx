"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (imageDataUrl: string) => void;
  isAnalyzing: boolean;
}

export function ImageUploader({ onImageSelect, isAnalyzing }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 md:p-12 transition-all duration-300 cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload teeth image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              Drop your teeth image here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse from your device
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            <span>JPG, PNG, WebP supported</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="sr-only"
            aria-label="Select teeth image file"
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded teeth image preview"
              className="h-full w-full object-contain"
            />
          </div>
          {!isAnalyzing && (
            <button
              onClick={clearImage}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/80 text-background transition-colors hover:bg-foreground"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">Image uploaded</span>
            {!isAnalyzing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearImage}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Change image
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

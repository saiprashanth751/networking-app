import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
  label: string;
  multiple?: boolean;
  maxFiles?: number;
  onImagesChange: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  error?: string;
}

export function ImageUploader({
  label,
  multiple = false,
  maxFiles = 1,
  onImagesChange,
  existingImages = [],
  onRemoveExisting,
  error,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Image compression failed:', error);
      return file;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const totalFiles = files.length + existingImages.length + selectedFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setIsCompressing(true);

    try {
      const compressedFiles = await Promise.all(
        selectedFiles.map(file => compressImage(file))
      );

      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));

      setPreviews(prev => [...prev, ...newPreviews]);
      const newFiles = [...files, ...compressedFiles];
      setFiles(newFiles);
      onImagesChange(newFiles);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsCompressing(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);

    setPreviews(newPreviews);
    setFiles(newFiles);
    onImagesChange(newFiles);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (!droppedFiles.length) return;

    const totalFiles = files.length + existingImages.length + droppedFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setIsCompressing(true);

    try {
      const compressedFiles = await Promise.all(
        droppedFiles.map(file => compressImage(file))
      );

      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));

      setPreviews(prev => [...prev, ...newPreviews]);
      const newFiles = [...files, ...compressedFiles];
      setFiles(newFiles);
      onImagesChange(newFiles);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const totalImages = existingImages.length + previews.length;
  const canAddMore = totalImages < maxFiles;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative aspect-square group">
              <img
                src={url}
                alt={`Existing ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={`new-${index}`} className="relative aspect-square group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeNewImage(index)}
                className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center hover:border-neutral-600 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            disabled={isCompressing}
          />

          {isCompressing ? (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-neutral-500 animate-pulse" />
              <p className="text-sm text-neutral-500">Compressing images...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="h-8 w-8 mx-auto text-neutral-500" />
              <p className="text-sm text-neutral-400">
                Click or drag images here
              </p>
              <p className="text-xs text-neutral-600">
                {multiple ? `Up to ${maxFiles - totalImages} more` : '1 image'} • Max 5MB each
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
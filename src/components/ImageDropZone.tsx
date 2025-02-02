import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageDropZoneProps {
  onImageLoad: (image: HTMLImageElement) => void;
  label: string;
}

export const ImageDropZone: React.FC<ImageDropZoneProps> = ({ onImageLoad, label }) => {
  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const image = new Image();
          image.onload = () => onImageLoad(image);
          image.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageLoad]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.tiff']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className="relative w-full h-full min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 bg-black/20 backdrop-blur-sm transition-colors hover:border-gray-400"
    >
      <input {...getInputProps()} />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-center text-gray-300">
          {isDragActive ? 'Drop image here' : label}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Supports JPG, PNG, and TIFF
        </p>
      </div>
    </div>
  );
};
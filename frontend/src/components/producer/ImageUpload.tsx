'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { TrashIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface ImageFile {
  id?: string;
  file?: File;
  url: string;
  name: string;
  size?: number;
  is_main?: boolean;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 10,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Check if adding these files would exceed the limit
    if (images.length + acceptedFiles.length > maxImages) {
      setError(`Μπορείτε να ανεβάσετε μέχρι ${maxImages} φωτογραφίες`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Μερικά αρχεία είναι μεγαλύτερα από ${maxFileSize}MB`);
      return;
    }

    // Create preview URLs for new files
    const newImages: ImageFile[] = acceptedFiles.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      is_main: images.length === 0 && index === 0 // First image is main if no images exist
    }));

    onImagesChange([...images, ...newImages]);
  }, [images, maxImages, maxFileSize, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: disabled || uploading || images.length >= maxImages,
    multiple: true
  });

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    
    // Revoke object URL to prevent memory leaks
    if (imageToRemove.file) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    const newImages = images.filter((_, i) => i !== index);
    
    // If we removed the main image, make the first remaining image the main one
    if (imageToRemove.is_main && newImages.length > 0) {
      newImages[0] = { ...newImages[0], is_main: true };
    }
    
    onImagesChange(newImages);
  };

  const setMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_main: i === index
    }));
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          {isDragActive ? (
            <p className="text-green-600 font-medium">Αφήστε τις φωτογραφίες εδώ...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Σύρετε φωτογραφίες εδώ ή κάντε κλικ για επιλογή
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, WEBP μέχρι {maxFileSize}MB ({maxImages - images.length} ακόμα)
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={disabled}
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Επιλογή Αρχείων
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Φωτογραφίες Προϊόντος ({images.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                {/* Image */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />

                {/* Main Image Badge */}
                {image.is_main && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Κύρια
                    </span>
                  </div>
                )}

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <p className="text-xs truncate">{image.name}</p>
                  {image.size && (
                    <p className="text-xs opacity-75">
                      {(image.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  )}
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {!image.is_main && (
                      <button
                        type="button"
                        onClick={() => setMainImage(index)}
                        className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                        title="Ορισμός ως κύρια φωτογραφία"
                      >
                        <StarIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Διαγραφή φωτογραφίας"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <PhotoIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Συμβουλές για καλύτερες φωτογραφίες
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Χρησιμοποιήστε καλό φωτισμό και σαφείς εικόνες</li>
                  <li>Δείξτε το προϊόν από διαφορετικές γωνίες</li>
                  <li>Η πρώτη φωτογραφία θα είναι η κύρια στη λίστα</li>
                  <li>Προτιμήστε μέγεθος τουλάχιστον 800x800 pixels</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
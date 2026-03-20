import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, X, File, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { 
  uploadFile, 
  formatFileSize, 
  isImageType,
  getCategoryLabel,
  MEDIA_CATEGORIES,
  type MediaCategory 
} from '@/services/media-uploads.service';
import type { MediaUpload } from '@/types';

interface FilePreview {
  file: File;
  previewUrl?: string;
  category: MediaCategory | '';
  description: string;
}

export function MediaUploadCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FilePreview[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      // Create preview URL for images
      const previewUrl = isImageType(file.type) ? URL.createObjectURL(file) : undefined;
      
      newFiles.push({
        file,
        previewUrl,
        category: '',
        description: ''
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  // Remove file from list
  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Clean up preview URL
      if (newFiles[index].previewUrl) {
        URL.revokeObjectURL(newFiles[index].previewUrl!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Update file metadata
  const updateFileMetadata = (index: number, field: 'category' | 'description', value: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    // Validate all files have categories
    const filesWithoutCategory = files.filter(f => !f.category);
    if (filesWithoutCategory.length > 0) {
      setError('Please select a category for all files.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const uploadedFiles: MediaUpload[] = [];

      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const filePreview = files[i];
        setUploadProgress(prev => ({ ...prev, [filePreview.file.name]: 0 }));

        try {
          const uploaded = await uploadFile(
            filePreview.file,
            filePreview.category as MediaCategory,
            filePreview.description || undefined
          );
          uploadedFiles.push(uploaded);
          setUploadProgress(prev => ({ ...prev, [filePreview.file.name]: 100 }));
        } catch (err) {
          console.error(`Failed to upload ${filePreview.file.name}:`, err);
          setError(`Failed to upload ${filePreview.file.name}. Please try again.`);
          setUploading(false);
          return;
        }
      }

      // Clean up preview URLs
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });

      // Redirect to uploads list
      navigate('/media-uploads');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const canUpload = files.length > 0 && files.every(f => f.category) && !uploading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Files"
        subtitle="Upload images and files to the media library"
        actions={
          <Link to="/media-uploads">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to list
            </Button>
          </Link>
        }
      />

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* File Upload Area */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Select Files</h2>
          
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${files.length > 0 ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'}
            `}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileInputClick}
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-slate-500">
              Images, videos, PDFs, and other files up to 10MB each
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="border-t bg-slate-50">
            <div className="p-6">
              <h3 className="font-medium mb-4">Files to Upload ({files.length})</h3>
              <div className="space-y-4">
                {files.map((filePreview, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Preview */}
                      <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {filePreview.previewUrl ? (
                          <img 
                            src={filePreview.previewUrl} 
                            alt={filePreview.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <File className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{filePreview.file.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="neutral" className="text-xs">
                                {filePreview.file.type || 'Unknown'}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                {formatFileSize(filePreview.file.size)}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            disabled={uploading}
                            className="px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Upload Progress */}
                        {uploadProgress[filePreview.file.name] !== undefined && (
                          <div className="mt-2">
                            <div className="bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${uploadProgress[filePreview.file.name]}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Metadata Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={filePreview.category}
                              onChange={(e) => updateFileMetadata(index, 'category', e.target.value)}
                              disabled={uploading}
                            >
                              <option value="">Select category</option>
                              {MEDIA_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {getCategoryLabel(category)}
                                </option>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Description
                            </label>
                            <Input
                              placeholder="Optional description"
                              value={filePreview.description}
                              onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                              disabled={uploading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Actions */}
      {files.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600">
              {files.length} file{files.length !== 1 ? 's' : ''} ready to upload
            </p>
            <p className="text-xs text-slate-500">
              Total size: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!canUpload}
              loading={uploading}
            >
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

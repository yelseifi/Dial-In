'use client';
import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { uploadVideo } from '@/app/lib/s3'; // Adjust the import path as needed
import { useStytchToken } from '@/app/lib/useStytchToken';

const UploadVideoForm: React.FC<{ bountyId: string; claimId: string }> = ({ bountyId, claimId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{ url: string; key: string } | null>(null);
  const sessionToken = useStytchToken();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const result = await uploadVideo(selectedFile);
      // Log the video path after upload

      fetch('/api/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          videoUrl: result.url,
          key: result.key,
          bountyId: bountyId,
          claimId: claimId,
        }),
      });
      setUploadResult(result);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('video-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error uploading video:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label htmlFor="video-file" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Select Video:
          </label>
          <div className="mt-1 flex items-center">
            <label
              htmlFor="video-file"
              className="w-full cursor-pointer px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {selectedFile ? selectedFile.name : 'Choose File (no file selected)'}
            </label>
            <input
              type="file"
              id="video-file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </div>
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
        </div>
        {error && (
          <div className="text-sm rounded-md bg-red-50 dark:bg-red-900/30 p-3 text-red-600 dark:text-red-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={!selectedFile || uploading}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition ease-in-out duration-150
            ${!selectedFile || uploading
              ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow-md hover:shadow-lg'
            }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : 'Upload Video'}
        </button>
      </form>

      {uploadResult && (
        <>
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="font-bold text-green-700 dark:text-green-400">Upload Successful!</h3>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Video Preview:</h3>
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <ReactPlayer
                url={uploadResult.url}
                controls
                width="100%"
                height="100%"
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload'
                    }
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadVideoForm;
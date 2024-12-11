import React, { useState } from 'react';
import { X, Upload, Check, Loader } from 'lucide-react';

const AddDrawingModal = ({ isOpen, onClose, onSubmit }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    // 각 파일에 대한 초기 진행률 설정
    const initialProgress = {};
    files.forEach(file => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);

    // 파일 업로드 시뮬레이션
    for (const file of files) {
      // 각 파일당 진행률 업데이트 시뮬레이션
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // 업로드 완료 후 1초 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmit(files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">도면 추가</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!uploading ? (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.dwg,.dxf,.png,.jpg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    도면 파일을 드래그하거나 클릭하여 업로드하세요
                  </p>
                  <p className="text-sm text-gray-500">
                    지원 형식: PDF, DWG, DXF, PNG, JPG
                  </p>
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  선택된 파일 ({files.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Array.from(files).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm text-gray-600 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                disabled={files.length === 0}
              >
                업로드
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {files.map((file, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    {uploadProgress[file.name] === 100 ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDrawingModal;
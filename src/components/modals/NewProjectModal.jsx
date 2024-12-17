import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import axios from 'axios';

const NewProjectModal = ({ isOpen, onClose, onNext }) => {
  const [formData, setFormData] = useState({
    country: '',
    company: '',
    projectName: '',
    standard: '',
    uuid: '',
  });

  const formDataRef = useRef(formData);
  // useEffect로 value 업데이트 시 ref도 업데이트
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef(null);
  const fileId = useRef(0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchData = async () => {
    try {
      // 4. axios를 사용해 JSON으로 POST 요청
      const response = await axios.post("/api/project/create", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("응답:", response.data);
      const data = await response.data;
      setFormData({
        ...formData,
        ["uuid"]: response.data.uuid
      });
      console.log(formData);
    } catch (error) {
      console.error("에러:", error.response ? error.response.data : error.message);
      throw new Error('Failed to create project');
    }
  };

  // useEffect를 사용하여 컴포넌트 마운트 후 실행
  useEffect(() => {
    fetchData();
  }, []); // 빈 배열([])을 의존성으로 추가하여 마운트 후 한 번만 실행

  const handleFileChange1 = useCallback((e) => {
    let selectFiles = [];
    let tempFiles = files;
    if (e.type === "drop") {
        selectFiles = e.dataTransfer.files;
    }
    else {
        selectFiles = e.target.files;
    }

    for (const file of selectFiles) {
        tempFiles = [
            ...tempFiles,
            {
                id: fileId.current++,
                object: file
            }
        ];
        const formData = new FormData();
        formData.append('uploadFiles', file);
        axios.post('/api/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((Response) => {
            file.Response.data[0].uuid;
        });
    }
    //setFiles([...e.target.files]);
    setFiles(tempFiles);
  }, [files]);
  
  const handleFileChange = useCallback(async (e) => {
    let selectFiles = [];
    if (e.type === "drop") {
      selectFiles = e.dataTransfer.files;
    }
    else {
      selectFiles = e.target.files;
    }
    if (!selectFiles || selectFiles.length === 0) return;
  
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("projectUuid", formDataRef.current.uuid);
      Array.from(selectFiles).forEach((file) => {
        formDataUpload.append('uploadFiles', file);
      });
  
      const response = await axios.post('/api/files/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      // 응답으로 받은 파일 UUID 정보 저장
      const uploadedFileUuids = response.data.map(fileInfo => ({
        name: fileInfo.fileName,
        uuid: fileInfo.uuid
      }));
  
      // 기존 files 상태에 새로운 파일 UUID 추가
      setFiles(prevFiles => [...prevFiles, ...uploadedFileUuids]);
  
    } catch (error) {
      console.error('파일 업로드 중 오류 발생:', error);
      // 필요한 경우 사용자에게 오류 표시
    }
  }, [setFiles]);  // setFiles를 의존성 배열에 추가

  const handleFilterFile = useCallback((id) => {
    setFiles(files.filter((file) => file.id !== id));
  }, [files]);
  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
        setIsDragging(true);
    }
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e);
    setIsDragging(false);
  }, [handleFileChange]);

  const initDragEvents = useCallback(() => {
    if (dragRef.current !== null) {
        dragRef.current.addEventListener("dragenter", handleDragIn);
        dragRef.current.addEventListener("dragleave", handleDragOut);
        dragRef.current.addEventListener("dragover", handleDragOver);
        dragRef.current.addEventListener("drop", handleDrop);
    }
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);
  const resetDragEvents = useCallback(() => {
    if (dragRef.current !== null) {
        dragRef.current.removeEventListener("dragenter", handleDragIn);
        dragRef.current.removeEventListener("dragleave", handleDragOut);
        dragRef.current.removeEventListener("dragover", handleDragOver);
        dragRef.current.removeEventListener("drop", handleDrop);
    }
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  useEffect(() => {
    initDragEvents();

    return () => resetDragEvents();
  }, [initDragEvents, resetDragEvents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try{
      const formDataToSend = new FormData();
      
      // Append project data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // 2. FormData를 일반 객체로 변환
      const formDataToJson = {};
      formDataToSend.forEach((value, key) => {
        // Blob/File 객체를 제외하고는 그대로 저장
        if (value instanceof Blob) {
          formDataToJson[key] = value.name || "file";
        } else {
          formDataToJson[key] = value;
        }
      });

      formDataToJson["files"] = files;

      // 3. JSON으로 변환
      const jsonData = JSON.stringify(formDataToJson);

      // 4. axios를 사용해 JSON으로 POST 요청
      const response = await axios.post("/api/project/save", jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    
      console.log("응답:", response.data);
      onNext(response.data.project);
    } catch (error) {
      console.error('Error creating project:', error);
      // Here you might want to show an error message to the user
      throw new Error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit_old = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append project data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Append files
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/create-project', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      onNext(data.project);
    } catch (error) {
      console.error('Error creating project:', error);
      // Here you might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">새 프로젝트 생성</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  국가
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="UAE">UAE</option>
                  <option value="Korea">Korea</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회사
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="Saudi Aramco">Saudi Aramco</option>
                  <option value="ADNOC">ADNOC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트명
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="프로젝트 이름을 입력하세요"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  표준
                </label>
                <select
                  name="standard"
                  value={formData.standard}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="ISO">ISO</option>
                  <option value="ANSI/ISA">ANSI/ISA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  도면 수량
                </label>
                <input
                  type="number"
                  name="drawingCount"
                  value={formData.drawingCount}
                  onChange={handleChange}
                  min="1"
                  placeholder="도면 수량 입력"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도면 파일 업로드
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="drawing-upload"
              />
              <label
                htmlFor="drawing-upload"
                className={isDragging ? "cursor-crosshair" : "cursor-pointer flex flex-col items-center"}
                ref={dragRef}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">클릭하여 도면 파일을 선택하세요</p>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">선택된 파일: {files.length}개</p>
                <ul className="mt-1 text-sm text-gray-500">
                  {Array.from(files).map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading || !formData.projectName || files.length === 0}
            >
              {isLoading ? '생성 중...' : '프로젝트 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
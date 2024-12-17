
// Import necessary libraries
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProjectManagement = () => {
  const [project, setProject] = useState({
    uuid :"abcd-defg", 
    contry:"사우디아라비아", 
    company:"아람코", 
    standard:"ISO", 
    projectName:"테스트 프로젝트",
    drawingCount:10,
    plant :"FEEDSTOCK PREPARATION UNIT",
    files:[{uuid:"aaaa", fileName:"abcd.pdf", type:"application/pdf"}],
    drawings:[{uuid:"aaaa", name:"ABCD-001", thumbnail:"/api/files/view/2bf97c09-4c6b-41bc-bcd7-a94c101d2b17"
        , foundNodeCnt:30, foundRelationCnt:30, endYn:"N", "analyze date" : "2024-12-17"}]
   });
   const { projectId } = useParams();

  // Fetch data when the component loads
  useEffect(() => {
    //debugger;
    //alert({projectId});
     axios.get('/api/project/detail/{projectId}').then((response) => {
       setProject(response.data);
     });
  }, []);

  const formDataRef = useRef(project);

  // useEffect로 value 업데이트 시 ref도 업데이트
  useEffect(() => {
    formDataRef.current = project;
  }, [project]);

  // Delete file handler
  const deleteFile = async (fileUuid) => {
    try {
      await axios.delete(`/api/files/delete/${fileUuid}`);
      setProject({
        ...project,
        files: project.files.filter((file) => file.uuid !== fileUuid),
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
        fileName: fileInfo.fileName,
        uuid: fileInfo.uuid,
        type :fileInfo.fileName
      }));
      setProject({
        ...project,
        files: [...project.files, ...uploadedFileUuids],
      });

      // 기존 files 상태에 새로운 파일 UUID 추가
      setFiles(prevFiles => [...prevFiles, ...uploadedFileUuids]);
  
    } catch (error) {
      console.error('파일 업로드 중 오류 발생:', error);
      // 필요한 경우 사용자에게 오류 표시
    }
  }, [setFiles]);  // setFiles를 의존성 배열에 추가

  return (
    <div className="p-8">
      {/* General Information Section */}
      <div className="">
        <h2 className="text-2xl font-bold mb-4">프로젝트</h2>
        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* General Info */}
          <div className="col-span-8 bg-white border rounded p-4">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  국가
                </label>
                <select
                  name="country"
                  value={project.country}
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
                  value={project.company}
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
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로젝트명
              </label>
              <input
                type="text"
                name="projectName"
                value={project.projectName}
                onChange={handleChange}
                placeholder="프로젝트 이름을 입력하세요"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  표준
                </label>
                <select
                  name="standard"
                  value={project.standard}
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
                  value={project.drawingCount}
                  onChange={handleChange}
                  min="1"
                  placeholder="도면 수량 입력"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Files Section */}
          <div className="col-span-3 bg-white border rounded p-4 justify-center">

            <div className="mt-1">
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
              {project.files.map((file) => (
                <div
                  key={file.uuid}
                  className="flex justify-between items-center py-1 border-b last:border-b-0"
                >
                  <span className="truncate">{file.fileName}</span>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-600">{file.type}</span>
                    <button
                      onClick={() => deleteFile(file.uuid)}
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-span-1 rounded p-4 flex flex-col justify-center items-end">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mb-2">Save</button>
            <button className="bg-green-500 text-white px-4 py-2 rounded">Complete</button>
          </div>
        </div>
      </div>

      {/* Drawings Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Drawings</h2>
        <div className="grid grid-cols-3 gap-8">
          {project.drawings.map((drawing) => (
            <div
              key={drawing.uuid}
              className="border rounded-lg p-4 w-72 h-80 flex bg-white flex-col items-center justify-between shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-2">{drawing.name}</h4>
              <img
                src={drawing.thumbnail}
                alt={drawing.name}
                className="w-60 h-50 object-contain mb-2"
              />
              <div className="text-sm text-gray-600">
                <div>Analyze Date: {drawing['analyze date']}</div>
                <div className="mt-2">
                  <div>Node: {drawing.foundNodeCnt}</div>
                  <div>Relation: {drawing.foundRelationCnt}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;


// Import necessary libraries
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, Underline } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const ProjectManagement = () => {
  const [project, setProject] = useState({uuid:"",country:"",company:"",standard:"",projectName:"",drawingCount:0,files:[],drawings:[]});
  const [selectedRuns, setSelectedRuns] = useState({});
  const { projectId } = useParams();
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // 상태를 업데이트
    setProject((prev) => ({
      ...prev,
      [name]: value, // 입력된 필드 값 업데이트
    }));
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);
  

  // 프로젝트 정보 조회 함수
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`/api/project/detail/${projectId}`);
      response.data.projectName = response.data.name;
      setProject(response.data);

      // 추가 로직: drawings 데이터 초기화
      const initialRuns = {};
      response.data.drawings.forEach((drawing) => {
        if (drawing.runs.length > 0) {
          initialRuns[drawing.uuid] = drawing.runs[0];
        }
      });
      setSelectedRuns(initialRuns);
    } catch (error) {
      console.error("프로젝트 정보를 가져오는 중 오류 발생:", error);
      alert("프로젝트 정보를 불러오는 데 실패했습니다.");
    }
  };

  const handleDrawingClick = (drawing) => {
    navigate(`/unrecognized/0`); // run 분석 없는 이미지 활용?
  };

  const handleDrawingRunClick = (drawing, run) => {
    navigate(`/unrecognized/${run.uuid}`);
  };

  // Handle run click
  const handleRunClick = (drawingUUID, run) => {
    setSelectedRuns((prev) => ({
      ...prev,
      [drawingUUID]: run,
    }));
  };

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
  const [isDisabled, setIsDisabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef(null);

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
      setProject((prevProject) => ({
        ...prevProject,
        files: [...prevProject.files, ...uploadedFileUuids],
      }));

      // 기존 files 상태에 새로운 파일 UUID 추가
      setFiles(prevFiles => [...prevFiles, ...uploadedFileUuids]);
  
    } catch (error) {
      console.error('파일 업로드 중 오류 발생:', error);
      // 필요한 경우 사용자에게 오류 표시
    }
  }, [setFiles]);  // setFiles를 의존성 배열에 추가

  
  const handleProjectSave = async () => {
    setIsLoading(true);
    try {
      // API 호출
      const response = await axios.post("/api/project/save", project);

      // 성공 처리
      if (response.status === 200) {
        alert("프로젝트가 성공적으로 저장되었습니다!");
        // 저장 후 프로젝트 정보를 다시 조회
        await fetchProjectDetails();
      } else {
        alert("프로젝트 저장 중 문제가 발생했습니다.");
      }
    } catch (error) {
      // 에러 처리
      console.error("프로젝트 저장 오류:", error);
      alert("프로젝트 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">

      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">프로젝트 도면 관리</h1>
          <button className="px-6 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600" onClick={(e) => {
                            e.stopPropagation();
                            handleProjectSave();
                          }}
                          disabled={isLoading}>
                          {isLoading ? '저장 및 도면 생성 중...' : '저장'}
          </button>
        </div>
        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* General Info */}
          <div className="col-span-8 bg-white border rounded p-4">
            <div className="grid grid-cols-8 grid-rows-3 gap-4 mt-2">
              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1"> 국가 </label>
              </div>
              <div className="col-span-3">
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
              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회사
                </label>
              </div>
              <div className="col-span-3">
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
              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1"> 프로젝트명 </label>
              </div>
              <div className="col-span-7">
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

              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1"> 표준 </label>
              </div>
              <div className="col-span-3">
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

              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-sm font-medium text-gray-700 mb-1"> 도면 수량 </label>
              </div>
              <div className="col-span-3">
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
          <div className="col-span-4 bg-white border rounded p-4 justify-center">

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
                  <span className="truncate">{file.name}</span>
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
        </div>
      </div>

      {/* Drawings Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Drawing Information</h2>
        <div className="grid grid-cols-3 gap-8">
          {project.drawings.map((drawing) => (
            <div
              key={drawing.uuid}
              className="border rounded-lg p-4 w-110 h-90 flex flex-col justify-between shadow-sm hover:border-blue-500"
            >
              <div className="grid grid-cols-7 gap-8">
                <div className="col-span-2">
                  <h4 className="text-lg font-semibold mb-2 text-center">{drawing.name}</h4>
                  <br></br><br></br>
                  <button
                    className="px-4 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-200 disabled:cursor-not-allowed"
                    disabled={true}
                  >
                    모델실행
                  </button><br></br>
                  <button
                    className="px-4 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-200 disabled:cursor-not-allowed"
                    disabled={true}
                  >
                    도면삭제
                  </button><br></br>
                  <button
                    className="px-4 py-1 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-green-200 disabled:cursor-not-allowed"
                    disabled={true}
                  >
                    도면완료
                  </button>
                </div>
                <div className="col-span-5">
                  <img
                    src={'/api/files/view/'+drawing.thumnbnailUuid}
                    alt={drawing.name}
                    className="w-full h-45 object-contain cursor-pointer mb-2"
                    onClick={() => handleDrawingClick(drawing)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-8 flex flex-row justify-between mt-2">
                {/* Run List */}
                <div className="col-span-3 flex-1 border-r pr-2 overflow-y-auto max-h-24">
                  <h5 className="font-semibold mb-2">Run History</h5>
                  {drawing.runs.map((run) => (
                    <div
                      key={run.runUUID}
                      className={`cursor-pointer text-sm py-0 hover:text-blue-500 ${
                        selectedRuns[drawing.uuid]?.runUUID === run.runUUID ? 'text-blue-600 font-semibold' : ''
                      }`}
                      onClick={() => handleRunClick(drawing.uuid, run)}
                    >
                      {run.runDate}  &nbsp;&nbsp;&nbsp;
                      <button
                        className="px-4 py-1 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-green-200 disabled:cursor-not-allowed"
                        onClick={() => {
                          handleDrawingRunClick(drawing.uuid, run)
                        }}
                      >
                        수정
                      </button>
                    </div>
                  ))}
                </div>

                {/* Run Summary */}
                <div className="col-span-5 flex-1 pl-2">
                  <h5 className="font-semibold mb-2">Analysis Summary</h5>
                  {selectedRuns[drawing.uuid] ? (
                    <div className="text-sm">
                      <div>Model: {selectedRuns[drawing.uuid].modelName}</div>
                      <div>Instrument Found, Changed: {selectedRuns[drawing.uuid].instrumentFoundedCnt}, {selectedRuns[drawing.uuid].instrumentChangedCnt}</div>
                      <div>Pipe Found, Changed : {selectedRuns[drawing.uuid].pipeFoundedCnt}, {selectedRuns[drawing.uuid].pipeFoundedCnt}</div>
                      <div>validate graph : No</div>
                      <div>unuse pipe, node : ?, ?</div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">Select a run to view details</div>
                  )}
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

// Import necessary libraries
import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Upload, Underline } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { TiEdit } from "react-icons/ti";
import ThumbnailSelect from "../common/ThumbnailSelect";

const ProjectManagement = () => {
  const saveTimer = useRef(null);  // 여기에 추가
  const [project, setProject] = useState({
    uuid: "",
    country: "",
    company: "",
    standard: "",
    project_name: "",
    line_no_pattern: "",
    drawing_no_pattern: "",
    files: [],
    drawings: [],
  });
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

  const handleDrawingNoChange = (drawing_uuid, value) => {
    // project 상태 업데이트
    setProject(prevProject => {
      // drawings 배열에서 해당 uuid를 가진 도면을 찾아 drawingNo 업데이트
      const updatedDrawings = prevProject.drawings.map(drawing => {
        if (drawing.uuid === drawing_uuid) {
          return {
            ...drawing,
            drawingNo: value
          };
        }
        return drawing;
      });
  
      // 새로운 project 상태 반환
      return {
        ...prevProject,
        drawings: updatedDrawings
      };
    });
  
    // 디바운스 처리를 위한 타이머 설정
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    
    // 500ms 후에 저장 실행
    saveTimer.current = setTimeout(() => {
      handleProjectSave();
    }, 500);
  };
  
  const handleSheetNoChange = (drawing_uuid, value) => {
    // project 상태 업데이트
    setProject(prevProject => {
      // drawings 배열에서 해당 uuid를 가진 도면을 찾아 sheetNo 업데이트
      const updatedDrawings = prevProject.drawings.map(drawing => {
        if (drawing.uuid === drawing_uuid) {
          return {
            ...drawing,
            sheetNo: value
          };
        }
        return drawing;
      });
  
      // 새로운 project 상태 반환
      return {
        ...prevProject,
        drawings: updatedDrawings
      };
    });
  
    // 디바운스 처리를 위한 타이머 설정
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    
    // 500ms 후에 저장 실행
    saveTimer.current = setTimeout(() => {
      handleProjectSave();
    }, 500);
  };
  
  // 초기 데이터 로드
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // 프로젝트 정보 조회 함수
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`/api/project/detail/${projectId}`);
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
    console.log(drawing.uuid);
    navigate(`/unrecognized/${drawing.uuid}/0`); // run 분석 없는 이미지 활용?
  };

  const handleDrawingRunClick = (drawing, run) => {
    navigate(`/unrecognized/${drawing.uuid}/${run.uuid}`);
  };

  // Handle run click
  const handleRunClick = (drawing_uuid, run) => {
    setSelectedRuns((prev) => ({
      ...prev,
      [drawing_uuid]: run,
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
      console.error("Failed to delete file:", error);
    }
  };

  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef(null);

  const handleFileChange = useCallback(
    async (e) => {
      let selectFiles = [];
      if (e.type === "drop") {
        selectFiles = e.dataTransfer.files;
      } else {
        selectFiles = e.target.files;
      }
      if (!selectFiles || selectFiles.length === 0) return;

      try {
        const formDataUpload = new FormData();
        formDataUpload.append("projectUuid", formDataRef.current.uuid);
        Array.from(selectFiles).forEach((file) => {
          formDataUpload.append("uploadFiles", file);
        });

        const response = await axios.post("/api/files/upload", formDataUpload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // 응답으로 받은 파일 UUID 정보 저장
        const uploadedFileUuids = response.data.map((fileInfo) => ({
          fileName: fileInfo.fileName,
          uuid: fileInfo.uuid,
          type: fileInfo.fileName,
        }));
        setProject((prevProject) => ({
          ...prevProject,
          files: [...prevProject.files, ...uploadedFileUuids],
        }));

        // 기존 files 상태에 새로운 파일 UUID 추가
        setFiles((prevFiles) => [...prevFiles, ...uploadedFileUuids]);
      } catch (error) {
        console.error("파일 업로드 중 오류 발생:", error);
        // 필요한 경우 사용자에게 오류 표시
      }
    },
    [setFiles]
  ); // setFiles를 의존성 배열에 추가

  const handleProjectSave = async () => {
    setIsLoading(true);
    try {
      if(project.drawing_no_pattern === ""){
        alert("도면번호 유형을 선택해주세요");
        return;
      }
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
          <button
            className="px-6 py-2 bg-[#A294F9] text-white font-medium rounded hover:bg-[#7E60BF]"
            onClick={(e) => {
              e.stopPropagation();
              handleProjectSave();
            }}
            disabled={isLoading}
          >
            {isLoading ? "저장 및 도면 생성 중..." : "저장"}
          </button>
        </div>
        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* General Info */}
          <div className="col-span-8 bg-white border rounded p-4">
            <div className="grid grid-cols-12 grid-rows-3 gap-4 mt-2">
              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  {" "}
                  국가{" "}
                </label>
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
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  {" "}
                  표준{" "}
                </label>
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
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  회사
                </label>
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  name="company"
                  value={project.company}
                  onChange={handleChange}
                  placeholder="회사명"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  {" "}
                  라인넘버형{" "}
                </label>
              </div>
              <div className="col-span-7">
              <input
                  type="text"
                  name="line_no_pattern"
                  value={project.line_no_pattern}
                  onChange={handleChange}
                  placeholder="라인넘버 유형"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>


              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  {" "}
                  도면번호형{" "}
                </label>
              </div>
              <div className="col-span-3">
                <ThumbnailSelect
                  value={project.drawing_no_pattern}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  {" "}
                  프로젝트명{" "}
                </label>
              </div>
              <div className="col-span-7">
                <input
                  type="text"
                  name="project_name"
                  value={project.project_name}
                  onChange={handleChange}
                  placeholder="프로젝트 이름을 입력하세요"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>



              <div className="col-span-1 flex justify-end items-center">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  {" "}
                  최종수정일{" "}
                </label>
              </div>
              <div className="col-span-3">
                <p className="w-full border rounded-lg p-2 text-base font-semibold text-gray-700 inline-block">
                  {project.last_update_date}
                </p>
              </div>

            </div>
          </div>

          {/* Files Section */}
          <div className="col-span-4 bg-white border rounded p-4 justify-center">
            <div className="mt-1">
              <label className="block text-base font-semibold text-gray-700 mb-2">
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
                  className={
                    isDragging
                      ? "cursor-crosshair"
                      : "cursor-pointer flex flex-col items-center"
                  }
                  ref={dragRef}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    클릭하여 도면 파일을 선택하세요
                  </p>
                </label>
              </div>
              {project.files.map((file) => (
                <div
                  key={file.uuid}
                  className="flex justify-between items-center py-1 border-b last:border-b-0"
                >
                  <span className="truncate">{file.name}</span>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-600">
                      {file.type}
                    </span>
                    <button
                      onClick={() => deleteFile(file.uuid)}
                      className="bg-[#FFE1FF] text-white px-2 rounded hover:bg-[#FFB3FF]"
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
              className="border rounded-lg bg-white p-4 w-110 h-90 flex flex-col justify-between shadow-sm hover:border-[#A294F9]"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-center flex justify-end items-center space-x-1">
                  <input
                    type="text"
                    className="bg-transparent border-none w-32 text-right outline-none"
                    defaultValue={drawing.drawing_no}
                    maxLength={10}
                    onChange={(e) => handleDrawingNoChange(drawing.uuid, e.target.value)}
                  />
                  &nbsp;-&nbsp;
                  <input
                    type="text"
                    className="bg-transparent border-none w-12 text-left outline-none"
                    defaultValue={drawing.sheet_no}
                    maxLength={4}
                    onChange={(e) => handleSheetNoChange(drawing.uuid, e.target.value)}
                  />
                  <TiEdit />
                </h4>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-1 text-sm font-medium text-[#6A5ACD] border border-[#6A5ACD] rounded hover:border-[#7A6EDF] hover:bg-[#F0F0FF] disabled:border-[#CDC1FF] disabled:cursor-not-allowed"
                  >
                    모델실행
                  </button>
                  <button
                    className="px-4 py-1 text-sm font-medium text-[#7E60BF] border border-[#7E60BF] rounded hover:border-red-600 hover:bg-red-100 disabled:border-[#CDC1FF] disabled:cursor-not-allowed"
                  >
                    도면삭제
                  </button>
                  <button
                    className="px-4 py-1 text-sm font-medium text-[#A294F9] border border-[#A294F9] rounded hover:border-[#42A5F5] hover:bg-[#F0F8FF] disabled:border-[#CDC1FF] disabled:cursor-not-allowed"
                  >
                    도면완료
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-8">
                <div className="col-span-4">
                  <img
                    src={"/api/files/view/" + drawing.thumnbnail_uuid}
                    alt={drawing.drawing_no}
                    className="w-full h-auto object-contain cursor-pointer mb-2"
                    onClick={() => handleDrawingClick(drawing)}
                  />
                </div>

                <div className="col-span-3 flex">
                  <div className="grid grid-rows-2 flex flex-col justify-between mt-2">
                    {/* Run List */}
                    <div className="flex-1 border-b pb-2 overflow-y-auto">
                      <h5 className="font-semibold mb-2">Run History</h5>
                      {drawing.runs.map((run) => (
                        <div
                          key={run.runUUID}
                          className={`cursor-pointer text-sm py-0 hover:text-blue-500 ${
                            selectedRuns[drawing.uuid]?.runUUID === run.runUUID
                              ? "text-blue-600 font-semibold"
                              : ""
                          }`}
                          onClick={() => handleRunClick(drawing.uuid, run)}
                        >
                          {run.run_date} &nbsp;&nbsp;&nbsp;
                          <button
                            className="px-4 py-1 text-sm font-medium text-white bg-[#A294F9] rounded hover:bg-[#9283ef] disabled:bg-[#ccc] disabled:cursor-not-allowed"
                            onClick={() => {
                              handleDrawingRunClick(drawing.uuid, run);
                            }}
                          >
                            수정
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Run Summary */}
                    <div className="flex-1 pt-2">
                      <h5 className="font-semibold mb-2">Analysis Summary</h5>
                      {selectedRuns[drawing.uuid] ? (
                        <div className="text-sm">
                          <div>Model: {selectedRuns[drawing.uuid].model_name}</div>
                          <div>Inst Error Rate: {selectedRuns[drawing.uuid].bbox_changed_count} / {selectedRuns[drawing.uuid].bbox_found_count}</div>
                          <div>Pipe Error Rate: {selectedRuns[drawing.uuid].connect_changed_count} / {selectedRuns[drawing.uuid].connect_found_count}</div>
                          <div>Comp. Relation Verification: -</div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          Select a run to view details
                        </div>
                      )}
                    </div>
                  </div>
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

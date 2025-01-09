import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Upload } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { TiEdit } from "react-icons/ti";
import ThumbnailSelect from "../common/ThumbnailSelect";
import { LoadingSpinner } from "../common/LoadingSpinner.jsx";

// 초기 프로젝트 상태
const initialProjectState = {
  uuid: "",
  country: "",
  company: "",
  standard: "",
  project_name: "",
  line_no_pattern: "",
  drawing_no_pattern: "",
  files: [],
  drawings: [],
};

const ProjectManagement = () => {
  // 상태 관리
  const [project, setProject] = useState(initialProjectState);
  const [selectedRuns, setSelectedRuns] = useState({});
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Refs & Hooks
  const saveTimer = useRef(null);
  const formDataRef = useRef(project);
  const dragRef = useRef(null);
  const { projectId } = useParams();
  const navigate = useNavigate();

  // project 상태 변경 시 ref 업데이트
  useEffect(() => {
    formDataRef.current = project;
  }, [project]);

  // 프로젝트 정보 조회
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`/api/project/detail/${projectId}`);
      setProject(response.data);

      // 도면 실행 기록 초기화
      const initialRuns = {};
      response.data.drawings.forEach((drawing) => {
        if (drawing.runs.length > 0) {
          initialRuns[drawing.uuid] = drawing.runs[0];
        }
      });
      setSelectedRuns(initialRuns);
    } catch (error) {
      console.error("프로젝트 정보 조회 실패:", error);
      alert("프로젝트 정보를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // 이벤트 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  // 도면 번호 및 시트 번호 변경 핸들러
  const handleDrawingFieldChange = (drawing_uuid, field, value) => {
    setProject(prevProject => ({
      ...prevProject,
      drawings: prevProject.drawings.map(drawing =>
        drawing.uuid === drawing_uuid
          ? { ...drawing, [field]: value }
          : drawing
      )
    }));

    // 디바운스 처리
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(handleProjectSave, 500);
  };

  // 파일 업로드 핸들러
  const handleFileChange = useCallback(async (e) => {
    const selectFiles = e.type === "drop" ? e.dataTransfer.files : e.target.files;
    if (!selectFiles?.length) return;

    try {
      const formData = new FormData();
      formData.append("projectUuid", formDataRef.current.uuid);
      Array.from(selectFiles).forEach(file => {
        formData.append("uploadFiles", file);
      });

      const response = await axios.post("/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const uploadedFiles = response.data.map(fileInfo => ({
        fileName: fileInfo.fileName,
        uuid: fileInfo.uuid,
        type: fileInfo.fileName,
      }));

      setProject(prev => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles],
      }));
      setFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드에 실패했습니다.");
    }
  }, []);

  // 파일 삭제 핸들러
  const deleteFile = async (fileUuid) => {
    try {
      await axios.delete(`/api/files/delete/${fileUuid}`);
      setProject(prev => ({
        ...prev,
        files: prev.files.filter(file => file.uuid !== fileUuid),
      }));
    } catch (error) {
      console.error("파일 삭제 실패:", error);
      alert("파일 삭제에 실패했습니다.");
    }
  };
  // 네비게이션 핸들러
  const handleDrawingClick = (drawing) => {
    navigate(`/unrecognized/${drawing.uuid}/0`);
  };

  const handleDrawingRunClick = (drawing, run) => {
    navigate(`/unrecognized/${drawing.uuid}/${run.uuid}`);
  };

  // 실행 기록 선택 핸들러
  const handleRunClick = (drawing_uuid, run) => {
    setSelectedRuns(prev => ({
      ...prev,
      [drawing_uuid]: run,
    }));
  };

  // 프로젝트 저장 핸들러
  const handleProjectSave = async () => {
    if (!project.drawing_no_pattern) {
      alert("도면번호 유형을 선택해주세요");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post("/api/project/save", project);
      if (response.status === 200) {
        alert("프로젝트가 성공적으로 저장되었습니다!");
        await fetchProjectDetails();
      }
    } catch (error) {
      console.error("프로젝트 저장 실패:", error);
      alert("프로젝트 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
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
                  <option value="Italia">Italia</option>
                  <option value="Vetnam">Malaysian</option>
                  <option value="Malaysian">Vetnam</option>
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
        {isLoading && <LoadingSpinner />}

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
                    onChange={(e) =>
                      handleDrawingNoChange(drawing.uuid, e.target.value)
                    }
                  />
                  &nbsp;-&nbsp;
                  <input
                    type="text"
                    className="bg-transparent border-none w-12 text-left outline-none"
                    defaultValue={drawing.sheet_no}
                    maxLength={4}
                    onChange={(e) =>
                      handleSheetNoChange(drawing.uuid, e.target.value)
                    }
                  />
                  <TiEdit />
                </h4>
                <div className="flex space-x-2">
                  <button className="px-4 py-1 text-sm font-medium text-[#6A5ACD] border border-[#6A5ACD] rounded hover:border-[#7A6EDF] hover:bg-[#F0F0FF] disabled:border-[#CDC1FF] disabled:cursor-not-allowed">
                    모델실행
                  </button>
                  <button className="px-4 py-1 text-sm font-medium text-[#7E60BF] border border-[#7E60BF] rounded hover:border-red-600 hover:bg-red-100 disabled:border-[#CDC1FF] disabled:cursor-not-allowed">
                    도면삭제
                  </button>
                  <button className="px-4 py-1 text-sm font-medium text-[#A294F9] border border-[#A294F9] rounded hover:border-[#42A5F5] hover:bg-[#F0F8FF] disabled:border-[#CDC1FF] disabled:cursor-not-allowed">
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
                          className={`cursor-pointer text-sm py-0 hover:text-blue-500 ${selectedRuns[drawing.uuid]?.runUUID === run.runUUID
                            ? "text-blue-600 font-semibold"
                            : ""
                            }`}
                          onClick={() => handleRunClick(drawing.uuid, run)}
                        >
                          {run.run_date} &nbsp;&nbsp;&nbsp;
                          <button
                            className="px-2 py-0 mt-1 text-sm font-medium text-white bg-[#A294F9] rounded hover:bg-[#9283ef] disabled:bg-[#ccc] disabled:cursor-not-allowed"
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
                          <div>
                            Model: {selectedRuns[drawing.uuid].model_name}
                          </div>
                          <div>
                            Inst Error Rate:{" "}
                            {selectedRuns[drawing.uuid].bbox_changed_count} /{" "}
                            {selectedRuns[drawing.uuid].bbox_found_count}
                          </div>
                          <div>
                            Pipe Error Rate:{" "}
                            {selectedRuns[drawing.uuid].connect_changed_count} /{" "}
                            {selectedRuns[drawing.uuid].connect_found_count}
                          </div>
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

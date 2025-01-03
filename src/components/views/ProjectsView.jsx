import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProjectsView = ({ setSelectedProject }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    projectName: "",
    standard: "",
    company: "",
    country: "",
  });

  const [projects, setProjects] = useState(
    JSON.parse(localStorage.getItem("searchData")) || []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const changeProjectName = (projectName1, projectId) => {
    setSelectedProject(`${projectName1}`);
  };

  const handleNavigateToResults = (projectId, projectName1) => {
    setSelectedProject(`${projectName1}`);
    navigate(`/results/${projectId}`);
  };

  const handleNavigateToDetail = (projectId, projectName1) => {
    setSelectedProject(`${projectName1}`);
    navigate(`/projectmanage/${projectId}`);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/project/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []); // Ensure data is always an array
      localStorage.setItem("searchData", JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]); // Set empty array on error
    }
  };

  const handleNewProject = async () => {
    try {
      const response = await fetch("/api/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      handleNavigateToDetail(data.uuid);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="p-8 bg-white-100">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">프로젝트 관리</h1>
      </div>

      {/* 조회조건 영역 */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3 flex items-center">
            <label
              className="font-medium w-28 pl-8 pr-2"
              style={{ minWidth: "120px", textAlign: "right" }}
            >
              국가
            </label>
            <select
              name="country"
              value={filters.country}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">선택하세요</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="UAE">UAE</option>
              <option value="Korea">Korea</option>
            </select>
          </div>
          <div className="col-span-3 flex items-center">
            <label
              className="font-medium w-28 pl-8 pr-2"
              style={{ minWidth: "120px", textAlign: "right" }}
            >
              표준
            </label>
            <select
              name="standard"
              value={filters.standard}
              onChange={handleInputChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">선택하세요</option>
              <option value="ISO">ISO</option>
              <option value="ANSI/ISA">ANSI/ISA</option>
            </select>
          </div>
          <div className="col-span-3 flex items-center">
            <label
              className="font-medium w-28 pl-8 pr-2"
              style={{ minWidth: "120px", textAlign: "right" }}
            >
              회사
            </label>
            <input
              type="text"
              name="company"
              value={filters.company}
              onChange={handleInputChange}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-3 flex justify-end space-x-2">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-[#A294F9] text-white font-medium rounded hover:bg-[#7E60BF]"
            >
              조회
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNewProject();
              }}
              className="px-6 py-2 bg-[#A294F9] text-white font-medium rounded hover:bg-[#7E60BF]"
            >
              신규
            </button>
          </div>
          <div className="col-span-9 flex items-center">
            <label
              className="font-medium w-28 pl-8"
              style={{ minWidth: "120px" }}
            >
              프로젝트명
            </label>
            <input
              type="text"
              name="projectName"
              value={filters.projectName}
              onChange={handleInputChange}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {/* 프로젝트 목록 영역 */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">프로젝트 목록</h2>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2 text-center">
                프로젝트명
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                회사
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                국가
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                표준
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                진행률
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                최종 수정일시
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(projects) &&
              projects.map((project) => (
                <tr
                  key={project.projectUuid || project.uuid}
                  className="hover:bg-gray-100"
                >
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {project.project_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {project.company}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {project.country}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {project.standard}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {project.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {project.last_update_date}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="px-3 py-1 bg-[#E4B1F0] text-white rounded hover:bg-[#7E60BF]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToDetail(
                            project.uuid || project.projectUuid,
                            project.name
                          );
                          changeProjectName(
                            project.project_name,
                            project.projectId
                          );
                        }}
                      >
                        상세
                      </button>
                      <button
                        className="px-3 py-1 bg-[#E4B1F0] text-white rounded hover:bg-[#7E60BF]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToResults(
                            project.uuid || project.projectUuid,
                            project.name
                          );
                        }}
                      >
                        결과
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsView;

import React, { useState } from "react";

import { Plus, Search, Filter, ArrowUpRight, Edit2, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const NewProjectModal = dynamic(() => import('../modals/NewProjectModal'), { ssr: false });
const AddDrawingModal = dynamic(() => import('../modals/AddDrawingModal'), { ssr: false });

import { useNavigate } from 'react-router-dom';
const ProjectsView = ({ setSelectedProject }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    projectName: "",
    standard: "",
    company: "",
    country: "",
  });

  const [projects, setProjects] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  const changeProjectName = (projectName1, projectId) => {
    setSelectedProject(`${projectName1}`);
  }
  const handleNavigateToResults = (projectId, projectName1) => {
    setSelectedProject(`${projectName1}`);
    navigate(`/results/${projectId}`);
  };

  const handleNavigateToDetail = (projectId, projectName1) => {
    setSelectedProject(`${projectName1}`);
    navigate(`/projectmanage/${projectId}`);
  };

  const handleSearch = async () => {
    const response = await fetch("/api/project/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });
    const data = await response.json();
    setProjects(data);
  };

  const handleNewProject = async () => {
    const response = await fetch("/api/project/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    });
    const data = await response.json();
    handleNavigateToDetail(data.uuid);
  };
  
  return (
    <div className="p-8 bg-white-100 /*min-h-screen*/">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">프로젝트 관리</h1>
        <button className="px-6 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600" onClick={(e) => {
                          e.stopPropagation();
                          handleNewProject();
                        }}>
          프로젝트 추가
        </button>
      </div>

      {/* 조회조건 영역 */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* 첫 번째 줄: 표준, 회사, 국가 */}
          <div className="col-span-3 flex items-center">
            <label
              className="font-medium w-28 pl-8 pr-2"
              style={{ minWidth: "120px" , textAlign: "right"}}
            >
              표준
            </label>
            <input
              type="text"
              name="standard"
              value={filters.standard}
              onChange={handleInputChange}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-3 flex items-center">
            <label
              className="font-medium w-28 pl-8 pr-2"
              style={{ minWidth: "120px" , textAlign: "right"}}
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
          <div className="col-span-3 flex items-center">
            <label
              className="font-medium w-28 pl-8 pr-2"
              style={{ minWidth: "120px" , textAlign: "right" }}
            >
              국가
            </label>
            <input
              type="text"
              name="country"
              value={filters.country}
              onChange={handleInputChange}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* 조회 버튼 */}
          <div className="col-span-3 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600"
            >
              조회
            </button>
          </div>

          {/* 두 번째 줄: 프로젝트명 */}
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
                최종 수정일
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.projectUuid} className="hover:bg-gray-100" onClick={() => changeProjectName(project.name, project.projectId)}>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {project.name}
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
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {project.lastUpdateDate}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex justify-end space-x-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToDetail(project.uuid, project.name);
                        }}>
                      상세
                    </button>
                    <button className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600" onClick={(e) => {
                          e.stopPropagation();
                          handleNavigateToResults(project.uuid, project.name);
                        }}>
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

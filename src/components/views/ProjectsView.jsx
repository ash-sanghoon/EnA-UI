import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpRight } from 'lucide-react';
import NewProjectModal from '../modals/NewProjectModal';
import AddDrawingModal from '../modals/AddDrawingModal';

const ProjectsView = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showAddDrawingModal, setShowAddDrawingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectData, setProjectData] = useState(null);

  const projects = [
    {
      id: 1,
      name: 'Ras Tanura Refinery',
      company: 'Saudi Aramco',
      country: 'Saudi Arabia',
      standard: 'ISO',
      status: 'active',
      progress: 75,
      lastUpdated: '2024-03-11'
    },
    {
      id: 2,
      name: 'Ruwais Refinery',
      company: 'ADNOC',
      country: 'UAE',
      standard: 'ANSI/ISA',
      status: 'active',
      progress: 45,
      lastUpdated: '2024-03-10'
    }
  ];

  const handleNewProject = (data) => {
    setProjectData(data);
    setShowNewProjectModal(false);
    setShowAddDrawingModal(true);
  };

  const handleAddDrawing = (project) => {
    setSelectedProject(project);
    setShowAddDrawingModal(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-semibold">프로젝트 관리</h1>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          새 프로젝트
        </button>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="프로젝트 검색..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로젝트명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회사
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  국가
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  표준
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  진행률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최종 수정일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{project.company}</td>
                  <td className="px-6 py-4 text-gray-500">{project.country}</td>
                  <td className="px-6 py-4 text-gray-500">{project.standard}</td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 text-gray-500">{project.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleAddDrawing(project)}
                      className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                      도면 추가
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="px-3 py-1.5 text-purple-600 border border-purple-600 text-sm rounded-lg hover:bg-purple-50"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onNext={handleNewProject}
      />
      <AddDrawingModal
        isOpen={showAddDrawingModal}
        onClose={() => setShowAddDrawingModal(false)}
        onSubmit={(files) => {
          console.log('Adding drawings to project:', selectedProject?.name);
          console.log('Files:', files);
          setShowAddDrawingModal(false);
        }}
      />
    </div>
  );
};

export default ProjectsView;
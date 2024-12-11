import React, { useState } from 'react';
import { X } from 'lucide-react';

const NewProjectModal = ({ isOpen, onClose, onNext }) => {
  const [formData, setFormData] = useState({
    country: '',
    company: '',
    projectName: '',
    standard: '',
    drawingCount: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
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

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-2"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              다음
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
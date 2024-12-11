// src/components/views/UnrecognizedView.jsx
import React, { useState } from 'react';
import { Move, BoxSelect, Edit2, Trash2, Save, Undo, Redo } from 'lucide-react';

const UnrecognizedView = () => {
  const [selectedTool, setSelectedTool] = useState('move');
  const [selectedNode, setSelectedNode] = useState(null);

  const tools = [
    { id: 'move', icon: <Move />, label: '이동' },
    { id: 'bbox', icon: <BoxSelect />, label: 'BBox 생성' },
    { id: 'edit', icon: <Edit2 />, label: '편집' },
    { id: 'delete', icon: <Trash2 />, label: '삭제' }
  ];

  return (
    <div className="h-screen flex">
      {/* Toolbar */}
      <div className="w-16 border-r bg-gray-50">
        <div className="py-4 space-y-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`w-full p-3 flex flex-col items-center ${
                selectedTool === tool.id ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedTool(tool.id)}
            >
              {tool.icon}
              <span className="text-xs mt-1">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Action Bar */}
        <div className="h-16 border-b bg-white px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Undo className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Redo className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <span className="text-sm text-gray-500">마지막 저장: 5분 전</span>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center">
            <Save className="w-4 h-4 mr-2" />
            변경사항 저장
          </button>
        </div>

        {/* Graph Area */}
        <div className="flex-1 bg-gray-50 p-6">
          <div className="h-full bg-white rounded-lg border flex items-center justify-center">
            {/* 그래프 편집 영역 */}
            <div className="text-gray-500">그래프 편집 영역</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 border-l bg-white">
        <div className="p-4 border-b">
          <h2 className="font-medium">노드 속성</h2>
        </div>
        
        {selectedNode ? (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">심볼 타입</label>
              <select className="w-full border rounded-lg p-2">
                <option>Valve</option>
                <option>Pump</option>
                <option>Vessel</option>
                <option>Instrument</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Tag Number</label>
              <input 
                type="text" 
                className="w-full border rounded-lg p-2"
                placeholder="Enter tag number"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Description</label>
              <textarea 
                className="w-full border rounded-lg p-2"
                rows="3"
                placeholder="Enter description"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 text-gray-500 text-center">
            노드를 선택하여 속성을 편집하세요
          </div>
        )}
      </div>
    </div>
  );
};

export default UnrecognizedView;
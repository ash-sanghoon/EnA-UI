import React, { useState } from 'react';
import { Plus, Minus, Edit2, Save, Hand } from 'lucide-react';
import GraphVisualization from "./GraphVisualization.js";

const UnrecognizedView = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="h-screen flex">
      {/* 좌측 도구 메뉴 */}
      <div className="w-16 bg-purple-600 p-4 flex flex-col items-center space-y-4">
        <button className="p-2 text-white hover:bg-purple-700 rounded">
          <Plus className="w-5 h-5" />
        </button>
        <button className="p-2 text-white hover:bg-purple-700 rounded">
          <Minus className="w-5 h-5" />
        </button>
        <button className="p-2 text-white hover:bg-purple-700 rounded">
          <Edit2 className="w-5 h-5" />
        </button>
        <button className="p-2 text-white hover:bg-purple-700 rounded">
          <Save className="w-5 h-5" />
        </button>
        <button className="p-2 text-white hover:bg-purple-700 rounded">
          <Hand className="w-5 h-5" />
        </button>
      </div>

      {/* 메인 캔버스 영역 */}
      <div className="flex-1 relative bg-gray-50">
        <div className="absolute top-6 left-6 right-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">미인식 개체 태깅</h1>
            <div className="flex items-center space-x-2">
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                onClick={() => {/* 저장 로직 */}}
              >
                변경사항 저장
              </button>
            </div>
          </div>
        </div>
        
        {/* P&ID 도면 영역 */}
        <div className="absolute inset-0 m-20">
          {/* 여기에 도면과 심볼들이 표시됨 */}
          <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <GraphVisualization></GraphVisualization>
          </div>
        </div>
      </div>

      {/* 우측 속성 패널 */}
      <div className="w-80 bg-white border-l p-6">
        <h2 className="text-lg font-medium mb-4">속성</h2>
        {selectedSymbol ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">심볼 타입</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>Control Valve</option>
                <option>Pump</option>
                <option>Vessel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">태그 번호</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="CV-101"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500">선택된 심볼이 없습니다</p>
        )}
      </div>
    </div>
  );
};

export default UnrecognizedView;
import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Share, Download } from 'lucide-react';
import Dependencies from "./Dependencies.js";
import { useParams } from 'react-router-dom';

const ResultsView = () => {
  const [activeTab, setActiveTab] = useState('graph');
  const { projectId } = useParams();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex justify-between items-center">
          <div className="grid grid-cols-12 gap-4 items-stretch">
            <div className="col-span-7">
              <h1 className="text-2xl font-semibold">공정 설계도 분석 결과</h1>
            </div>
            <div className="col-span-5 flex items-end">
              <p className="text-gray-500">도면 ID: PID-2024-001</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center">
              <Share className="w-4 h-4 mr-2" />
              공유
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mt-6">
          {['Graph', 'Symbol Stats', 'Process Analysis', 'Dependencies', 'Similar Drawings', 'Referenced Drawings'].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === tab.toLowerCase()
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">최종 생성 그래프</h2>
              <div className="aspect-video bg-gray-50 rounded border">
                {/* 그래프 시각화 영역 */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  그래프 시각화
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'symbol stats' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">심볼 통계</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Control Valve</span>
                <span className="font-medium">23개</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>Pump</span>
                <span className="font-medium">15개</span>
              </div>
              {/* 추가 심볼 통계 */}
            </div>
          </div>
        )}

        {activeTab === 'process analysis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">AI 프로세스 분석</h2>
              <div className="prose max-w-none">
                <p>이 P&ID는 열교환 공정을 나타내며, 주요 특징은 다음과 같습니다:</p>
                <ul>
                  <li>3단계 열교환 시스템</li>
                  <li>이중 안전 밸브 구성</li>
                  <li>자동 압력 조절 시스템</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">예상 병목 구간</h2>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800">Pump Station 2</h3>
                  <p className="text-sm text-yellow-600 mt-1">
                    단일 펌프 구성으로 인한 잠재적 병목 구간
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dependencies' && (
          <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-1">
            <Dependencies projectId={projectId} drawingId=""></Dependencies>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
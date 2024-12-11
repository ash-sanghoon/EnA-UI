import React, { useState, useEffect } from 'react';
import { Loader, Check, AlertCircle, ChevronRight } from 'lucide-react';

const ProcessingModal = ({ onClose, onComplete }) => {
  const [steps, setSteps] = useState([
    {
      id: 'pdf-conversion',
      label: 'PDF 변환',
      status: 'processing',
      detail: 'PDF 파일을 이미지로 변환 중...',
      progress: 0
    },
    {
      id: 'bbox-detection',
      label: 'BBox 인식',
      status: 'waiting',
      detail: '심볼 영역 검출 대기 중',
      progress: 0
    },
    {
      id: 'symbol-classification',
      label: '심볼 분류',
      status: 'waiting',
      detail: '분류 대기 중',
      progress: 0
    },
    {
      id: 'graph-generation',
      label: '그래프 생성',
      status: 'waiting',
      detail: '생성 대기 중',
      progress: 0
    }
  ]);

  // 처리 진행 상황 시뮬레이션
  useEffect(() => {
    const timer = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        const processingStep = newSteps.find(step => step.status === 'processing');
        
        if (processingStep) {
          if (processingStep.progress < 100) {
            processingStep.progress += 20;
            if (processingStep.progress >= 100) {
              processingStep.status = 'completed';
              processingStep.detail = '완료됨';
              
              const nextStep = newSteps.find(step => step.status === 'waiting');
              if (nextStep) {
                nextStep.status = 'processing';
                nextStep.detail = `${nextStep.label} 처리 중...`;
              }
            }
          }
        }
        return newSteps;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-[800px]">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">도면 처리 중</h2>
          <p className="text-sm text-gray-500 mt-1">process-flow-diagram.pdf</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview Area */}
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border mb-6">
            <div className="text-center">
              <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">도면 처리 중...</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="relative">
                <div className="flex items-center mb-2">
                  {/* Status Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    step.status === 'completed' ? 'bg-green-100' :
                    step.status === 'processing' ? 'bg-purple-100' :
                    step.status === 'error' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {step.status === 'completed' && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {step.status === 'processing' && (
                      <Loader className="w-4 h-4 text-purple-600 animate-spin" />
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{step.label}</span>
                      <span className="text-sm text-gray-500">{step.progress}%</span>
                    </div>
                    <p className="text-sm text-gray-500">{step.detail}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 rounded-full ml-11">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'processing' ? 'bg-purple-500' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="text-sm text-gray-500">
            예상 소요 시간: 2-3분
          </div>
          {steps.every(step => step.status === 'completed') && (
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
              onClick={onComplete}
            >
              결과 확인
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export {ProcessingModal };
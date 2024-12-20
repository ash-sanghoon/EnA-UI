import React, { useState, useRef, useEffect } from "react";
import {
  Save,
  Trash2,
  Waypoints,
  Eye,
  EyeOff,
  PenTool,
  Sun,
} from "lucide-react";
import GraphVisualization from "./GraphVisualization.js";
import { BiShapeSquare } from "react-icons/bi";
import { useParams } from 'react-router-dom';

const UnrecognizedView = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectTool, setSelectTool] = useState("hand");
  const [visible, setVisible] = useState(true);
  const [bright, setBright] = useState(0.8);
  const [brightnessOpen, setBrightnessOpen] = useState(false);
  const sliderRef = useRef(null);
  const {drawingId, runId} = useParams();

  // 외부 클릭 감지 핸들러
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        setBrightnessOpen(false); // 슬라이더 닫기
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  
  return (
    <div className="h-screen flex position-relative">
      {/* 좌측 도구 메뉴 */}
      <div className="w-16 bg-purple-600 p-4 flex flex-col items-center space-y-4 z-50">
        <button
          className="p-2 text-white hover:bg-purple-700 rounded"
          onClick={() => setSelectTool("save")}
        >
          <Save className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-white hover:bg-purple-700 rounded"
          onClick={() => setSelectTool("drawing")}
        >
          <BiShapeSquare className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-white hover:bg-purple-700 rounded"
          onClick={() => setSelectTool("connecting")}
          style={{
            opacity: selectedSymbol && !selectedEdge ? 1 : 0.5,
            pointerEvents: selectedSymbol && !selectedEdge ? "auto" : "none",
          }}
        >
          <Waypoints className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-white hover:bg-purple-700 rounded"
          onClick={() => setSelectTool("joint")}
        >
          <PenTool className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-white hover:bg-purple-700 rounded"
          style={{
            opacity: selectedSymbol ? 1 : 0.5,
            pointerEvents: selectedSymbol ? "auto" : "none",
          }}
          onClick={() => setSelectTool("remove")}
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            className="p-2 text-white hover:bg-purple-700 rounded"
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 전파 방지
              setBrightnessOpen(!brightnessOpen);
            }}
          >
            <Sun className="w-5 h-5" />
          </button>
          {/* 밝기 슬라이더 */}
          {brightnessOpen && (
            <div
              ref={sliderRef}
              className="absolute top-[-50px] left-[60px] bg-white shadow-md p-2 rounded-md"
              style={{ width: "40px", height: "150px" }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={bright}
                onChange={(e) => setBright(parseFloat(e.target.value))}
                className="w-full h-full transform rotate-180"
                style={{ writingMode: "vertical-rl" }} // 수직 슬라이더
              />
            </div>
          )}
        </div>
        <button
          className="p-2 text-white hover:bg-purple-700 rounded"
          onClick={() => {
            setSelectTool(visible ? "invisible" : "visible");
            setVisible(!visible);
          }}
        >
          {visible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 메인 캔버스 영역 */}
      <div className="flex-1 relative bg-gray-50">
        <div className="absolute top-6 left-6 right-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">미인식 개체 태깅</h1>
          </div>
        </div>

        {/* P&ID 도면 영역 */}
        <div className="absolute inset-0 m-20">
          <div className="flex justify-center">
            <GraphVisualization
              selectTool={selectTool}
              setSelectTool={setSelectTool}
              setSelectedSymbol={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
              bright={bright}
              setSelectedEdge={setSelectedEdge}
              selectedEdge={selectedEdge}
              runId={runId}
              drawingId={drawingId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnrecognizedView;

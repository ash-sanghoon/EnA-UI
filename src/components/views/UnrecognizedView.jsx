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
import { LuSquareDashed } from "react-icons/lu";
import data from "./data.js";

const UnrecognizedView = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectTool, setSelectTool] = useState("hand");
  const [visible, setVisible] = useState(true);
  const [bright, setBright] = useState(0.8);
  const [opacity, setOpacity] = useState(0.6);
  const [brightnessOpen, setBrightnessOpen] = useState(false);
  const [opacityOpen, setOpacityOpen] = useState(false);
  const sliderRef = useRef(null);
  const opacitySliderRef = useRef(null);
  const [hoverClass, setHoverClass] = useState(null);

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
  // 외부 클릭 감지 핸들러
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        opacitySliderRef.current &&
        !opacitySliderRef.current.contains(event.target)
      ) {
        setOpacityOpen(false); // 슬라이더 닫기
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
              if (opacityOpen) setOpacityOpen(false);
            }}
          >
            <Sun
              className="w-5 h-5"
              style={{
                color: `rgb(${255 * (0.5 + bright * 0.5)}, ${
                  255 * (0.5 + bright * 0.5)
                }, ${255 * (0.5 + bright * 0.5)})`, // 밝기 조절
              }}
            />
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
                style={{ writingMode: "vertical-rl", cursor: "pointer" }} // 수직 슬라이더
              />
            </div>
          )}
        </div>
        <div className="relative">
          <button
            className="p-2 text-white hover:bg-purple-700 rounded"
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 전파 방지
              setOpacityOpen(!opacityOpen);
              if (brightnessOpen) setBrightnessOpen(false);
            }}
          >
            <LuSquareDashed className="w-5 h-5" />
          </button>
          {/* 투명도 슬라이더 */}
          {opacityOpen && (
            <div
              ref={opacitySliderRef}
              className="absolute top-[-50px] left-[60px] bg-white shadow-md p-2 rounded-md"
              style={{ width: "40px", height: "150px" }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => {
                  setOpacity(parseFloat(e.target.value));
                }}
                className="w-full h-full transform rotate-180"
                style={{ writingMode: "vertical-rl", cursor: "pointer" }} // 수직 슬라이더
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
              nodeOpacity={opacity}
              hoverClass={hoverClass}
            />
          </div>
        </div>
      </div>

      <div className="w-64 border-l border-gray-200 space-y-0 z-50">
        <h2 className="text-lg font-semibold p-1 border-b border-gray-200">
          클래스 목록
        </h2>
        <ul className="">
          {data.nodes.map((node) => (
            <li
              key={node.name}
              className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-200 p-1.5"
              onMouseOver={() => setHoverClass(node.name)}
            >
              <span>{node.properties.label}</span>
              <span className="bg-purple-400 text-white px-2 rounded-full">
                {node.properties.data}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UnrecognizedView;

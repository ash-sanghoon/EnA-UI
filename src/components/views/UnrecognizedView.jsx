import React, { useState, useRef, useEffect } from "react";
import {
  Save,
  Trash2,
  Waypoints,
  Eye,
  EyeOff,
  PenTool,
  Sun,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import GraphVisualization from "./GraphVisualization.js";
import { BiShapeSquare } from "react-icons/bi";
import { LuSquareDashed } from "react-icons/lu";
import { useParams } from "react-router-dom";
import axios from "axios";
import data from "./data.js";

const UnrecognizedView = () => {
  // 기본 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectTool, setSelectTool] = useState("hand");
  const [visible, setVisible] = useState(true);
  const [bright, setBright] = useState(0.8);
  const [opacity, setOpacity] = useState(0.7);
  const [brightnessOpen, setBrightnessOpen] = useState(false);
  const [opacityOpen, setOpacityOpen] = useState(false);
  const sliderRef = useRef(null);
  const opacitySliderRef = useRef(null);
  const [hoverClass, setHoverClass] = useState(null);
  const [graphData, setGraphData] = useState(JSON.parse(JSON.stringify(data)));
  const [imgURL, setImgURL] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { drawingId, runId } = useParams();

  // 패널 리사이징을 위한 상태
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    fetchProjectDetails();
  }, [imgURL]);

  // 도면인식 정보 조회 함수
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `/api/drawing/run_detail/${drawingId}/${runId}`
      );
      setGraphData(response.data);
      setImgURL(`/api/files/view/${response.data.drawing.drawingUuid}`);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  // 밝기 슬라이더 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        setBrightnessOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // 투명도 슬라이더 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        opacitySliderRef.current &&
        !opacitySliderRef.current.contains(event.target)
      ) {
        setOpacityOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // 패널 리사이징 이벤트 핸들러
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      // 최소 200px, 최대 600px로 제한
      const newWidth = Math.min(
        Math.max(window.innerWidth - e.clientX, 150),
        600
      );

      setRightPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // 패널 리사이징 시작 핸들러
  const startResizing = () => {
    setIsResizing(true);
  };

  return (
    <div className="h-screen flex position-relative">
      {/* 좌측 도구 메뉴 */}
      <div className="w-16 bg-purple-600 p-4 flex flex-col items-center space-y-4 z-50">
        <button
          className={"p-2 text-white hover:bg-purple-700 rounded"}
          onClick={() => setSelectTool(selectTool === "save" ? "" : "save")}
        >
          <Save className="w-5 h-5" />
        </button>
        <button
          className={`p-2 text-white hover:bg-purple-700 rounded ${
            selectTool === "drawing" ? "bg-purple-700" : ""
          }`}
          onClick={() =>
            setSelectTool(selectTool === "drawing" ? "" : "drawing")
          }
        >
          <BiShapeSquare className="w-5 h-5" />
        </button>
        <button
          className={`p-2 text-white hover:bg-purple-700 rounded ${
            selectTool === "connecting" ? "bg-purple-700" : ""
          }`}
          onClick={() =>
            setSelectTool(selectTool === "connecting" ? "" : "connecting")
          }
          style={{
            opacity: selectedSymbol && !selectedEdge ? 1 : 0.5,
            pointerEvents: selectedSymbol && !selectedEdge ? "auto" : "none",
          }}
        >
          <Waypoints className="w-5 h-5" />
        </button>
        <button
          className={`p-2 text-white hover:bg-purple-700 rounded ${
            selectTool === "joint" ? "bg-purple-700" : ""
          }`}
          onClick={() => setSelectTool(selectTool === "joint" ? "" : "joint")}
        >
          <PenTool className="w-5 h-5" />
        </button>
        <button
          className={`p-2 text-white hover:bg-purple-700 rounded ${
            selectTool === "remove" ? "bg-purple-700" : ""
          }`}
          style={{
            opacity: selectedSymbol ? 1 : 0.5,
            pointerEvents: selectedSymbol ? "auto" : "none",
          }}
          onClick={() => setSelectTool(selectTool === "remove" ? "" : "remove")}
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <div className="relative">
          <button
            className={`p-2 text-white hover:bg-purple-700 rounded ${
              brightnessOpen ? "bg-purple-700" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setBrightnessOpen(!brightnessOpen);
              if (opacityOpen) setOpacityOpen(false);
            }}
          >
            <Sun
              className="w-5 h-5"
              style={{
                color: `rgb(${255 * (0.5 + bright * 0.5)}, ${
                  255 * (0.5 + bright * 0.5)
                }, ${255 * (0.5 + bright * 0.5)})`,
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
                style={{ writingMode: "vertical-rl", cursor: "pointer" }}
              />
            </div>
          )}
        </div>
        <div className="relative">
          <button
            className={`p-2 text-white hover:bg-purple-700 rounded ${
              opacityOpen ? "bg-purple-700" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
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
                style={{ writingMode: "vertical-rl", cursor: "pointer" }}
              />
            </div>
          )}
        </div>
        <button
          className={`p-2 text-white hover:bg-purple-700 rounded`}
          onClick={() => {
            setSelectTool(selectTool === "visible" ? "" : "visible");
            setVisible(!visible);
          }}
        >
          {visible ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
        <button
          className={`p-2 text-white hover:bg-purple-700 rounded ${
            selectTool === "undo" ? "bg-purple-700" : ""
          }`}
          onClick={() => setSelectTool(selectTool === "undo" ? "" : "undo")}
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          className={`p-2 text-white hover:bg-purple-700 rounded ${
            selectTool === "redo" ? "bg-purple-700" : ""
          }`}
          onClick={() => setSelectTool(selectTool === "redo" ? "" : "redo")}
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UnrecognizedView;

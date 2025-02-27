import React, { useState, useRef, useEffect } from "react";
import {
  Save, Trash2, Waypoints, Eye, EyeOff,
  Sun, Undo2, Redo2, Loader2
} from "lucide-react";
import { BiShapeSquare } from "react-icons/bi";
import { LuSquareDashed } from "react-icons/lu";
import { useParams } from "react-router-dom";
import GraphVisualization from "./GraphVisualization.js";
import data from "./data.js";

const UnrecognizedView = () => {
  // 기본 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectTool, setSelectTool] = useState("hand");
  const [visible, setVisible] = useState(true);
  const [bright, setBright] = useState(0.8);
  const [opacity, setOpacity] = useState(0.7);
  const [brightnessOpen, setBrightnessOpen] = useState(false);
  const [opacityOpen, setOpacityOpen] = useState(false);
  const [isShowClassList, setIsShowClassList] = useState(true);
  const [hoverClass, setHoverClass] = useState(null);
  const [graphData, setGraphData] = useState(JSON.parse(JSON.stringify(data)));
  const [imgURL, setImgURL] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 히스토리 관리
  const [history, setHistory] = useState([{ action: "action", data: "data" }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 패널 리사이징 상태
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  // Refs
  const sliderRef = useRef(null);
  const opacitySliderRef = useRef(null);
  const { drawingId, runId } = useParams();

  // 초기 데이터 로드
  useEffect(() => {
    fetchProjectDetails();
  }, [imgURL]);

  // API 데이터 조회
  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/drawing/run_detail/${drawingId}/${runId}`);
      const data = await response.json();
      setImgURL(`/api/files/view/${data.drawing.drawingUuid}`);
      setGraphData(data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
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
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 투명도 슬라이더 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (opacitySliderRef.current && !opacitySliderRef.current.contains(event.target)) {
        setOpacityOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 패널 리사이징 이벤트 처리
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 150), 600);
      setRightPanelWidth(newWidth);
    };

    const handleMouseUp = () => setIsResizing(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // 실행 취소/다시 실행 처리
  const handleUndo = () => currentIndex > 0 && setCurrentIndex(prev => prev - 1);
  const handleRedo = () => currentIndex < history.length - 1 && setCurrentIndex(prev => prev + 1);
  const isUndoDisabled = currentIndex <= 0;
  const isRedoDisabled = currentIndex >= history.length - 1;

  // 클래스 목록 계산
  const calculateClassCount = () => {
    if (isShowClassList) {
      return Object.keys(graphData.nodes.reduce((acc, node) => {
        const pureName = node.properties.label.replace(/_\d+$/, "");
        acc[pureName] = (acc[pureName] || 0) + 1;
        return acc;
      }, {})).length;
    }

    const lineNoSet = new Set();
    graphData.nodes.forEach(node => {
      if (node.properties?.line_no) lineNoSet.add(node.properties.line_no);
    });
    graphData.edges.forEach(edge => {
      if (edge.properties?.line_no) lineNoSet.add(edge.properties.line_no);
    });
    return lineNoSet.size - 1;
  };

  return (
    <div className="h-screen flex position-relative">
      {/* 좌측 도구 메뉴 */}
      <div className="w-16 bg-purple-600 p-4 flex flex-col items-center space-y-4 z-50">
        <button className="p-2 text-white hover:bg-purple-700 rounded"
          onClick={() => console.log("save")}>
          <Save className="w-5 h-5" />
        </button>

        {/* 도형 그리기 도구 */}
        <button className={`p-2 text-white hover:bg-purple-700 rounded ${selectTool === "drawing" ? "bg-purple-700" : ""}`}
          onClick={() => setSelectTool(selectTool === "drawing" ? "" : "drawing")}>
          <BiShapeSquare className="w-5 h-5" />
        </button>

        {/* 연결 도구 */}
        <button className={`p-2 text-white hover:bg-purple-700 rounded ${selectTool === "connecting" ? "bg-purple-700" : ""}`}
          onClick={() => setSelectTool(selectTool === "connecting" ? "" : "connecting")}
          style={{
            opacity: selectedSymbol && !selectedEdge ? 1 : 0.5,
            pointerEvents: selectedSymbol && !selectedEdge ? "auto" : "none",
          }}>
          <Waypoints className="w-5 h-5" />
        </button>

        {/* 삭제 도구 */}
        <button className={`p-2 text-white hover:bg-purple-700 rounded`}
          style={{
            opacity: selectedSymbol ? 1 : 0.5,
            pointerEvents: selectedSymbol ? "auto" : "none",
          }}
          onClick={() => setSelectTool("remove")}>
          <Trash2 className="w-5 h-5" />
        </button>

        {/* 밝기 조절 */}
        <div className="relative">
          <button className={`p-2 text-white hover:bg-purple-700 rounded ${brightnessOpen ? "bg-purple-700" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setBrightnessOpen(!brightnessOpen);
              if (opacityOpen) setOpacityOpen(false);
            }}>
            <Sun className="w-5 h-5"
              style={{
                color: `rgb(${255 * (0.5 + bright * 0.5)}, ${255 * (0.5 + bright * 0.5)}, ${255 * (0.5 + bright * 0.5)})`,
              }} />
          </button>
          {brightnessOpen && (
            <div ref={sliderRef}
              className="absolute top-[-50px] left-[60px] bg-white shadow-md p-2 rounded-md"
              style={{ width: "40px", height: "150px" }}>
              <input type="range"
                min="0"
                max="1"
                step="0.01"
                value={bright}
                onChange={(e) => setBright(parseFloat(e.target.value))}
                className="w-full h-full transform rotate-180"
                style={{ writingMode: "vertical-rl", cursor: "pointer" }} />
            </div>
          )}
        </div>

        {/* 투명도 조절 */}
        <div className="relative">
          <button className={`p-2 text-white hover:bg-purple-700 rounded ${opacityOpen ? "bg-purple-700" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpacityOpen(!opacityOpen);
              if (brightnessOpen) setBrightnessOpen(false);
            }}>
            <LuSquareDashed className="w-5 h-5" />
          </button>
          {opacityOpen && (
            <div ref={opacitySliderRef}
              className="absolute top-[-50px] left-[60px] bg-white shadow-md p-2 rounded-md"
              style={{ width: "40px", height: "150px" }}>
              <input type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full h-full transform rotate-180"
                style={{ writingMode: "vertical-rl", cursor: "pointer" }} />
            </div>
          )}
        </div>

        {/* 보기/숨기기 전환 */}
        <button className={`p-2 text-white hover:bg-purple-700 rounded`}
          onClick={() => {
            setSelectTool(selectTool === "visible" ? "" : "visible");
            setVisible(!visible);
          }}>
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>

        {/* 실행 취소/다시 실행 */}
        <button className={`p-2 rounded ${isUndoDisabled ? "text-gray-400" : "text-white hover:bg-purple-700"}`}
          onClick={handleUndo}
          disabled={isUndoDisabled}>
          <Undo2 className="w-5 h-5" />
        </button>
        <button className={`p-2 rounded ${isRedoDisabled ? "text-gray-400" : "text-white hover:bg-purple-700"}`}
          onClick={handleRedo}
          disabled={isRedoDisabled}>
          <Redo2 className="w-5 h-5" />
        </button>
      </div>

      {/* 메인 캔버스 영역 */}
      <div className="flex-1 relative bg-gray-50">
        {/* 상단 헤더 */}
        <div className="absolute top-6 left-6 right-6">
          <div className="flex justify-between items-center relative">
            <h1 className="text-2xl font-semibold">미인식 개체 태깅</h1>
            {isSaving && (
              <div className="absolute top-[-20px] right-[-15px] flex items-center gap-1 px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">
                  {graphData?.nodes[0]?.properties?.label.includes("loading") ? "로딩 중..." : "저장 중..."}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* P&ID 도면 영역 */}
        <div className="absolute inset-0 m-20">
          <div className="flex justify-center relative">
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
              graphData={graphData}
              setGraphData={setGraphData}
              imgURL={imgURL}
              setIsSaving={setIsSaving}
              history={history}
              setHistory={setHistory}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
            />
          </div>
        </div>
      </div>

      {/* 우측 패널 */}
      <div style={{ width: `${rightPanelWidth}px`, position: "relative" }}
        className="border-l border-gray-200 space-y-0 z-50 overflow-y-auto">
        {/* 리사이징 핸들 */}
        <div className="absolute left-0 top-0 w-1 h-full cursor-ew-resize hover:bg-purple-400 transition-colors"
          style={{ transform: "translateX(-50%)" }}
          onMouseDown={() => setIsResizing(true)} />

        {/* 패널 헤더 */}
        <h2 className="text-lg font-semibold p-1 border-b border-gray-200 flex justify-start items-center">
          {isShowClassList ? "클래스 목록" : "line_no 목록"}
          <span className="text-sm text-gray-500 ml-2">
            ({calculateClassCount()})
          </span>

          <button
            type="button"
            className="ml-auto p-1 text-sm text-gray-500 hover:bg-gray-200 transition-colors"
            onClick={() => setIsShowClassList(!isShowClassList)}
          >
            {isShowClassList ? "line_no" : "Class"}
          </button>
        </h2>

        {/* 클래스/라인 목록 */}
        <ul className="max-h-[calc(100vh-10rem)] overflow-auto"
          onMouseLeave={() => setHoverClass(null)}>
          {isShowClassList
            ? Object.entries(
              graphData.nodes.reduce((acc, { properties: { label } }) => {
                acc[label] = (acc[label] || 0) + 1;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .map(([name, count]) => (
                <li key={name}
                  className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-200 p-1.5"
                  onMouseOver={() => setHoverClass(name)}>
                  <span className="truncate max-w-[calc(100%-3.5rem)]" title={name}>
                    {name}
                  </span>
                  <span className="bg-purple-400 text-white px-2 rounded-full">
                    {count}
                  </span>
                </li>
              ))
            : Object.entries(
              [...graphData.nodes, ...graphData.edges].reduce((acc, { properties }) => {
                if (properties?.line_no) {
                  acc[properties.line_no] = (acc[properties.line_no] || 0) + 1;
                }
                return acc;
              }, {})
            )
              .filter(([line_no]) => line_no !== "null" && line_no !== null)
              .sort(([a], [b]) => a - b)
              .map(([line_no, count]) => (
                <li key={line_no}
                  className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-200 p-1.5"
                  onMouseOver={() => setHoverClass(line_no)}>
                  <span className="truncate max-w-[calc(100%-3.5rem)]" title={line_no}>
                    {line_no}
                  </span>
                  <span className="bg-purple-400 text-white px-2 rounded-full">
                    {count}
                  </span>
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
};

export default UnrecognizedView;
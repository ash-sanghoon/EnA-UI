import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as d3 from "d3";
import LabelSelectorPopup from "../modals/ClassEditModal";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import _ from "lodash";

const GraphVisualization = ({
  selectTool,
  setSelectTool,
  setSelectedSymbol,
  selectedEdge,
  setSelectedEdge,
  bright,
  nodeOpacity,
  hoverClass,
  graphData,
  setGraphData,
  imgURL,
  setIsSaving,
  history,
  setHistory,
  currentIndex,
  setCurrentIndex,
  initState,
}) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [target, setTarget] = useState(null);
  const [target2, setTarget2] = useState(null);
  const [rectangle, setRectangle] = useState(null);
  const [isLabelPopupOpen, setIsLabelPopupOpen] = useState(false);
  const svgRef = useRef(null);
  const isFirstRender = useRef(true);
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [saveData, setSaveData] = useState({ kind: "", name: "", action: "" });
  const [pendingSaveData, setPendingSaveData] = useState(null);
  const draggedNodeRef = useRef(null);
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
  });
  const memoizedEdges = useMemo(() => graphData.edges, [graphData.edges]);

  useEffect(() => {
    if (initState) {
      setGraphData(_.cloneDeep(initState));
    }
  }, [initState]);

  useEffect(() => {
    console.log(history);
    console.log(currentIndex);
    if (history.length > 0) {
      if (currentIndex === 0 && initState) {
        setGraphData(initState);
      } else {
        handleHistoryChange(history, currentIndex);
      }
    }
  }, [currentIndex]);

  // handleHistoryChange 함수 수정
  const handleHistoryChange = (history, currentIndex) => {
    const currentAction = history[currentIndex];
    if (!currentAction) return;

    const { action, data } = currentAction;
    if (!action || data === undefined) return;

    setGraphData((prevData) => {
      const isNode = "position" in data;
      const targetArray = isNode ? "nodes" : "edges";

      let newData = { ...prevData };

      switch (action) {
        case "upd": {
          newData[targetArray] = prevData[targetArray].map((item) =>
            item.name === data.name ? { ...data } : item
          );
          break;
        }

        case "del": {
          newData[targetArray] = [...prevData[targetArray], data];
          break;
        }

        case "add": {
          newData[targetArray] = prevData[targetArray].filter(
            (item) => item.name !== data.name
          );
          break;
        }
      }

      return newData;
    });
  };

  useEffect(() => {
    if (pendingSaveData && !isPanning) {
      setSaveData(pendingSaveData);
      setPendingSaveData(null);
    }
  }, [pendingSaveData]);

  const prevGraphDataRef = useRef([graphData]);

  useEffect(() => {
    const save = async () => {
      const requestData = {
        push: saveData,
        origin: graphData,
      };
      console.log(saveData.action, saveData.data, graphData);

      // 히스토리 업데이트 로직
      setHistory((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const newHistoryItem = _.cloneDeep({
          action: saveData.action,
          data: saveData.data,
        });

        // currentIndex가 마지막이 아닌 경우의 처리
        let updatedHistory =
          currentIndex < safePrev.length - 1
            ? [...safePrev.slice(0, currentIndex + 1), newHistoryItem]
            : [...safePrev, newHistoryItem];

        // 중복 제거 로직
        const seen = new Set();
        const uniqueHistory = updatedHistory.filter((item) => {
          if (!item.action || !item.data) return false;

          const key = JSON.stringify({ action: item.action, data: item.data });
          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        });

        // currentIndex 조정이 필요한 경우
        if (uniqueHistory.length !== updatedHistory.length) {
          setTimeout(() => {
            setCurrentIndex(Math.min(currentIndex, uniqueHistory.length - 1));
          }, 0);
        }

        return uniqueHistory;
      });

      setCurrentIndex((prev) => prev + 1);

      try {
        setIsSaving(true);
        const response = await axios.post(
          "/api/drawing/run_update",
          requestData
        );
        console.log("Save successful:", response.data);
      } catch (error) {
        console.error("Error saving data:", error);
      } finally {
        setIsSaving(false);
      }
    };

    // 첫 렌더링 체크
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevGraphDataRef.current = _.cloneDeep(graphData);
      return;
    }

    // 깊은 복사본으로 비교
    const isGraphDataChanged = !_.isEqual(
      _.cloneDeep(prevGraphDataRef.current),
      _.cloneDeep(graphData)
    );

    if (isGraphDataChanged) {
      save();
      prevGraphDataRef.current = _.cloneDeep(graphData);
    }
  }, [saveData]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    if (hoverClass !== null) {
      // hoverClass와 일치하는 노드 찾기
      const matchingNodes = graphData.nodes.filter(
        (node) => node.properties.label === hoverClass
      );
      const matchingNodeNames = matchingNodes.map((node) => node.name);

      // 노드 투명도 업데이트
      svg
        .selectAll(".node")
        .transition()
        .duration(100)
        .attr("opacity", (d) =>
          matchingNodeNames.includes(d.name) ? nodeOpacity : 0.2
        );

      // 원 투명도 업데이트
      svg
        .selectAll("circle")
        .transition()
        .duration(100)
        .attr("opacity", (d) => (matchingNodeNames.includes(d.name) ? 1 : 0.2));

      // 노드 텍스트 레이블 투명도 업데이트 (hover-label 제외)
      svg
        .selectAll("text:not(.hover-label)")
        .transition()
        .duration(100)
        .style("opacity", (d) =>
          matchingNodeNames.includes(d.name) ? 1 : 0.2
        );

      // 엣지 투명도 업데이트
      svg
        .selectAll(".edge-group")
        .transition()
        .duration(100)
        .style("opacity", (d) =>
          matchingNodeNames.includes(d.source) ||
          matchingNodeNames.includes(d.target)
            ? 1
            : 0.2
        );

      // 배경 이미지 밝기 조정
      svg
        .select(".background image")
        .transition()
        .duration(100)
        .attr("filter", "brightness(0.3)");

      // 기존 hover 레이블 제거
      svg.selectAll(".hover-label").remove();

      // 일치하는 노드에 클래스 레이블 추가
      matchingNodes.forEach((node) => {
        const topRight = [node.position[0][0], node.position[0][1]];

        // 텍스트 레이블 추가
        svg
          .append("text")
          .attr("class", "hover-label")
          .attr("x", topRight[0])
          .attr("y", topRight[1] - 15)
          .attr("text-anchor", "start")
          .attr("dominant-baseline", "baseline")
          .attr("fill", "white")
          .attr("font-weight", "bold")
          .attr("font-size", `${Math.min(55, 55 / viewBox.scale)}px`)
          .attr("pointer-events", "none")
          .text(hoverClass);
      });
    } else {
      // hover 상태가 없을 때 모든 요소를 원래 상태로 복원
      svg
        .selectAll(".node")
        .transition()
        .duration(100)
        .attr("opacity", nodeOpacity);

      svg.selectAll("circle").transition().duration(100).attr("opacity", 1);

      svg
        .selectAll("text:not(.hover-label)")
        .transition()
        .duration(100)
        .style("opacity", 1);

      svg
        .selectAll(".edge-group")
        .transition()
        .duration(100)
        .style("opacity", 1);

      svg
        .select(".background image")
        .transition()
        .duration(100)
        .attr("filter", `brightness(${bright})`);

      // hover 레이블 및 관련 요소 제거
      svg.selectAll(".hover-label, .hover-label-bg").remove();
    }
  }, [
    hoverClass,
    graphData.nodes,
    graphData.edges,
    bright,
    nodeOpacity,
    viewBox.scale,
  ]);

  useEffect(() => {
    if (target && isConnecting) {
      setTarget2(target);
    }
  }, [target, isConnecting]);

  // Existing useEffect for ctrl key handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey) {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (event) => {
      if (!event.ctrlKey) {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isConnecting) return;
    setIsLabelPopupOpen(selectedNode || selectedEdge);
  }, [selectedNode, selectedEdge]);

  useEffect(() => {
    if (target && target2 && isConnecting && target !== target2) {
      const confirmMessage =
        `from: ${target2.properties.label}\n` +
        `to: ${target.properties.label}\n\n` +
        `[확인] 현재 방향대로 연결\n` +
        `[취소] 연결 중단\n` +
        `[r 입력] 노드 순서 반대로`;

      const userChoice = prompt(confirmMessage);

      // 연결 프로세스 완료 후 모든 상태 초기화
      const finalizeConnection = () => {
        setTarget(null);
        setTarget2(null);
        setIsConnecting(false);
        setSelectTool(null);
        setSelectedNode(null);
      };

      if (userChoice === null) {
        // 연결 중단
        finalizeConnection();
        return;
      }

      let processedNodes = [target2, target];
      if (userChoice.toLowerCase() === "r") {
        // 노드 순서 반대로 변경
        processedNodes.reverse();
      } else if (userChoice !== "") {
        // 잘못된 입력 처리
        alert("잘못된 입력입니다.");
        finalizeConnection();
        return;
      }

      // 이미 존재하는 연결 확인
      const isExistingEdge = graphData.edges.some(
        (edge) =>
          edge.source === processedNodes[0].name &&
          edge.target === processedNodes[1].name
      );

      if (isExistingEdge) {
        alert("이미 연결되어 있습니다.");
        finalizeConnection();
        return;
      }

      const edgeType = prompt("엣지 속성 입력:");
      const newName = `edge_${uuidv4()}`;
      const newEdge = {
        name: newName,
        properties: {
          lineNo: edgeType,
        },
        source: processedNodes[0].name,
        target: processedNodes[1].name,
      };

      setTimeout(() => {
        setGraphData((prev) => ({
          ...prev,
          edges: [...prev.edges, newEdge],
        }));

        setPendingSaveData({
          kind: "edge",
          name: newName,
          action: "add",
          data: newEdge,
        });
      }, 100);

      // 상태 초기화
      finalizeConnection();
    }
  }, [target, target2, isConnecting, graphData.edges, setSelectTool]);

  // 노드의 중심점 계산
  const getCenter = useCallback((node) => {
    const [topLeft, bottomRight] = node.position;
    return [
      (topLeft[0] + bottomRight[0]) / 2,
      (topLeft[1] + bottomRight[1]) / 2,
    ];
  }, []);

  const getRadius = useCallback((node) => {
    const [topLeft, bottomRight] = node.position;
    return Math.max(
      0,
      Math.min(
        Math.abs(bottomRight[0] - topLeft[0]) / 4,
        Math.abs(bottomRight[1] - topLeft[1]) / 4
      )
    );
  }, []);

  // 엣지 좌표 계산
  const getEdgeCoordinates = (source, target) => {
    const sourceNode = graphData.nodes.find((node) => node.name === source);
    const targetNode = graphData.nodes.find((node) => node.name === target);

    // 소스와 타겟 노드의 중심점 계산
    const sourceCenter = [
      (sourceNode.position[0][0] + sourceNode.position[1][0]) / 2,
      (sourceNode.position[0][1] + sourceNode.position[1][1]) / 2,
    ];
    const targetCenter = [
      (targetNode.position[0][0] + targetNode.position[1][0]) / 2,
      (targetNode.position[0][1] + targetNode.position[1][1]) / 2,
    ];

    // 방향 벡터 계산
    const dx = targetCenter[0] - sourceCenter[0];
    const dy = targetCenter[1] - sourceCenter[1];
    const angle = Math.atan2(dy, dx);

    // 소스 노드의 치수
    const sourceWidth = sourceNode.position[1][0] - sourceNode.position[0][0];
    const sourceHeight = sourceNode.position[1][1] - sourceNode.position[0][1];

    // 타겟 노드의 치수
    const targetWidth = targetNode.position[1][0] - targetNode.position[0][0];
    const targetHeight = targetNode.position[1][1] - targetNode.position[0][1];

    // 교차점 계산 함수
    const getIntersection = (center, width, height, angle) => {
      const w2 = width / 2;
      const h2 = height / 2;

      // 각도에 따른 사분면 확인
      if (Math.abs(Math.cos(angle)) * h2 > Math.abs(Math.sin(angle)) * w2) {
        // 수직 경계와 교차
        const x = w2 * Math.sign(Math.cos(angle));
        const y = x * Math.tan(angle);
        return [center[0] + x, center[1] + y];
      } else {
        // 수평 경계와 교차
        const y = h2 * Math.sign(Math.sin(angle));
        const x = y / Math.tan(angle);
        return [center[0] + x, center[1] + y];
      }
    };

    // 소스와 타겟 노드의 교차점 계산
    const sourceIntersection = getIntersection(
      sourceCenter,
      sourceWidth,
      sourceHeight,
      angle
    );
    const targetIntersection = getIntersection(
      targetCenter,
      targetWidth,
      targetHeight,
      angle + Math.PI
    );

    // 패딩 값 설정
    const sourcePadding = 5; // 시작점 패딩
    const targetPadding = 8; // 끝점 패딩 (화살표를 위해 더 큰 값 사용)

    // 방향에 따른 패딩 적용
    const distance = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / distance;
    const unitY = dy / distance;

    return {
      x1: sourceIntersection[0] + unitX * sourcePadding,
      y1: sourceIntersection[1] + unitY * sourcePadding,
      x2: targetIntersection[0] - unitX * targetPadding,
      y2: targetIntersection[1] - unitY * targetPadding,
    };
  };

  useEffect(() => {
    const updateImageSize = () => {
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        // viewBox도 원본 이미지 크기에 맞게 설정
        setViewBox({
          x: 0,
          y: 0,
          width: originalWidth,
          height: originalHeight,
          scale: 1,
        });
      };
      img.src = imgURL;
    };

    updateImageSize();
    window.addEventListener("resize", updateImageSize);

    return () => {
      window.removeEventListener("resize", updateImageSize);
    };
  }, [imgURL]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const backgroundGroup = svg.append("g").attr("class", "background");
    const edgeGroup = svg.append("g").attr("class", "edges");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    svg.on("click", (event) => {
      if (!event.target.closest(".nodes, .edges")) {
        setSelectedNode(null);
        setSelectedEdge(null);
        setSelectedSymbol(false);
        setTarget(null);
        svg.selectAll(".resize-handle").attr("opacity", 0); // 모든 핸들 숨기기
      }
    });

    // Background image
    backgroundGroup
      .append("image")
      .attr("href", imgURL)
      .attr("opacity", 1)
      .attr("filter", `brightness(${bright})`);

    // 노드 이동 드래그 행동 생성
    let dragOffset = null; // 드래그 시작 시 노드와 마우스 간의 오프셋

    const nodeDrag = d3
      .drag()
      .on("start", (event, d) => {
        if (!event.active) {
          setIsResizing(true);
          draggedNodeRef.current = d;

          // 드래그 시작 시 마우스 위치와 노드의 상단 좌표 차이를 계산
          const svg = svgRef.current;
          const point = svg.createSVGPoint();
          point.x = event.sourceEvent.clientX;
          point.y = event.sourceEvent.clientY;
          const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

          const nodeTopLeft = d.position[0]; // 노드의 좌상단 좌표
          dragOffset = [
            svgPoint.x - nodeTopLeft[0],
            svgPoint.y - nodeTopLeft[1],
          ];
        }
      })
      .on("end", (event, d) => {
        setIsResizing(false);
        draggedNodeRef.current = null;
        dragOffset = null; // 드래그 종료 시 초기화
        if (
          event.sourceEvent.type === "mouseup" &&
          event.sourceEvent.detail === 1
        ) {
          selectNode(event, d);
          setIsLabelPopupOpen(true);
          setPendingSaveData({
            kind: "node",
            name: d.name,
            action: "upd",
            data: d,
          });
        }
      })
      .on("drag", (event, d) => {
        if (!draggedNodeRef.current || !dragOffset) return;

        const svg = svgRef.current;
        const point = svg.createSVGPoint();
        point.x = event.sourceEvent.clientX;
        point.y = event.sourceEvent.clientY;
        const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

        // 드래그 중 새 좌상단 좌표 계산
        const newTopLeft = [
          svgPoint.x - dragOffset[0],
          svgPoint.y - dragOffset[1],
        ];

        // 노드 크기 계산
        const nodeWidth = d.position[1][0] - d.position[0][0];
        const nodeHeight = d.position[1][1] - d.position[0][1];

        // RAF를 사용한 위치 업데이트
        requestAnimationFrame(() => {
          if (!draggedNodeRef.current) return;

          draggedNodeRef.current.position = [
            newTopLeft,
            [newTopLeft[0] + nodeWidth, newTopLeft[1] + nodeHeight],
          ];

          // D3 선택자를 최소화하여 업데이트
          const nodeGroup = d3.select(svgRef.current).select(".nodes");

          nodeGroup
            .selectAll("rect")
            .filter((node) => node === draggedNodeRef.current)
            .attr("x", newTopLeft[0])
            .attr("y", newTopLeft[1]);

          nodeGroup
            .selectAll("circle")
            .filter((node) => node === draggedNodeRef.current)
            .attr("cx", newTopLeft[0] + nodeWidth / 2)
            .attr("cy", newTopLeft[1] + nodeHeight / 2);

          nodeGroup
            .selectAll("text")
            .filter((node) => node === draggedNodeRef.current)
            .attr("x", newTopLeft[0] + nodeWidth / 2)
            .attr("y", newTopLeft[1] + nodeHeight / 2);

          // 연결된 엣지만 업데이트
          const connectedEdges = memoizedEdges.filter(
            (edge) => edge.source === d.name || edge.target === d.name
          );

          const edgeGroup = d3.select(svgRef.current).select(".edges");
          connectedEdges.forEach((edge) => {
            const coords = getEdgeCoordinates(edge.source, edge.target);
            edgeGroup
              .selectAll(".edge-group")
              .filter((e) => e === edge)
              .selectAll("line")
              .attr("x1", coords.x1)
              .attr("y1", coords.y1)
              .attr("x2", coords.x2)
              .attr("y2", coords.y2);
          });
        });
      });

    // 크기 조절 핸들 드래그 행동 생성
    const resizeDrag = d3
      .drag()
      .on("start", (event, d) => {
        const svg = svgRef.current;
        const point = svg.createSVGPoint();
        point.x = event.sourceEvent.clientX;
        point.y = event.sourceEvent.clientY;
        const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

        event.sourceEvent.stopPropagation();
        setIsResizing(true);
        d.startPosition = [...d.position]; // 드래그 시작 좌표 저장
        d.minReachedPositionX = null; // x축 최소 크기 상태에서의 좌표 초기화
        d.minReachedPositionY = null; // y축 최소 크기 상태에서의 좌표 초기화

        // 시작 시점의 SVG 좌표 저장
        d.startSvgPoint = svgPoint;
      })
      .on("end", (event, d) => {
        selectNode(d);
        setIsResizing(false);
        if (event.sourceEvent.type === "mouseup") {
          setPendingSaveData({
            kind: "node",
            name: d.name,
            action: "upd",
            data: d,
          });
        }
      })
      .on("drag", (event, d) => {
        const svg = svgRef.current;
        const point = svg.createSVGPoint();
        point.x = event.sourceEvent.clientX;
        point.y = event.sourceEvent.clientY;
        const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

        const cornerIndex = d.cornerIndex;
        const currentPosition = [...d.position]; // 현재 좌표
        const minSize = 20; // 최소 크기

        // 현재 좌표
        const [x1, y1] = currentPosition[0];
        const [x2, y2] = currentPosition[1];

        // 드래그 이동 거리 계산 (SVG 좌표 기준)
        const dx = svgPoint.x - d.startSvgPoint.x;
        const dy = svgPoint.y - d.startSvgPoint.y;

        let newX1 = x1;
        let newY1 = y1;
        let newX2 = x2;
        let newY2 = y2;

        switch (cornerIndex) {
          case 0:
            newX1 = Math.min(x2 - minSize, x1 + dx);
            newY1 = Math.min(y2 - minSize, y1 + dy);
            break;
          case 1:
            newY1 = Math.min(y2 - minSize, y1 + dy);
            newX2 = Math.max(x1 + minSize, x2 + dx);
            break;
          case 2:
            newX1 = Math.min(x2 - minSize, x1 + dx);
            newY2 = Math.max(y1 + minSize, y2 + dy);
            break;
          case 3:
            newX2 = Math.max(x1 + minSize, x2 + dx);
            newY2 = Math.max(y1 + minSize, y2 + dy);
            break;
          default:
            return;
        }

        // x축 제한 처리
        const width = Math.abs(newX2 - newX1);
        if (width <= minSize) {
          if (!d.minReachedPositionX) {
            d.minReachedPositionX = { x: svgPoint.x }; // 최소 크기 상태에서 x축 마우스 좌표 저장
          }
        } else if (
          d.minReachedPositionX &&
          svgPoint.x - d.minReachedPositionX.x === 0
        ) {
          d.minReachedPositionX = null;
        }

        if (d.minReachedPositionX) {
          const { x: minX } = d.minReachedPositionX;
          const moveX = svgPoint.x - minX;

          if ((cornerIndex === 0 || cornerIndex === 2) && moveX > 0) newX1 = x1;
          if ((cornerIndex === 1 || cornerIndex === 3) && moveX < 0) newX2 = x2;
        }

        // y축 제한 처리
        const height = Math.abs(newY2 - newY1);
        if (height <= minSize) {
          if (!d.minReachedPositionY) {
            d.minReachedPositionY = { y: svgPoint.y }; // 최소 크기 상태에서 y축 마우스 좌표 저장
          }
        } else if (
          d.minReachedPositionY &&
          svgPoint.y - d.minReachedPositionY.y === 0
        ) {
          d.minReachedPositionY = null;
        }

        if (d.minReachedPositionY) {
          const { y: minY } = d.minReachedPositionY;
          const moveY = svgPoint.y - minY;

          if ((cornerIndex === 0 || cornerIndex === 1) && moveY > 0) newY1 = y1;
          if ((cornerIndex === 2 || cornerIndex === 3) && moveY < 0) newY2 = y2;
        }

        // 크기 업데이트
        currentPosition[0][0] = newX1;
        currentPosition[0][1] = newY1;
        currentPosition[1][0] = newX2;
        currentPosition[1][1] = newY2;

        d.position = currentPosition;
        setGraphData({ ...graphData });

        // 시작 SVG 포인트 업데이트
        d.startSvgPoint = svgPoint;
      });

    // 화살표 그리기
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8) // 선 끝의 x 좌표 (조정 가능)
      .attr("refY", 5) // 화살표의 중심
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 Z") // 삼각형 화살표
      .attr("fill", "#333"); // 화살표 색상

    const edgeLines = edgeGroup
      .selectAll(".edge-group")
      .data(graphData.edges)
      .enter()
      .append("g")
      .attr("class", "edge-group");

    // 클릭 가능한 넓은 영역 (투명)
    edgeLines
      .append("line")
      .attr("class", "edge-hit-area")
      .attr("x1", (d) => getEdgeCoordinates(d.source, d.target).x1)
      .attr("y1", (d) => getEdgeCoordinates(d.source, d.target).y1)
      .attr("x2", (d) => getEdgeCoordinates(d.source, d.target).x2)
      .attr("y2", (d) => getEdgeCoordinates(d.source, d.target).y2)
      .attr("stroke", "transparent")
      .attr("stroke-width", 20) // 넓은 클릭 영역
      .style("cursor", "pointer");

    // 실제 표시되는 엣지 라인
    edgeLines
      .append("line")
      .attr("class", "edge")
      .attr("x1", (d) => getEdgeCoordinates(d.source, d.target).x1)
      .attr("y1", (d) => getEdgeCoordinates(d.source, d.target).y1)
      .attr("x2", (d) => getEdgeCoordinates(d.source, d.target).x2)
      .attr("y2", (d) => getEdgeCoordinates(d.source, d.target).y2)
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .attr("marker-end", "url(#arrowhead)");

    // 엣지 클릭 이벤트 추가 (투명 히트 영역에 이벤트 바인딩)
    edgeLines.select(".edge-hit-area,line").on("click", (event, edge) => {
      event.stopPropagation(); // 부모 요소로의 이벤트 전파 중지
      setSelectedEdge(edge);
      setIsLabelPopupOpen(true);
      setSelectedSymbol(true);

      // 노드 선택 해제
      setSelectedNode(null);

      // 모든 리사이즈 핸들 숨기기
      svg.selectAll(".resize-handle").attr("opacity", 0);
    });

    // 사각형 노드 그리기
    // eslint-disable-next-line
    const rectangleNodes = nodeGroup
      .selectAll("rect")
      .data(graphData.nodes)
      .enter()
      .append("rect")
      .attr("class", "node")
      .attr("x", (d) => Math.min(d.position[0][0], d.position[1][0]))
      .attr("y", (d) => Math.min(d.position[0][1], d.position[1][1]))
      .attr("width", (d) => Math.abs(d.position[1][0] - d.position[0][0]))
      .attr("height", (d) => Math.abs(d.position[1][1] - d.position[0][1]))
      .attr("fill", "#fff")
      .attr("opacity", nodeOpacity)
      .attr("pointer-events", "all")
      .attr("cursor", "move")
      .call(nodeDrag);
    // 원형 노드 그리기
    // eslint-disable-next-line
    const circleNodes = nodeGroup
      .selectAll("circle")
      .data(graphData.nodes)
      .enter()
      .append("circle")
      .attr("cx", (d) => getCenter(d)[0])
      .attr("cy", (d) => getCenter(d)[1])
      .attr("r", (d) => getRadius(d))
      .attr("fill", "#0078d4")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .attr("pointer-events", "all")
      .attr("cursor", "move")
      .call(nodeDrag);

    // 노드 이름 텍스트 추가
    nodeGroup
      .selectAll("text")
      .data(graphData.nodes)
      .enter()
      .append("text")
      .attr("x", (d) => getCenter(d)[0])
      .attr("y", (d) => getCenter(d)[1])
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .attr("dominant-baseline", "middle")
      .text((d) => d.properties.label)
      .style(
        "font-size",
        (d) =>
          `${Math.min(
            (d.position[1][0] - d.position[0][0]) / 9,
            (d.position[1][1] - d.position[0][1]) / 9
          )}px`
      )
      .style("font-family", "Arial")
      .style("fill", "white")
      .call(nodeDrag);

    // 크기 조절 핸들 추가
    const handleSize = 15 / viewBox.scale;
    // eslint-disable-next-line
    const cornerHandles = nodeGroup
      .selectAll(".resize-handle")
      .data(
        graphData.nodes.flatMap((node, nodeIndex) =>
          [0, 1, 2, 3].map((cornerIndex) => ({
            ...node,
            cornerIndex,
            nodeIndex,
          }))
        )
      )
      .enter()
      .append("rect")
      .attr("class", "resize-handle")
      .attr("width", handleSize)
      .attr("height", handleSize)
      .attr("fill", "#0078d4")
      .attr("opacity", 0)
      .attr("cursor", (d) => {
        const cursors = [
          "nwse-resize", // 좌상단
          "nesw-resize", // 우상단
          "nesw-resize", // 좌하단
          "nwse-resize", // 우하단
        ];
        return cursors[d.cornerIndex];
      })
      .attr("x", (d) => {
        const corners = [
          d.position[0][0] - handleSize / 2,
          d.position[1][0] - handleSize / 2,
          d.position[0][0] - handleSize / 2,
          d.position[1][0] - handleSize / 2,
        ];
        return corners[d.cornerIndex];
      })
      .attr("y", (d) => {
        const corners = [
          d.position[0][1] - handleSize / 2,
          d.position[0][1] - handleSize / 2,
          d.position[1][1] - handleSize / 2,
          d.position[1][1] - handleSize / 2,
        ];
        return corners[d.cornerIndex];
      })
      .call(resizeDrag);

    const selectNode = (event, node) => {
      setTarget(node);
      setSelectedEdge(null);
      setSelectedSymbol(true);

      if (selectedNode && selectedNode !== node) {
        svg
          .selectAll(".resize-handle")
          .filter(
            (handle) =>
              handle.nodeIndex === graphData.nodes.indexOf(selectedNode)
          )
          .attr("opacity", 0);
      }
      setSelectedNode(node);

      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(node))
        .attr("opacity", 1);
    };

    rectangleNodes.on("mouseenter", function (event, d) {
      if ((isResizing && selectedNode !== d) || isResizing) {
        return;
      }

      // 선택된 노드와 현재 hover된 노드를 제외한 모든 노드의 opacity 낮추기
      svg
        .selectAll(".node, circle, text")
        .filter((nodeData) => nodeData !== d && nodeData !== selectedNode)
        .attr("opacity", 0.2);

      // 선택된 노드와 현재 hover된 노드는 원래 opacity 유지
      svg
        .selectAll(".node, circle")
        .filter((data) => data === d || data === selectedNode)
        .attr("opacity", 0.8);

      // 엣지 opacity 조정
      svg.selectAll(".edge-group").attr("opacity", 0.4);

      // 현재 노드의 resize 핸들 표시
      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
        .attr("opacity", 1);

      // 배경 이미지 어둡게
      svg
        .select(".background image")
        .transition()
        .duration(100)
        .attr("filter", "brightness(0.3)");

      // 텍스트는 항상 잘 보이게
      svg
        .selectAll("text")
        .filter((data) => data === d || data === selectedNode)
        .attr("opacity", 1);
    });

    // circleNodes.on("mouseenter") 부분도 동일하게 수정
    circleNodes.on("mouseenter", function (event, d) {
      if ((isResizing && selectedNode !== d) || isResizing) {
        return;
      }

      // 선택된 노드와 현재 hover된 노드를 제외한 모든 노드의 opacity 낮추기
      svg
        .selectAll(".node, circle, text")
        .filter((nodeData) => nodeData !== d && nodeData !== selectedNode)
        .attr("opacity", 0.2);

      // 선택된 노드와 현재 hover된 노드는 원래 opacity 유지
      svg
        .selectAll(".node, circle")
        .filter((data) => data === d || data === selectedNode)
        .attr("opacity", 0.8);

      // 엣지 opacity 조정
      svg.selectAll(".edge-group").attr("opacity", 0.4);

      // 현재 노드의 resize 핸들 표시
      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
        .attr("opacity", 1);

      // 배경 이미지 어둡게
      svg
        .select(".background image")
        .transition()
        .duration(100)
        .attr("filter", "brightness(0.3)");

      // 텍스트는 항상 잘 보이게
      svg
        .selectAll("text")
        .filter((data) => data === d || data === selectedNode)
        .attr("opacity", 1);
    });

    rectangleNodes.on("mouseleave", function (event, d) {
      if (!selectedNode || selectedNode !== d || isResizing) {
        svg.selectAll(".node").attr("opacity", nodeOpacity); // node는 변수 사용
        svg.selectAll(".circle, circle, .edge-group, text").attr("opacity", 1); // 다른 요소는 직접 값 설정
        svg
          .selectAll(".resize-handle")
          .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
          .attr("opacity", 0); // 숨김 상태는 0으로 설정

        svg
          .select(".background image")
          .transition()
          .duration(100)
          .attr("filter", `brightness(${bright})`);
      }
    });

    circleNodes.on("mouseleave", function (event, d) {
      if (!selectedNode || selectedNode !== d || isResizing) {
        svg.selectAll(".node").attr("opacity", nodeOpacity); // node는 변수 사용
        svg.selectAll(".circle, circle, .edge-group, text").attr("opacity", 1); // 다른 요소는 직접 값 설정
        svg
          .selectAll(".resize-handle")
          .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
          .attr("opacity", 0); // 숨김 상태는 0으로 설정

        svg
          .select(".background image")
          .transition()
          .duration(100)
          .attr("filter", `brightness(${bright})`);
      }
    });

    cornerHandles.on("mouseenter", function (event, d) {
      if (isResizing) return;
      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === d.nodeIndex)
        .attr("opacity", 1);
    });

    cornerHandles.on("mouseleave", function (event, d) {
      if (!selectedNode || selectedNode !== d.name || isResizing) {
        svg
          .selectAll(".resize-handle")
          .filter(
            (handle) => !selectedNode || selectedNode.name !== handle.name
          )
          .attr("opacity", 0);
      }
    });
  }, [graphData, isResizing, selectedNode, bright, nodeOpacity, viewBox.scale]);

  const startDrawing = (e) => {
    if (!isDrawing) return;
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    setRectangle({
      x1: svgPoint.x,
      y1: svgPoint.y,
      x2: svgPoint.x,
      y2: svgPoint.y,
    });

    // 드로잉을 위해 마우스 이동을 계속 추적
    document.addEventListener("mousemove", draw);
  };

  const draw = (e) => {
    if (!isDrawing || !rectangle) return;
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    setRectangle((prev) => ({
      ...prev,
      x2: svgPoint.x,
      y2: svgPoint.y,
    }));
  };

  const stopDrawing = () => {
    if (rectangle && isDrawing) {
      setIsDrawing(false); // 드로잉 종료
      document.removeEventListener("mousemove", draw); // 마우스 이벤트 리스너 제거
      setIsLabelPopupOpen(true); // 팝업 열기
      setSelectTool(null);
    }
  };

  const handleLabelSelect = (value, selectedItem, selectedProperty, type) => {
    console.log(value, selectedItem, selectedProperty);

    if (type === "edge") {
      // 엣지 업데이트
      setGraphData((prev) => ({
        ...prev,
        edges: prev.edges.map((edge) =>
          edge.id === selectedItem.id
            ? {
                ...edge,
                properties: {
                  ...edge.properties,
                  [selectedProperty]: value, // 선택한 속성 업데이트
                },
              }
            : edge
        ),
      }));
      setPendingSaveData({
        kind: "edge",
        name: selectedItem.name,
        action: "upd",
        data: {
          ...selectedItem,
          properties: {
            ...selectedItem.properties,
            [selectedProperty]: value,
          },
        },
      });
    } else if (type === "node") {
      // 노드 업데이트
      setGraphData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) =>
          node.name === selectedItem.name
            ? {
                ...node,
                properties: {
                  ...node.properties,
                  [selectedProperty]: value, // 선택한 속성 업데이트
                },
              }
            : node
        ),
      }));
      setPendingSaveData({
        kind: "node",
        name: selectedItem.name,
        action: "upd",
        data: {
          ...selectedItem,
          properties: {
            ...selectedItem.properties,
            [selectedProperty]: value,
          },
        },
      });
    } else {
      // 새 노드 추가
      const topLeft = [
        Math.min(rectangle.x1, rectangle.x2),
        Math.min(rectangle.y1, rectangle.y2),
      ];
      const bottomRight = [
        Math.max(rectangle.x1, rectangle.x2),
        Math.max(rectangle.y1, rectangle.y2),
      ];

      const newNodeName = `${value}_${uuidv4()}`;
      const newNode = {
        name: newNodeName,
        position: [topLeft, bottomRight],
        properties: { label: value },
      };

      setGraphData((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));

      setPendingSaveData({
        kind: "node",
        name: newNodeName,
        action: "add",
        data: newNode,
      });
    }

    setRectangle(null);
    setIsDrawing(false);
  };

  const handleRemoveNode = () => {
    if (!selectedNode && !selectedEdge) return;

    if (selectedNode) {
      const confirmDelete = window.confirm(
        "해당 노드와 연결된 모든 엣지가 삭제됩니다.\n" +
          "계속 진행하시겠습니까?"
      );

      // 노드 삭제 로직
      if (confirmDelete) {
        const updatedNodes = graphData.nodes.filter(
          (node) => node.name !== selectedNode.name
        );

        // 해당 노드와 연결된 모든 엣지 삭제
        const updatedEdges = graphData.edges.filter(
          (edge) =>
            edge.source !== selectedNode.name &&
            edge.target !== selectedNode.name
        );

        setPendingSaveData({
          kind: "node",
          name: selectedNode.name,
          action: "del",
          data: selectedNode,
        });

        setTimeout(() => {
          setGraphData((prevData) => ({
            ...prevData,
            nodes: updatedNodes,
            edges: updatedEdges,
          }));
        }, 100);
        setSelectedNode(null);
      }
    }

    if (selectedEdge) {
      const confirmDelete = window.confirm(
        `${getNodeLabel(selectedEdge.source)} → ${getNodeLabel(
          selectedEdge.target
        )}\n` + `선택한 엣지를 삭제하시겠습니까?`
      );

      // 노드의 label을 찾아주는 함수
      function getNodeLabel(nodeName) {
        const node = graphData.nodes.find((n) => n.name === nodeName);
        return node ? node.properties.label : nodeName; // label이 없으면 nodeName 반환
      }

      if (confirmDelete) {
        // 엣지 삭제 로직
        const updatedEdges = graphData.edges.filter(
          (edge) =>
            !(
              edge.source === selectedEdge.source &&
              edge.target === selectedEdge.target
            )
        );
        setPendingSaveData({
          kind: "edge",
          name: selectedEdge.name,
          action: "del",
          data: selectedEdge,
        });

        setTimeout(() => {
          setGraphData((prevData) => ({
            ...prevData,
            edges: updatedEdges,
          }));
        }, 100);

        setSelectedEdge(null);
        setSelectedNode(null);
        setSelectedSymbol(false);
      } else {
        return;
      }
    }
    setSelectTool(null);
  };

  const handleMouseDown = (event) => {
    setIsPanning(true);
    setStartPoint({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = useCallback(
    (event) => {
      if (!isPanning || selectTool === "drawing") return;

      // Remove requestAnimationFrame since React's state updates are already batched
      const dx = (event.clientX - startPoint.x) / viewBox.scale;
      const dy = (event.clientY - startPoint.y) / viewBox.scale;

      // Multiply by a sensitivity factor to increase movement
      const sensitivity = 1.5; // Adjust this value to make movement faster/slower

      setViewBox((prev) => ({
        ...prev,
        x: prev.x - dx * sensitivity,
        y: prev.y - dy * sensitivity,
      }));

      setStartPoint({ x: event.clientX, y: event.clientY });
    },
    [isPanning, selectTool, startPoint, viewBox.scale]
  );

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = useCallback(
    (event) => {
      if (!isCtrlPressed) return;

      const svgElement = svgRef.current;
      const svgRect = svgElement.getBoundingClientRect();

      // Performance: 계산 최적화
      const mouseX = event.clientX - svgRect.left;
      const mouseY = event.clientY - svgRect.top;
      const relativeX = mouseX / svgRect.width;
      const relativeY = mouseY / svgRect.height;

      setViewBox((prev) => {
        // 최적화된 스케일 계산
        const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
        const newScale = Math.max(0.1, Math.min(prev.scale * scaleFactor, 10));
        const scaleRatio = prev.scale / newScale;

        // 최적화된 크기 및 위치 계산
        const newWidth = prev.width * scaleRatio;
        const newHeight = prev.height * scaleRatio;
        const newX = prev.x + (prev.width - newWidth) * relativeX;
        const newY = prev.y + (prev.height - newHeight) * relativeY;

        return {
          width: newWidth,
          height: newHeight,
          scale: newScale,
          x: newX,
          y: newY,
        };
      });
    },
    [isCtrlPressed]
  );

  useEffect(() => {
    if (selectTool === "drawing") {
      setIsDrawing(!isDrawing);
      setIsLabelPopupOpen(false);
      setIsConnecting(false);
      setTarget(null);
      setTarget2(null);
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedSymbol(null);
    }

    if (selectTool === "connecting") {
      setIsConnecting(true);
      setSelectedEdge(null);
      setIsDrawing(false);
    }

    if (selectTool === "remove") {
      handleRemoveNode();
      setTarget(null);
    }
    const svg = d3.select(svgRef.current);

    // 성능 개선: 한 번의 선택으로 여러 요소 업데이트
    const updateSelection = svg
      .selectAll(".node, circle, .edge-group, text")
      .transition()
      .duration(100);

    if (selectTool === "invisible") {
      updateSelection.style("opacity", 0).style("pointer-events", "none");
    } else if (selectTool === "visible") {
      // 최적화된 업데이트 로직
      svg.selectAll("circle").transition().duration(100).style("opacity", 1);

      svg
        .selectAll(".node")
        .transition()
        .duration(100)
        .style("opacity", nodeOpacity)
        .style("pointer-events", "auto");

      const otherElements = svg.selectAll(".edge-group, text");
      otherElements
        .transition()
        .duration(100)
        .style("opacity", 1)
        .style("pointer-events", "auto");
    }
  }, [selectTool, nodeOpacity]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // 모든 엣지를 기본 상태로 초기화
    svg.selectAll(".edge-group").each(function () {
      const edgeGroup = d3.select(this);
      edgeGroup
        .select(".edge")
        .attr("stroke-width", 2) // 기본 두께
        .attr("opacity", 1); // 기본 투명도
    });

    // 선택된 엣지가 있으면 해당 엣지 강조
    if (selectedEdge) {
      svg
        .selectAll(".edge-group")
        .filter(
          (d) =>
            d.source === selectedEdge.source && d.target === selectedEdge.target
        )
        .select(".edge")
        .attr("stroke-width", 4) // 강조 두께
        .attr("opacity", 1); // 강조 투명도
    }

    // 마우스 이벤트 추가
    svg
      .selectAll(".edge-group")
      .on("mouseenter", function (event, d) {
        const currentEdge = d3.select(this).select(".edge");

        // 모든 엣지 투명도 낮추기
        svg.selectAll(".edge-group .edge").attr("opacity", 0.3);

        // 호버된 엣지의 스타일 복원
        currentEdge.attr("opacity", 1).attr("stroke-width", 4);
      })
      .on("mouseleave", function () {
        // 모든 엣지를 기본 상태로 복원
        svg
          .selectAll(".edge-group .edge")
          .attr("opacity", 1)
          .attr("stroke-width", 2);

        // 선택된 엣지가 있으면 강조 상태 유지
        if (selectedEdge) {
          svg
            .selectAll(".edge-group")
            .filter(
              (d) =>
                d.source === selectedEdge.source &&
                d.target === selectedEdge.target
            )
            .select(".edge")
            .attr("stroke-width", 4)
            .attr("opacity", 1);
        }
      });

    // Cleanup 함수로 이벤트 제거
    return () => {
      svg
        .selectAll(".edge-group")
        .on("mouseenter", null)
        .on("mouseleave", null);
    };
  });

  return (
    <div className="w-[65vw] h-[88vh] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
      <LabelSelectorPopup
        isOpen={isLabelPopupOpen}
        onClose={() => {
          setIsLabelPopupOpen(false);
          setIsDrawing(false);
          setRectangle(null);
        }}
        graphData={graphData}
        onLabelSelect={handleLabelSelect}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onDeleteLabel={handleRemoveNode}
      />

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={(e) => {
          handleMouseDown(e);
          startDrawing(e);
        }}
        onMouseMove={(e) => {
          handleMouseMove(e);
          draw(e);
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
          stopDrawing(e);
        }}
        onMouseLeave={(e) => {
          handleMouseUp(e);
          stopDrawing(e);
        }}
        onWheel={handleWheel}
        style={{
          cursor: isDrawing
            ? "crosshair"
            : isPanning
            ? "grabbing"
            : isConnecting
            ? "pointer"
            : "grab",
        }}
      >
        {rectangle && (
          <rect
            x={Math.min(rectangle.x1, rectangle.x2)}
            y={Math.min(rectangle.y1, rectangle.y2)}
            width={Math.abs(rectangle.x2 - rectangle.x1)}
            height={Math.abs(rectangle.y2 - rectangle.y1)}
            fill="#0078d4"
            opacity="0.3"
          />
        )}
      </svg>
    </div>
  );
};

export default GraphVisualization;

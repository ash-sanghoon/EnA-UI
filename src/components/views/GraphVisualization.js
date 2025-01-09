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
import { getEdgeCoordinates, getCenter, getRadius, handleHoverEffect } from "../graph elements/utils";

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
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [isCtrlPressed, setIsCtrlPressed] = useState(null);
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
  const [initialViewBox, setInitialViewBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
  });
  const memoizedEdges = useMemo(() => graphData.edges, [graphData.edges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCtrlPressed(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pendingSaveData && !isPanning) {
      setSaveData(pendingSaveData);
      setPendingSaveData(null);
    }
  }, [pendingSaveData]);


  useEffect(() => {
    const save = async () => {
      const requestData = {
        push: saveData,
        origin: graphData,
      };
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
    save();
  }, [saveData]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    handleHoverEffect(svg, hoverClass, graphData, nodeOpacity, bright, viewBox);
  }, [hoverClass, graphData.nodes, graphData.edges, isCtrlPressed]);

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
          line_no: edgeType,
        },
        source: processedNodes[0].name,
        target: processedNodes[1].name,
      };

      setGraphData((prev) => ({
        ...prev,
        edges: [...prev.edges, newEdge],
      }));
      setTimeout(() => {
        setPendingSaveData({
          kind: "edge",
          name: newName,
          action: "add",
          data: newEdge,
        });
      }, 50);

      // 상태 초기화
      finalizeConnection();
    }
  }, [target, target2, isConnecting, graphData.edges, setSelectTool]);

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
    let initialPosition = null;

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

          // 초기 위치 저장
          initialPosition = [...d.position];
        }
      })
      .on("end", (event, d) => {
        setIsResizing(false);
        draggedNodeRef.current = null;
        dragOffset = null; // 드래그 종료 시 초기화

        // 위치 변화가 있는지 확인
        const hasPositionChanged =
          d.position[0] !== initialPosition[0] ||
          d.position[1] !== initialPosition[1];

        if (hasPositionChanged) {
          setPendingSaveData({
            kind: "node",
            name: d.name,
            action: "upd",
            data: d,
          });
        }

        // 클릭 이벤트 처리
        if (
          event.sourceEvent.type === "mouseup" &&
          event.sourceEvent.detail === 1
        ) {
          selectNode(event, d);
          setIsLabelPopupOpen(true);
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
            const coords = getEdgeCoordinates(graphData, edge.source, edge.target);
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
        if (
          event.sourceEvent.type === "mouseup" &&
          event.sourceEvent.detail === 1
        ) {
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
        const minSize = 10; // 최소 크기

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
    const markerSize = Math.min(Math.max(5 / Math.sqrt(viewBox.scale), 3), 15);
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5) // refX 값을 10으로 변경하여 화살표를 선과 떨어뜨림
      .attr("refY", 5)
      .attr("markerWidth", markerSize)
      .attr("markerHeight", markerSize)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 Z")
      .attr("fill", "#0078d4");
    // 엣지 데이터로부터 양방향 여부를 확인하는 함수
    const isBidirectional = (edges, source, target) =>
      edges.some((e) => e.source === target && e.target === source);

    // 오프셋된 경로를 생성하는 함수
    const createCurvedPath = (d, isReverse = false) => {
      const {
        x1: sourceX,
        y1: sourceY,
        x2: targetX,
        y2: targetY,
      } = getEdgeCoordinates(graphData, d.source, d.target);

      // 두 점을 이은 선분에 수직인 방향 계산
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      // 오프셋 거리 (엣지 간격)
      const offset = 3;

      // 시작점과 끝점을 오프셋
      const offsetX = nx * offset * (isReverse ? -1 : 1);
      const offsetY = ny * offset * (isReverse ? -1 : 1);

      // 중간점 계산 (곡률 추가)
      const midX = (sourceX + targetX) / 2 + offsetX * 4; // 곡률을 조정하는 부분
      const midY = (sourceY + targetY) / 2 + offsetY * 4;

      // Quadratic Bezier Curve를 사용해 곡선을 생성
      return `M ${sourceX + offsetX} ${sourceY + offsetY} Q ${midX} ${midY} ${targetX + offsetX
        } ${targetY + offsetY}`;
    };

    // 직선 경로를 생성하는 함수 (단방향 엣지를 위한)
    const createStraightPath = (d) => {
      const {
        x1: sourceX,
        y1: sourceY,
        x2: targetX,
        y2: targetY,
      } = getEdgeCoordinates(graphData, d.source, d.target);

      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    };

    // 엣지 그룹 생성 및 데이터 바인딩
    const edgeLines = edgeGroup
      .selectAll(".edge-group")
      .data(graphData.edges)
      .enter()
      .append("g")
      .attr("class", "edge-group");

    // 클릭 가능한 넓은 영역 (투명)
    edgeLines
      .append("path")
      .attr("class", "edge-hit-area")
      .attr("d", (d) => {
        const isBi = isBidirectional(graphData.edges, d.source, d.target);
        // 양방향 엣지인 경우만 곡선 경로를 사용하고, 단방향은 직선 경로
        return isBi ? createCurvedPath(d) : createStraightPath(d);
      })
      .attr("stroke", "transparent")
      .attr("stroke-width", 20)
      .attr("fill", "none")
      .style("cursor", "pointer");

    // 실제 표시되는 엣지 라인
    edgeLines
      .append("path")
      .attr("class", "edge")
      .attr("d", (d) => {
        const isBi = isBidirectional(graphData.edges, d.source, d.target);
        // 양방향 엣지인 경우만 곡선 경로를 사용하고, 단방향은 직선 경로
        return isBi ? createCurvedPath(d) : createStraightPath(d);
      })
      .attr("stroke", "#0078d4")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .style("cursor", "pointer")
      .attr("marker-end", "url(#arrowhead)");

    // 엣지 클릭 이벤트
    edgeLines.select(".edge-hit-area").on("click", (event, edge) => {
      event.stopPropagation();
      setSelectedEdge(edge);
      setIsLabelPopupOpen(true);
      setSelectedSymbol(true);
      setSelectedNode(null);
      svg.selectAll(".resize-handle").attr("opacity", 0);
    });

    // 사각형 노드 그리기
    // eslint-disable-next-line
    const rectangleNodes = nodeGroup
      .selectAll("rect")
      .data(graphData.nodes.filter((d) => d.properties.label !== "Joint")) // Joint 노드 필터링
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
      .attr("r", (d) =>
        d.properties.label === "Joint" ? getRadius(d) * 2 : getRadius(d)
      )
      .attr("fill", (d) =>
        d.properties.label === "Joint" ? "#ffa500" : "#0078d4"
      )
      .attr("stroke", (d) => (d.properties.label === "Joint" ? "none" : "#333"))
      .attr("stroke-width", (d) => (d.properties.label === "Joint" ? 0 : 2))
      .attr("pointer-events", "all")
      .attr("cursor", "move")
      .call(nodeDrag);

    // 노드 이름 텍스트 추가 (Joint 제외)
    nodeGroup
      .selectAll("text")
      .data(graphData.nodes.filter((d) => d.properties.label !== "Joint")) // Joint 노드 필터링
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

    const handleSize = Math.max(
      5,
      Math.min(
        12,
        20 *
        (viewBox.width / 1000) *
        (viewBox.height / 1000) *
        (1 / viewBox.scale)
      )
    );

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
      .attr("width", d => d.properties.label === "Joint" ? 0 : handleSize)
      .attr("height", d => d.properties.label === "Joint" ? 0 : handleSize)
      .attr("fill", "#0078d4")
      .attr("opacity", 0)
      .attr("pointer-events", d => d.properties.label === "Joint" ? "none" : "all")
      .attr("cursor", d => {
        const cursors = [
          "nwse-resize", // 좌상단
          "nesw-resize", // 우상단
          "nesw-resize", // 좌하단
          "nwse-resize", // 우하단
        ];
        return cursors[d.cornerIndex];
      })
      .attr("x", d => {
        const corners = [
          d.position[0][0] - handleSize / 2,
          d.position[1][0] - handleSize / 2,
          d.position[0][0] - handleSize / 2,
          d.position[1][0] - handleSize / 2,
        ];
        return corners[d.cornerIndex];
      })
      .attr("y", d => {
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

    // 공통 이벤트 핸들러 함수들
    const handleNodeMouseEnter = (event, d) => {
      if (
        (isResizing && selectedNode !== d) ||
        isResizing ||
        isPanning ||
        isDrawing
      ) {
        return;
      }

      // 노드 opacity 조정
      svg
        .selectAll(".node, circle, text")
        .filter((nodeData) => nodeData !== d && nodeData !== selectedNode)
        .attr("opacity", 0.2);

      svg
        .selectAll(".node, circle")
        .filter((data) => data === d || data === selectedNode)
        .attr("opacity", 0.8);

      // 기타 요소 opacity 조정
      svg.selectAll(".edge-group").attr("opacity", 0.4);
      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
        .attr("opacity", 1);

      // 배경 이미지 어둡게
      svg
        .select(".background image")
        .transition()
        .duration(80)
        .attr("filter", "brightness(0.3)");

      // 텍스트 opacity
      svg
        .selectAll("text")
        .filter((data) => data === d || data === selectedNode)
        .attr("opacity", 1);

      // 툴팁 생성
      createTooltip(event, d);
    };

    const handleNodeMouseLeave = (event, d) => {
      if (!selectedNode || selectedNode !== d || isResizing || isDrawing) {
        // opacity 초기화
        svg.selectAll(".node").attr("opacity", nodeOpacity);
        svg.selectAll(".circle, circle, .edge-group, text").attr("opacity", 1);
        svg
          .selectAll(".resize-handle")
          .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
          .attr("opacity", 0);

        // 배경 밝기 복구
        svg
          .select(".background image")
          .transition()
          .duration(80)
          .attr("filter", `brightness(${bright})`);
      }

      // 툴팁 제거
      svg.selectAll(".tooltip").remove();
    };

    const createTooltip = (event, d) => {
      const [mouseX, mouseY] = d3.pointer(event);
      const tooltipGroup = svg
        .append("g")
        .attr("class", "tooltip")
        .style("pointer-events", "none");

      // 텍스트 요소 추가
      const textElement = tooltipGroup
        .append("text")
        .attr("x", mouseX + 15)
        .attr("y", mouseY + 25)
        .text(
          `${d.properties.label}${d.properties.text ? `, ${d.properties.text}` : ""
          }`
        )
        .style("fill", "#ffffff")
        .style(
          "font-size",
          `${Math.max(
            Math.sqrt(viewBox.width * viewBox.height) / 80, // 최소값
            Math.min(
              Math.sqrt(viewBox.width * viewBox.height) / 50, // 최대값
              (50 * Math.sqrt(viewBox.width * viewBox.height)) /
              2000 /
              (1 + Math.log(viewBox.scale + 1))
            )
          )}px`
        )
        .style("font-weight", "bold")
        .style("font-family", "Arial, sans-serif")
        .style("alignment-baseline", "middle");

      // 텍스트 크기 측정 및 배경 추가
      const textBBox = textElement.node().getBBox();
      tooltipGroup
        .insert("rect", "text")
        .attr("x", textBBox.x - 10)
        .attr("y", textBBox.y - 10)
        .attr("width", textBBox.width + 20)
        .attr("height", textBBox.height + 20)
        .attr("rx", 12)
        .attr("ry", 12)
        .style("fill", "rgba(0, 0, 0, 0.7)")
        .style("filter", "drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.5))");
    };

    // 이벤트 리스너 설정
    rectangleNodes
      .on("mouseenter", handleNodeMouseEnter)
      .on("mouseleave", handleNodeMouseLeave);

    circleNodes
      .on("mouseenter", handleNodeMouseEnter)
      .on("mouseleave", handleNodeMouseLeave);

    cornerHandles.on("mouseenter", function (event, d) {
      if (isResizing || isDrawing || d.properties.label === "Joint") return;
      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === d.nodeIndex)
        .attr("opacity", 1);
    });

    cornerHandles.on("mouseleave", function (event, d) {
      if (
        !selectedNode ||
        selectedNode !== d.name ||
        isResizing ||
        !isDrawing
      ) {
        svg
          .selectAll(".resize-handle")
          .filter(
            (handle) => !selectedNode || selectedNode.name !== handle.name
          )
          .attr("opacity", 0);
      }
    });
  }, [graphData, isResizing, selectedNode, bright, nodeOpacity, isCtrlPressed]);

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
    if (type === "edge") {
      // 엣지 업데이트
      setGraphData((prev) => ({
        ...prev,
        edges: prev.edges.map((edge) =>
          edge.name === selectedItem.name
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
        }, 50);
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
        }, 50);

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
    // 마우스를 누른 시점의 viewBox 위치도 저장
    setInitialViewBox(viewBox);
  };

  const handleMouseMove = useCallback(
    (event) => {
      if (!isPanning || selectTool === "drawing") return;

      const sensitivity = 0.3 * viewBox.scale;

      // 처음 마우스를 누른 위치부터의 전체 이동량 계산
      const dx = (event.clientX - startPoint.x) / sensitivity;
      const dy = (event.clientY - startPoint.y) / sensitivity;

      // 초기 viewBox 위치에서 전체 이동량을 적용
      setViewBox({
        ...initialViewBox,
        x: initialViewBox.x - dx,
        y: initialViewBox.y - dy,
      });
    },
    [isPanning, selectTool, startPoint, initialViewBox]
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
      .duration(80);

    if (selectTool === "visible") {
      updateSelection.style("opacity", 0).style("pointer-events", "none");
    } else if (selectTool !== "visible") {
      // 최적화된 업데이트 로직
      svg.selectAll("circle").transition().duration(80).style("opacity", 1);

      svg
        .selectAll(".node")
        .transition()
        .duration(80)
        .style("opacity", nodeOpacity)
        .style("pointer-events", "auto");

      const otherElements = svg.selectAll(".edge-group, text");
      otherElements
        .transition()
        .duration(80)
        .style("opacity", 1)
        .style("pointer-events", "auto");
    }
  }, [selectTool, nodeOpacity]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // 엣지 스타일 설정을 위한 유틸리티 함수들
    const resetAllEdges = () => {
      svg
        .selectAll(".edge-group .edge")
        .attr("opacity", 1)
        .attr("stroke-width", 2);
    };

    const highlightSelectedEdge = () => {
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
    };

    const dimAllEdges = () => {
      svg.selectAll(".edge-group .edge").attr("opacity", 0.4);
    };

    const createEdgeTooltip = (event, d) => {
      const [mouseX, mouseY] = d3.pointer(event);
      const tooltipGroup = svg
        .append("g")
        .attr("class", "tooltip")
        .style("pointer-events", "none");

      // 툴팁 텍스트 (여기서 필요한 정보를 표시)
      const tooltipText = d.properties?.line_no;
      if (!tooltipText) return;
      const textElement = tooltipGroup
        .append("text")
        .attr("x", mouseX + 15)
        .attr("y", mouseY + 25)
        .text(tooltipText)
        .style("fill", "#ffffff")
        .style(
          "font-size",
          `${Math.max(
            Math.sqrt(viewBox.width * viewBox.height) / 80, // 최소값
            Math.min(
              Math.sqrt(viewBox.width * viewBox.height) / 50, // 최대값
              (50 * Math.sqrt(viewBox.width * viewBox.height)) /
              2000 /
              (1 + Math.log(viewBox.scale + 1))
            )
          )}px`
        )
        .style("font-weight", "bold")
        .style("font-family", "Arial, sans-serif")
        .style("alignment-baseline", "middle");

      // 배경 사각형 추가
      const textBBox = textElement.node().getBBox();
      tooltipGroup
        .insert("rect", "text")
        .attr("x", textBBox.x - 10)
        .attr("y", textBBox.y - 10)
        .attr("width", textBBox.width + 20)
        .attr("height", textBBox.height + 20)
        .attr("rx", 12)
        .attr("ry", 12)
        .style("fill", "rgba(0, 0, 0, 0.7)")
        .style("filter", "drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.5))");
    };

    const removeTooltip = () => {
      svg.selectAll(".tooltip").remove();
    };

    // 초기 상태 설정
    resetAllEdges();
    highlightSelectedEdge();

    // 마우스 이벤트 핸들러
    const handleMouseEnter = (event, d) => {
      dimAllEdges();
      const currentEdge = d3.select(event.currentTarget).select(".edge");
      currentEdge.attr("opacity", 1).attr("stroke-width", 4);
      createEdgeTooltip(event, d);
    };

    const handleMouseLeave = () => {
      resetAllEdges();
      highlightSelectedEdge();
      removeTooltip();
    };

    // 이벤트 리스너 설정
    svg
      .selectAll(".edge-group")
      .on("mouseenter", handleMouseEnter)
      .on("mouseleave", handleMouseLeave);

    // Cleanup 함수
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

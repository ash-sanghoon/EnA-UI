import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import data from "./data";
import LabelSelectorPopup from "../modals/ClassEditModal";

const GraphVisualization = ({
  selectTool,
  setSelectTool,
  setSelectedSymbol,
  selectedEdge,
  setSelectedEdge,
  bright,
  nodeOpacity,
}) => {
  const [graphData, setGraphData] = useState(JSON.parse(JSON.stringify(data)));
  const [selectedNode, setSelectedNode] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isConnecting, setisConnecting] = useState(false);
  const [target, setTarget] = useState(null);
  const [target2, setTarget2] = useState(null);
  const [rectangle, setRectangle] = useState(null);
  const [isLabelPopupOpen, setIsLabelPopupOpen] = useState(false);
  const svgRef = useRef(null);
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
  });

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
    setIsLabelPopupOpen(selectedNode);
  }, [selectedNode]);

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
        setisConnecting(false);
        setSelectTool(null);
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
      const newEdge = {
        name: `Edge${graphData.edges.length + 1}`,
        properties: {
          type: edgeType,
        },
        source: processedNodes[0].name,
        target: processedNodes[1].name,
      };

      setGraphData((prev) => ({
        ...prev,
        edges: [...prev.edges, newEdge],
      }));

      // 상태 초기화
      finalizeConnection();
    }
  }, [target, target2, isConnecting, graphData.edges, setSelectTool]);

  // 노드의 중심점 계산
  const getCenter = (node) => {
    const [topLeft, bottomRight] = node.position;
    return [
      (topLeft[0] + bottomRight[0]) / 2,
      (topLeft[1] + bottomRight[1]) / 2,
    ];
  };

  // 노드의 반지름 계산
  const getRadius = (node) =>
    Math.min(
      (node.position[1][0] - node.position[0][0]) / 4,
      (node.position[1][1] - node.position[0][1]) / 4
    );

  // 엣지 좌표 계산
  const getEdgeCoordinates = (source, target) => {
    const sourceNode = graphData.nodes.find((node) => node.name === source);
    const targetNode = graphData.nodes.find((node) => node.name === target);
    const sourceRadius = getRadius(sourceNode);
    const targetRadius = getRadius(targetNode);

    const sourceCenter = getCenter(sourceNode);
    const targetCenter = getCenter(targetNode);

    const [dx, dy] = [
      targetCenter[0] - sourceCenter[0],
      targetCenter[1] - sourceCenter[1],
    ];
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 거리 비율을 계산하여 선이 노드와 겹치지 않게 함
    const padding = 4;
    const targetPaddingAdjustment = 1.5; // 타겟 노드 쪽의 간격을 더 크게 조정
    const scaleSource = (sourceRadius + padding) / distance;
    const scaleTarget =
      (targetRadius + padding * targetPaddingAdjustment) / distance;

    return {
      x1: sourceCenter[0] + dx * scaleSource,
      y1: sourceCenter[1] + dy * scaleSource,
      x2: targetCenter[0] - dx * scaleTarget,
      y2: targetCenter[1] - dy * scaleTarget,
    };
  };

  useEffect(() => {
    const updateImageSize = () => {
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 화면 비율에 맞춰 이미지 비율을 조정
        const widthRatio = windowWidth / originalWidth;
        const heightRatio = windowHeight / originalHeight;
        const scale = Math.min(widthRatio, heightRatio, 1); // 1배 이하로만 조정

        const adjustedWidth = originalWidth * scale;
        const adjustedHeight = originalHeight * scale;

        // height를 줄이기 위해 비율 조정
        const reducedHeight = adjustedHeight * 0.85; // 20% 줄이기 (원하는 비율로 조정 가능)

        setImageSize({ width: adjustedWidth, height: reducedHeight });
        setViewBox({
          width: 2988.9929933117746,
          height: 1992.661995541183,
          scale: 1.0036825133792067,
          x: 4.839749444749193,
          y: 2.0158355665926067,
        });
      };
      img.src = "/images/sample.png";
    };

    updateImageSize(); // 초기화 시 한 번 실행
    window.addEventListener("resize", updateImageSize); // 화면 크기 변경 시 실행

    return () => {
      window.removeEventListener("resize", updateImageSize); // 클린업
    };
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const backgroundGroup = svg.append("g").attr("class", "background");
    const edgeGroup = svg.append("g").attr("class", "edges");
    const nodeGroup = svg.append("g").attr("class", "nodes");

    svg.on("click", (event) => {
      if (!event.target.closest(".nodes")) {
        setSelectedNode(null);
        setSelectedEdge(null);
        setSelectedSymbol(false);
        svg.selectAll(".resize-handle").attr("opacity", 0); // 모든 핸들 숨기기
      }
    });

    // Background image
    backgroundGroup
      .append("image")
      .attr("href", "/images/sample.png")
      .attr("width", 3000)
      .attr("height", 2000)
      .attr("opacity", 1)
      .attr("filter", `brightness(${bright})`);

    // 노드 이동 드래그 행동 생성
    const nodeDrag = d3
      .drag()
      .on("start", (event, d) => {
        if (!event.active) {
          setIsResizing(true);
          // selectNode(event, d);
          setIsLabelPopupOpen(true);
        }
      })
      .on("end", (event, d) => {
        setIsResizing(false);
        // 클릭 이벤트 로직 추가 (드래그가 아닌 경우)
        if (
          event.sourceEvent.type === "mouseup" &&
          event.sourceEvent.detail === 1
        ) {
          selectNode(event, d);
          setIsLabelPopupOpen(true);
        }
      })
      .on("drag", (event, d) => {
        const svg = svgRef.current;
        const point = svg.createSVGPoint();
        point.x = event.sourceEvent.clientX;
        point.y = event.sourceEvent.clientY;
        const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

        // 기존 노드의 크기 유지
        const nodeWidth = d.position[1][0] - d.position[0][0];
        const nodeHeight = d.position[1][1] - d.position[0][1];

        // 이전 노드 중심점 계산
        const prevCenter = [
          (d.position[0][0] + d.position[1][0]) / 2,
          (d.position[0][1] + d.position[1][1]) / 2,
        ];

        // 새로운 중심점 계산
        const newCenter = [svgPoint.x, svgPoint.y];

        // 중심점 이동 계산
        const newTopLeft = [
          newCenter[0] - nodeWidth / 2,
          newCenter[1] - nodeHeight / 2,
        ];

        // 노드 위치 업데이트
        d.position = [
          newTopLeft,
          [newTopLeft[0] + nodeWidth, newTopLeft[1] + nodeHeight],
        ];

        // 그래프 다시 그리기
        setGraphData({ ...graphData });
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
      })
      .on("end", (event, d) => {
        setIsResizing(false);
        delete d.startPosition; // 임시 좌표 삭제
        delete d.minReachedPositionX; // x축 최소 크기 좌표 삭제
        delete d.minReachedPositionY; // y축 최소 크기 좌표 삭제
        delete d.startSvgPoint; // 시작 SVG 포인트 삭제
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
      .attr("x", (d) => d.position[0][0])
      .attr("y", (d) => d.position[0][1])
      .attr("width", (d) => d.position[1][0] - d.position[0][0])
      .attr("height", (d) => d.position[1][1] - d.position[0][1])
      .attr("fill", "#fff")
      .attr("opacity", nodeOpacity)
      // .attr("stroke", "#333")
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
    const handleSize = 10;
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

      svg
        .selectAll(".node")
        .filter((nodeData) => selectedNode !== d && nodeData !== d) // .node 필터 적용
        .attr("opacity", nodeOpacity - 0.2)

      svg
        .selectAll("circle")
        .filter((circleData) => selectedNode !== d && circleData !== d) // circle 필터 적용
        .attr("opacity", 0.4);

      svg.selectAll(".edge-group").attr("opacity", 0.4);

      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
        .attr("opacity", 1);
    });

    circleNodes.on("mouseenter", function (event, d) {
      if ((isResizing && selectedNode !== d) || isResizing) {
        return;
      }

      svg
        .selectAll(".node")
        .filter((nodeData) => selectedNode !== d && nodeData !== d) // .node 필터 적용
        .attr("opacity", nodeOpacity - 0.2)

      svg
        .selectAll("circle")
        .filter((circleData) => selectedNode !== d && circleData !== d) // circle 필터 적용
        .attr("opacity", 0.4);

      svg.selectAll(".edge-group").attr("opacity", 0.4);

      svg
        .selectAll(".resize-handle")
        .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
        .attr("opacity", 1);
    });

    rectangleNodes.on("mouseleave", function (event, d) {
      if (!selectedNode || selectedNode !== d || isResizing) {
        svg.selectAll(".node").attr("opacity", nodeOpacity); // node는 변수 사용
        svg.selectAll(".circle, circle, .edge-group").attr("opacity", 1); // 다른 요소는 직접 값 설정
        svg
          .selectAll(".resize-handle")
          .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
          .attr("opacity", 0); // 숨김 상태는 0으로 설정
      }
    });

    circleNodes.on("mouseleave", function (event, d) {
      if (!selectedNode || selectedNode !== d || isResizing) {
        svg.selectAll(".node").attr("opacity", nodeOpacity); // node는 변수 사용
        svg.selectAll(".circle, circle, .edge-group").attr("opacity", 1); // 다른 요소는 직접 값 설정
        svg
          .selectAll(".resize-handle")
          .filter((handle) => handle.nodeIndex === graphData.nodes.indexOf(d))
          .attr("opacity", 0); // 숨김 상태는 0으로 설정
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
  }, [graphData, isResizing, selectedNode, bright, nodeOpacity]);

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

  const handleLabelSelect = (label, selectedNode) => {
    if (selectedNode) {
      // selectedNode가 있을 경우 label만 변경
      setGraphData((prev) => ({
        ...prev,
        nodes: prev.nodes.map((node) =>
          node.name === selectedNode.name
            ? { ...node, properties: { label } } // label만 업데이트
            : node
        ),
      }));
    } else {
      // selectedNode가 없으면 새로운 노드를 추가
      const topLeft = [
        Math.min(rectangle.x1, rectangle.x2),
        Math.min(rectangle.y1, rectangle.y2),
      ];
      const bottomRight = [
        Math.max(rectangle.x1, rectangle.x2),
        Math.max(rectangle.y1, rectangle.y2),
      ];

      const newNode = {
        name: `node${graphData.nodes.length + 1}`,
        position: [topLeft, bottomRight],
        properties: { label },
      };

      setGraphData((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));
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

        setGraphData((prevData) => ({
          ...prevData,
          nodes: updatedNodes,
          edges: updatedEdges,
        }));
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
        setGraphData((prevData) => ({
          ...prevData,
          edges: updatedEdges,
        }));
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

  const handleMouseMove = (event) => {
    if (isPanning && selectTool !== "drawing" && selectTool !== "connecting") {
      // 스케일과 무관하게 일정한 드래그 민감도 유지
      const dx = (event.clientX - startPoint.x) * 1.3;
      const dy = (event.clientY - startPoint.y) * 1.3;

      setViewBox((prev) => ({
        ...prev,
        x: prev.x - dx / prev.scale,
        y: prev.y - dy / prev.scale,
      }));

      setStartPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (event) => {
    // 컨트롤 키를 누르지 않았다면 줌 동작 무시
    if (!isCtrlPressed) return;
    const svgElement = svgRef.current;
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;

    const pointX = viewBox.x + (mouseX / svgRect.width) * viewBox.width;
    const pointY = viewBox.y + (mouseY / svgRect.height) * viewBox.height;

    // (위로 스크롤하면 확대, 아래로 스크롤하면 축소)
    const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
    const newScale = viewBox.scale * scaleFactor;

    const constrainedScale = Math.max(0.1, Math.min(newScale, 10));

    const newWidth = 3000 / constrainedScale;
    const newHeight = 2000 / constrainedScale;

    const newX = pointX - (mouseX / svgRect.width) * newWidth;
    const newY = pointY - (mouseY / svgRect.height) * newHeight;

    setViewBox((prev) => ({
      width: newWidth,
      height: newHeight,
      scale: constrainedScale,
      x: newX,
      y: newY,
    }));
  };

  useEffect(() => {
    if (selectTool === "drawing") {
      setIsDrawing(!isDrawing);
      setIsLabelPopupOpen(false);
      setisConnecting(false);
      setTarget(null);
      setTarget2(null);
      setSelectedNode(null);
      setSelectedEdge(null);
      setSelectedSymbol(null);
    }

    if (selectTool === "connecting") {
      setisConnecting(!isConnecting);
      setSelectedEdge(null);
      setIsDrawing(false);
    }

    if (selectTool === "remove") {
      handleRemoveNode();
      setTarget(null);
    }

    if (selectTool === "invisible") {
      const svg = d3.select(svgRef.current);
      svg
        .selectAll(".node, circle")
        .transition()
        .duration(150)
        .style("opacity", 0)
        .style("pointer-events", "none");
      svg
        .selectAll(".edge-group")
        .transition()
        .duration(150)
        .style("opacity", 0)
        .style("pointer-events", "none");

      svg
        .selectAll(".resize-handle")
        .transition()
        .duration(150)
        .style("opacity", 0)
        .style("pointer-events", "none");

      svg
        .selectAll("text")
        .transition()
        .duration(150)
        .style("opacity", 0)
        .style("pointer-events", "none");
    }

    if (selectTool === "visible") {
      const svg = d3.select(svgRef.current);
      svg.selectAll("circle").transition().duration(150).style("opacity", 1);
      svg
        .selectAll(".node")
        .transition()
        .duration(150)
        .style("opacity", nodeOpacity)
        .style("pointer-events", "auto");
      svg
        .selectAll(".edge-group")
        .transition()
        .duration(150)
        .style("opacity", 1)
        .style("pointer-events", "auto");
      svg
        .selectAll(".resize-handle")
        .transition()
        .duration(150)
        .style("opacity", 1)
        .style("pointer-events", "auto");
      svg
        .selectAll("text")
        .transition()
        .duration(150)
        .style("opacity", 1)
        .style("pointer-events", "auto");
    }
  }, [selectTool]);

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
        svg.selectAll(".edge-group .edge").attr("opacity", 0.4);

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
    <div className="w-[62vw] h-[85vh] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
      {/* <img
        ref={imageRef}
        src="/images/sample.png"
        style={{ display: "none" }}
        alt="Background"
      /> */}

      {/* <button
        onClick={() => {
          setIsDrawing(!isDrawing);
          setIsLabelPopupOpen(false);
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        style={{ position: "absolute" }}
      >
        {isDrawing ? "Stop Drawing" : "Start Drawing"}
      </button> */}

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
          cursor: isDrawing ? "crosshair" : isPanning ? "grabbing" : "grab",
        }}
      >
        {/* Image as SVG background */}
        {/* <image
          href="/images/sample.png"
          x="0"
          y="0"
          width={imageSize.width}
          height={imageSize.height}
        /> */}

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

import * as d3 from "d3";

const getEdgeCoordinates = (graphData, source, target) => {
    const sourceNode = graphData.nodes.find((node) => node.name === source);
    const targetNode = graphData.nodes.find((node) => node.name === target);

    if (!sourceNode || !targetNode) {
        console.warn(`Missing node: source=${source}, target=${target}`);
        return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }

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

// 노드의 중심점 계산
const getCenter = node => {
    const [topLeft, bottomRight] = node.position;
    return [
        (topLeft[0] + bottomRight[0]) / 2,
        (topLeft[1] + bottomRight[1]) / 2,
    ];
};

const getRadius = node => {
    const [topLeft, bottomRight] = node.position;
    return Math.max(
        0,
        Math.min(
            Math.abs(bottomRight[0] - topLeft[0]) / 4,
            Math.abs(bottomRight[1] - topLeft[1]) / 4
        )
    );
};

const handleHoverEffect = (svgRef, hoverClass, graphData, nodeOpacity) => {
    if (!svgRef.current || hoverClass === null) return;

    const svg = d3.select(svgRef.current);
    const matchingNodes = graphData.nodes.filter(
        node => node.properties?.label === hoverClass ||
            node.properties?.line_no === hoverClass
    );
    const matchingNodeNames = matchingNodes.map(node => node.name);

    svg.selectAll(".node, text, circle")
        .transition()
        .duration(80)
        .attr("opacity", d => matchingNodeNames.includes(d?.name) ? 1 : 0.2);
};

// 엣지 opacity 핸들러
const handleEdgeOpacityEffect = (svgRef, hoverClass, graphData) => {
    if (!svgRef.current || hoverClass === null) return;

    const svg = d3.select(svgRef.current);
    const matchingEdges = graphData.edges.filter(
        edge => edge.properties?.line_no === hoverClass
    );
    const matchingEdgePairs = matchingEdges.map(edge => ({
        source: edge.source,
        target: edge.target
    }));

    svg.selectAll(".edge-group")
        .transition()
        .duration(80)
        .style("opacity", d => {
            const isMatching = matchingEdgePairs.some(
                pair => (pair.source === d.source && pair.target === d.target) ||
                    (pair.source === d.target && pair.target === d.source)
            );
            return isMatching ? 1 : 0.2;
        });
};

// 노드 호버 레이블 핸들러 
const handleNodeHoverLabel = (svgRef, hoverClass, graphData, viewBox) => {
    if (!svgRef.current || hoverClass === null) return;

    const svg = d3.select(svgRef.current);

    // 기존 호버 레이블 제거
    svg.selectAll(".hover-label").remove();

    const matchingNodes = graphData.nodes.filter(
        node => node.properties?.label === hoverClass ||
            node.properties?.line_no === hoverClass
    );

    matchingNodes.forEach(node => {
        const topRight = [node.position[0][0], node.position[0][1]];

        // 텍스트 레이블 추가
        const label = svg.append("text")
            .attr("class", "hover-label")
            .attr("x", topRight[0])
            .attr("y", topRight[1] - 15)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "baseline")
            .attr("pointer-events", "none")
            .style("opacity", 0)
            .text(hoverClass);

        // 텍스트 스타일링
        label
            .style("font-family", "'Pretendard', system-ui, sans-serif")
            .style("font-weight", "600") // 조금 더 두껍게
            .style("font-size", calculateFontSize(viewBox))
            .style("fill", "#ffffff")  // 밝은 흰색
            .style("stroke", "rgba(0, 0, 0, 0.8)") // 검은색 외곽선
            .style("stroke-width", "1.5px")
            .style("paint-order", "stroke fill")
            .style("letter-spacing", "0.03em") // 적당한 자간
            .style("text-shadow", "0 1px 3px rgba(0, 0, 0, 0.5)"); // 더 부드러운 그림자

        // 페이드인 애니메이션
        label.transition()
            .duration(100) // 애니메이션 속도 더 빠르게
            .style("opacity", 1);
    });
};

// 뷰박스 크기에 따른 폰트 크기 계산
const calculateFontSize = (viewBox) => {
    const baseSize = Math.sqrt(viewBox.width * viewBox.height) / 80;
    const maxSize = Math.sqrt(viewBox.width * viewBox.height) / 50;
    const scaledSize = (50 * Math.sqrt(viewBox.width * viewBox.height)) / 2000 / (1 + Math.log(viewBox.scale + 1));

    return `${Math.max(baseSize, Math.min(maxSize, scaledSize))}px`;
};

// 엣지 호버 레이블 핸들러
const handleEdgeHoverLabel = (svgRef, hoverClass, graphData, viewBox) => {
    if (!svgRef.current || hoverClass === null) return;

    const svg = d3.select(svgRef.current);
    const matchingEdges = graphData.edges.filter(
        edge => edge.properties?.line_no === hoverClass
    );

    matchingEdges.forEach(edge => {
        const sourceNode = graphData.nodes.find(n => n.name === edge.source);
        const targetNode = graphData.nodes.find(n => n.name === edge.target);

        if (!sourceNode || !targetNode) return;

        const sourceMidX = sourceNode.position.reduce((sum, pos) => sum + pos[0], 0) / sourceNode.position.length;
        const sourceMidY = sourceNode.position.reduce((sum, pos) => sum + pos[1], 0) / sourceNode.position.length;
        const targetMidX = targetNode.position.reduce((sum, pos) => sum + pos[0], 0) / targetNode.position.length;
        const targetMidY = targetNode.position.reduce((sum, pos) => sum + pos[1], 0) / targetNode.position.length;

        const midX = (sourceMidX + targetMidX) / 2;
        const midY = (sourceMidY + targetMidY) / 2;

        let degrees = Math.atan2(targetMidY - sourceMidY, targetMidX - sourceMidX) * (180 / Math.PI);
        if (degrees > 90 || degrees < -90) {
            degrees += 180;
        }

        svg.append("text")
            .attr("class", "hover-label")
            .attr("x", midX)
            .attr("y", midY - 10)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .attr("font-size", `${Math.min(35, 45 / viewBox.scale)}px`)
            .attr("pointer-events", "none")
            .text(hoverClass)
            .attr("transform", `rotate(${degrees}, ${midX}, ${midY})`);
    });
};

// 배경 밝기 핸들러
const handleBackgroundBrightness = (svgRef, hoverClass, bright) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    svg.select(".background image")
        .transition()
        .duration(80)
        .attr("filter", hoverClass !== null ? "brightness(0.3)" : `brightness(${bright})`);
};

// 노드가 Joint인지 확인하는 함수
const isJointNode = (node) => {
    const label = node.properties.label.toLowerCase();
    return label === "joint" || label === "__joint__";
};

export { getEdgeCoordinates, getCenter, getRadius, handleHoverEffect, handleEdgeOpacityEffect, handleNodeHoverLabel, handleEdgeHoverLabel, handleBackgroundBrightness, isJointNode };
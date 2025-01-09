const getEdgeCoordinates = (graphData, source, target) => {
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

const handleHoverEffect = (svg, hoverClass, graphData, nodeOpacity, bright, viewBox) => {
    if (hoverClass !== null) {
        const matchingNodes = graphData.nodes.filter(
            (node) =>
                node.properties?.label === hoverClass ||
                node.properties?.line_no === hoverClass
        );
        const matchingEdges = graphData.edges.filter(
            (edge) => edge.properties?.line_no === hoverClass
        );

        const matchingNodeNames = matchingNodes.map((node) => node.name);
        const matchingEdgePairs = matchingEdges.map((edge) => ({
            source: edge.source,
            target: edge.target,
        }));

        applyNodeHighlight(svg, matchingNodeNames);
        applyEdgeHighlight(svg, matchingEdgePairs);
        removeExistingLabels(svg);
        addNodeLabels(svg, matchingNodes, viewBox, hoverClass);
        addEdgeLabels(svg, matchingEdges, graphData, viewBox, hoverClass);
        adjustBackgroundBrightness(svg, 0.3);
    } else {
        resetGraphState(svg, nodeOpacity, bright);
    }
};

const applyNodeHighlight = (svg, matchingNodeNames) => {
    svg
        .selectAll(".node, text, circle")
        .transition()
        .duration(80)
        .attr("opacity", (d) => matchingNodeNames.includes(d?.name) ? 1 : 0.2);
};

const applyEdgeHighlight = (svg, matchingEdgePairs) => {
    svg
        .selectAll(".edge-group")
        .transition()
        .duration(80)
        .style("opacity", (d) => {
            const isMatching = matchingEdgePairs.some(
                (pair) =>
                    (pair.source === d.source && pair.target === d.target) ||
                    (pair.source === d.target && pair.target === d.source)
            );
            return isMatching ? 1 : 0.2;
        });
};

const removeExistingLabels = (svg) => {
    svg.selectAll(".hover-label").remove();
};

const addNodeLabels = (svg, matchingNodes, viewBox, hoverClass) => {
    matchingNodes.forEach((node) => {
        const topRight = [node.position[0][0], node.position[0][1]];
        const fontSize = calculateNodeLabelFontSize(viewBox);

        svg
            .append("text")
            .attr("class", "hover-label")
            .attr("x", topRight[0])
            .attr("y", topRight[1] - 15)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "baseline")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .attr("font-size", `${fontSize}px`)
            .attr("pointer-events", "none")
            .text(hoverClass);
    });
};

const calculateNodeLabelFontSize = (viewBox) => {
    return Math.max(
        Math.sqrt(viewBox.width * viewBox.height) / 80,
        Math.min(
            Math.sqrt(viewBox.width * viewBox.height) / 50,
            (50 * Math.sqrt(viewBox.width * viewBox.height)) /
            2000 /
            (1 + Math.log(viewBox.scale + 1))
        )
    );
};

const addEdgeLabels = (svg, matchingEdges, graphData, viewBox, hoverClass) => {
    matchingEdges.forEach((edge) => {
        const { midX, midY, degrees } = calculateEdgeProperties(edge, graphData);

        if (midX !== undefined && midY !== undefined) {
            svg
                .append("text")
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
        }
    });
};

const calculateEdgeProperties = (edge, graphData) => {
    const sourceNode = graphData.nodes.find((n) => n.name === edge.source);
    const targetNode = graphData.nodes.find((n) => n.name === edge.target);

    if (!sourceNode || !targetNode) return {};

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

    return { midX, midY, degrees };
};

const adjustBackgroundBrightness = (svg, brightness) => {
    svg
        .select(".background image")
        .transition()
        .duration(80)
        .attr("filter", `brightness(${brightness})`);
};

const resetGraphState = (svg, nodeOpacity, bright) => {
    svg
        .selectAll(".node, text, circle")
        .transition()
        .duration(80)
        .attr("opacity", nodeOpacity);

    svg
        .selectAll(".edge-group")
        .transition()
        .duration(80)
        .style("opacity", 1);

    removeExistingLabels(svg);
    adjustBackgroundBrightness(svg, bright);
};

// 배경 설정
const setupBackground = () => {
    const svg = d3.select(svgRef.current);
    const backgroundGroup = svg.append("g").attr("class", "background");

    backgroundGroup
        .append("image")
        .attr("href", imgURL)
        .attr("opacity", 1)
        .attr("filter", `brightness(${bright})`);
};

// 엣지 설정
const setupEdges = () => {
    const svg = d3.select(svgRef.current);
    const edgeGroup = svg.append("g").attr("class", "edges");

    const markerSize = Math.min(Math.max(5 / Math.sqrt(viewBox.scale), 3), 15);
    svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", markerSize)
        .attr("markerHeight", markerSize)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 Z")
        .attr("fill", "#0078d4");

    const edgeLines = edgeGroup
        .selectAll(".edge-group")
        .data(graphData.edges)
        .enter()
        .append("g")
        .attr("class", "edge-group");

    edgeLines
        .append("path")
        .attr("class", "edge-hit-area")
        .attr("d", d => createPath(d, graphData.edges))
        .attr("stroke", "transparent")
        .attr("stroke-width", 20)
        .attr("fill", "none")
        .style("cursor", "pointer");

    edgeLines.select(".edge-hit-area").on("click", (event, edge) => {
        event.stopPropagation();
        setSelectedEdge(edge);
        setIsLabelPopupOpen(true);
        setSelectedSymbol(true);
        setSelectedNode(null);
        svg.selectAll(".resize-handle").attr("opacity", 0);
    });
};

// 노드 설정
const setupNodes = () => {
    const svg = d3.select(svgRef.current);
    const nodeGroup = svg.append("g").attr("class", "nodes");

    const rectangleNodes = nodeGroup
        .selectAll("rect")
        .data(graphData.nodes.filter(d => d.properties.label !== "Joint"))
        .enter()
        .append("rect")
        .attr("class", "node")
        .attr("x", d => Math.min(d.position[0][0], d.position[1][0]))
        .attr("y", d => Math.min(d.position[0][1], d.position[1][1]))
        .attr("width", d => Math.abs(d.position[1][0] - d.position[0][0]))
        .attr("height", d => Math.abs(d.position[1][1] - d.position[0][1]))
        .attr("fill", "#fff")
        .attr("opacity", nodeOpacity)
        .attr("cursor", "move")
        .call(nodeDrag);

    const circleNodes = nodeGroup
        .selectAll("circle")
        .data(graphData.nodes)
        .enter()
        .append("circle")
        .attr("cx", d => getCenter(d)[0])
        .attr("cy", d => getCenter(d)[1])
        .attr("r", d => d.properties.label === "Joint" ? getRadius(d) * 2 : getRadius(d))
        .attr("fill", d => d.properties.label === "Joint" ? "#ffa500" : "#0078d4")
        .attr("stroke", d => d.properties.label === "Joint" ? "none" : "#333")
        .attr("stroke-width", d => d.properties.label === "Joint" ? 0 : 2)
        .attr("cursor", "move")
        .call(nodeDrag);

    nodeGroup
        .selectAll("text")
        .data(graphData.nodes.filter(d => d.properties.label !== "Joint"))
        .enter()
        .append("text")
        .attr("x", d => getCenter(d)[0])
        .attr("y", d => getCenter(d)[1])
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => d.properties.label)
        .style("font-size", d =>
            `${Math.min(
                (d.position[1][0] - d.position[0][0]) / 9,
                (d.position[1][1] - d.position[0][1]) / 9
            )}px`
        )
        .style("font-family", "Arial")
        .style("fill", "white");

    rectangleNodes
        .on("mouseenter", handleNodeMouseEnter)
        .on("mouseleave", handleNodeMouseLeave);

    circleNodes
        .on("mouseenter", handleNodeMouseEnter)
        .on("mouseleave", handleNodeMouseLeave);
};

// 핸들 설정
const setupHandles = () => {
    const svg = d3.select(svgRef.current);
    const handleSize = Math.max(
        5,
        Math.min(12, 20 * (viewBox.width / 1000) * (viewBox.height / 1000) * (1 / viewBox.scale))
    );

    const cornerHandles = svg
        .select(".nodes")
        .selectAll(".resize-handle")
        .data(
            graphData.nodes.flatMap((node, nodeIndex) =>
                [0, 1, 2, 3].map(cornerIndex => ({
                    ...node,
                    cornerIndex,
                    nodeIndex
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
            const cursors = ["nwse-resize", "nesw-resize", "nesw-resize", "nwse-resize"];
            return cursors[d.cornerIndex];
        })
        .attr("x", d => {
            const corners = [
                d.position[0][0] - handleSize / 2,
                d.position[1][0] - handleSize / 2,
                d.position[0][0] - handleSize / 2,
                d.position[1][0] - handleSize / 2
            ];
            return corners[d.cornerIndex];
        })
        .attr("y", d => {
            const corners = [
                d.position[0][1] - handleSize / 2,
                d.position[0][1] - handleSize / 2,
                d.position[1][1] - handleSize / 2,
                d.position[1][1] - handleSize / 2
            ];
            return corners[d.cornerIndex];
        })
        .call(resizeDrag);

    cornerHandles.on("mouseenter", function (event, d) {
        if (isResizing || isDrawing || d.properties.label === "Joint") return;
        svg
            .selectAll(".resize-handle")
            .filter((handle) => handle.nodeIndex === d.nodeIndex)
            .attr("opacity", 1);
    });

    cornerHandles.on("mouseleave", function (event, d) {
        if (!selectedNode || selectedNode !== d.name || isResizing || !isDrawing) {
            svg
                .selectAll(".resize-handle")
                .filter((handle) => !selectedNode || selectedNode.name !== handle.name)
                .attr("opacity", 0);
        }
    });
};


export { getEdgeCoordinates, getCenter, getRadius, handleHoverEffect, setupBackground, setupEdges, setupNodes, setupHandles };
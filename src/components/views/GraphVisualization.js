import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

const GraphVisualization = () => {
  // Sample node and edge data
  const [nodes, setNodes] = useState([
    { id: 1, x: 500, y: 400, label: 'Node A', selected: false },
    { id: 2, x: 1500, y: 1200, label: 'Node B', selected: false },
    { id: 3, x: 2000, y: 600, label: 'Node C', selected: false }
  ]);

  const [edges, setEdges] = useState([
    { source: 1, target: 2, selected: false },
    { source: 2, target: 3, selected: false },
    { source: 3, target: 1, selected: false }
  ]);

  // State for viewBox and zoom
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 3000,
    height: 2000,
    scale: 1
  });

  const svgRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Background image
    svg.append('image')
      .attr('href', '/api/files/view/ec65b750-fe9e-46ad-80dc-ec12f3744ea1')
      .attr('width', 3000)
      .attr('height', 2000)
      .attr('opacity', 0.3);

    // Edge rendering
    const edgeGroup = svg.selectAll('.edge')
      .data(edges)
      .enter()
      .append('line')
      .attr('x1', d => nodes.find(n => n.id === d.source).x)
      .attr('y1', d => nodes.find(n => n.id === d.source).y)
      .attr('x2', d => nodes.find(n => n.id === d.target).x)
      .attr('y2', d => nodes.find(n => n.id === d.target).y)
      .attr('stroke', d => d.selected ? 'red' : 'black')
      .attr('stroke-width', 3)
      .on('click', (event, d) => {
        const updatedEdges = edges.map(edge => 
          edge.source === d.source && edge.target === d.target 
            ? {...edge, selected: !edge.selected}
            : edge
        );
        setEdges(updatedEdges);
      });

    // Node rendering with drag behavior
    const drag = d3.drag()
      .on('drag', (event, d) => {
        const updatedNodes = nodes.map(node => 
          node.id === d.id 
            ? {...node, x: event.x, y: event.y}
            : node
        );
        setNodes(updatedNodes);
      });

    const nodeGroup = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .call(drag);

    nodeGroup.append('rect')
      .attr('x', d => d.x - 50)
      .attr('y', d => d.y - 25)
      .attr('width', 100)
      .attr('height', 50)
      .attr('fill', d => d.selected ? 'lightblue' : 'white')
      .attr('stroke', 'black')
      .on('click', (event, d) => {
        const updatedNodes = nodes.map(node => 
          node.id === d.id 
            ? {...node, selected: !node.selected}
            : node
        );
        setNodes(updatedNodes);
      });

    nodeGroup.append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .text(d => d.label);

  }, [nodes, edges]);

  // Pan and Zoom Event Handlers
  const handleMouseDown = (event) => {
    if (event.ctrlKey) {
      setIsPanning(true);
      setStartPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event) => {
    if (isPanning && event.ctrlKey) {
      const dx = (event.clientX - startPoint.x) * viewBox.scale;
      const dy = (event.clientY - startPoint.y) * viewBox.scale;

      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }));

      setStartPoint({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (event) => {
    if (event.ctrlKey) {
      event.preventDefault();

      const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9;
      const newScale = viewBox.scale * scaleFactor;

      // Limit zoom levels
      const constrainedScale = Math.max(0.1, Math.min(newScale, 10));

      setViewBox(prev => ({
        ...prev,
        width: 3000 / constrainedScale,
        height: 2000 / constrainedScale,
        scale: constrainedScale,
        x: event.clientX - (3000 / (2 * constrainedScale)),
        y: event.clientY - (2000 / (2 * constrainedScale))
      }));
    }
  };

  return (
    <div>
      <svg 
        ref={svgRef} 
        width={3000} 
        height={2000}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ border: '1px solid black', cursor: 'grab' }}
      />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: 10 }}>
        Press Ctrl and:
        <br />- Drag to pan
        <br />- Scroll to zoom
      </div>
    </div>
  );
};

export default GraphVisualization;
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import * as d3 from "d3";

const Graph = ({ projectId, drawingId }) => {
   const [data, setData] = useState({drawings:[], edges:[]});
   const svgRef = useRef(null);
   
   useEffect(() => {
       const fetchData = async () => {
         try {
           const response = await axios.post("/api/drawing/dependencies", {
             projectId, drawingId: drawingId || ""
           });
           setData(response.data);
         } catch (error) {
           console.error("Error:", error);
         }
       };
       fetchData();
   }, [projectId, drawingId]);

   // SVG 초기화 (한번만)
   useEffect(() => {
       const svg = d3.select(svgRef.current)
           .attr("width", "100%") 
           .attr("height", "100%")
//           .attr("viewBox", [-550, -550, window.innerWidth, window.innerHeight]);
           .attr("viewBox", [-1000, -1500, 5000, 5000]);

       // Container group 추가
       svg.append("g").attr("class", "container");

       // Zoom behavior 설정
       const zoom = d3.zoom()
           .scaleExtent([0.1, 4])
           .on("zoom", (event) => {
               svg.select(".container").attr("transform", event.transform);
           });

       svg.call(zoom);
   }, []);

   // Data 변경시 노드/링크 업데이트
   useEffect(() => {
       if (!data.drawings.length) return;

       const svg = d3.select(svgRef.current);
       const container = svg.select(".container");
       container.selectAll("*").remove(); // Clear previous elements

       const scale = 1 / 20;
       const drawings = data.drawings.map(d => ({
           ...d,
           width: d.width * scale,
           height: d.height * scale * 5
       }));

       const fromToNodes = drawings.flatMap(drawing => 
           drawing.fromTos.map(fromTo => ({
               ...fromTo,
               drawingUuid: drawing.uuid,
               drawingX: 0,
               drawingY: 0,
               relativeX: ((fromTo.top_x + fromTo.bottom_x) / 2) * scale - drawing.width / 2,
               relativeY: ((fromTo.top_y + fromTo.bottom_y) / 2) * scale * 5 - drawing.height / 2,
               absoluteX: 0,
               absoluteY: 0
           }))
       );

       const links = data.edges.map(edge => {
           const source = fromToNodes.find(node => 
               node.drawingUuid === edge.source.drawingUuid && 
               node.id === edge.source.fromToId
           );
           const target = fromToNodes.find(node =>
               node.drawingUuid === edge.target.drawingUuid &&
               node.id === edge.target.fromToId
           );
           return { source, target };
       });

       // Drawing nodes
       const drawingNodes = container.selectAll(".drawing")
           .data(drawings)
           .enter()
           .append("g")
           .attr("class", "drawing")
           .call(d3.drag()
               .on("start", dragstarted)
               .on("drag", dragged)
               .on("end", dragended));

       drawingNodes.append("rect")
           .attr("x", d => -d.width/2)
           .attr("y", d => -d.height/2)
           .attr("width", d => d.width)
           .attr("height", d => d.height)
           .attr("fill", "none")
           .attr("stroke", "#666")
           .attr("stroke-width", 2);

           drawingNodes
           .append("text")
           .attr("y", (d) => -d.height / 2 - 10)
           .attr("text-anchor", "middle")
           .style("font-size", "28px")
           .text((d) => d.name);
     
       // FromTo nodes
       const fromTo = container.selectAll(".fromTo")
           .data(fromToNodes)
           .enter()
           .append("g")
           .attr("class", "fromTo");

       // Add fromTo rectangles and texts...
       fromTo.append("rect")
           .attr("x", d => {
               const isLeft = d.relativeX < 0;
               return isLeft ? d.relativeX - 55 : d.relativeX + 5;
           })
           .attr("y", d => d.relativeY - 7)
           .attr("width", 80)
           .attr("height", 15)
           .attr("fill", "#4F46E5");

       fromTo.append("text")
           .attr("x", d => {
               const isLeft = d.relativeX < 0;
               return isLeft ? d.relativeX - 15 : d.relativeX + 45;
           })
           .attr("y", d => d.relativeY + 5)
           .attr("text-anchor", "middle")
           .attr("fill", "white")
           .style("font-size", "8px")
           .text(d => d.text);

       // Links
       const link = container.selectAll(".link")
           .data(links)
           .enter()
           .append("line")
           .attr("class", "link")
           .attr("stroke", "#999")
           .attr("stroke-width", 2);

       // Force simulation
       const simulation = d3.forceSimulation(drawings)
           .force("link", d3.forceLink(links)
               .id(d => d.id)
               .distance(250))
           .force("charge", d3.forceManyBody().strength(-600))
           .force("center", d3.forceCenter(110, 0));

       function dragstarted(event, d) {
           if (!event.active) simulation.alphaTarget(0.3).restart();
           d.fx = d.x;
           d.fy = d.y;
       }

       function dragged(event, d) {
           d.fx = event.x;
           d.fy = event.y;
       }

       function dragended(event, d) {
           if (!event.active) simulation.alphaTarget(0);
           d.fx = null;
           d.fy = null;
       }

       simulation.on("tick", () => {
           drawingNodes.attr("transform", d => `translate(${d.x},${d.y})`);

           fromToNodes.forEach(node => {
               const drawing = drawings.find(d => d.uuid === node.drawingUuid);
               node.absoluteX = drawing.x + node.relativeX;
               node.absoluteY = drawing.y + node.relativeY;
           });

           fromTo.attr("transform", d => {
               const drawing = drawings.find(draw => draw.uuid === d.drawingUuid);
               return `translate(${drawing.x},${drawing.y})`;
           });

           link
               .attr("x1", d => d.source.relativeX < 0 ? 
                   d.source.absoluteX - 55 : d.source.absoluteX + 85)
               .attr("y1", d => d.source.absoluteY)
               .attr("x2", d => d.target.absoluteX - 35)
               .attr("y2", d => d.target.absoluteY);
       });

   }, [data]);

   return <svg ref={svgRef} style={{ width: '100%', height: '100vh' }}></svg>;
};

export default Graph;
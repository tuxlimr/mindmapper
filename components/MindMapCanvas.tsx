import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MindMapData, MindMapNode } from '../types';

interface MindMapCanvasProps {
  data: MindMapData;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.offsetWidth,
          height: wrapperRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 Logic
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create a group for the zoomable content
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Center the initial view
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    // Data Structure
    const root = d3.hierarchy<MindMapNode>(data.root);
    
    // Calculate layout
    // We use a tree layout. Adjust nodeSize for spacing.
    const treeLayout = d3.tree<MindMapNode>().nodeSize([60, 200]);
    treeLayout(root);

    // Links
    // Use curved paths
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<MindMapNode>, d3.HierarchyPointNode<MindMapNode>>()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .style("cursor", "default");

    // Node Circles/Rects
    node.append("rect")
      .attr("width", d => Math.max(100, (d.data.label?.length || 0) * 8 + 20))
      .attr("height", 40)
      .attr("x", d => -10) // slight offset
      .attr("y", -20)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", d => {
          // Color based on depth
          if (d.depth === 0) return "#3b82f6"; // Blue
          if (d.depth === 1) return "#10b981"; // Emerald
          if (d.depth === 2) return "#f59e0b"; // Amber
          return "#64748b"; // Slate
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0px 4px 3px rgba(0,0,0,0.1))");

    // Labels
    node.append("text")
      .attr("dy", 5)
      .attr("x", d => (Math.max(100, (d.data.label?.length || 0) * 8 + 20) / 2) - 10)
      .style("text-anchor", "middle")
      .text(d => d.data.label)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "white")
      .style("font-family", "sans-serif")
      .style("pointer-events", "none");

    // Tooltip/Details (simple implementation via title for now)
    node.append("title")
      .text(d => d.data.details || d.data.label);

  }, [data, dimensions]);

  return (
    <div ref={wrapperRef} className="w-full h-full bg-slate-50 overflow-hidden relative">
      <svg ref={svgRef} width="100%" height="100%" className="touch-none" />
      
      {/* Legend / Overlay */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-500">
        <p className="font-semibold mb-1">Navigation</p>
        <ul className="space-y-1">
          <li>• Scroll/Pinch to Zoom</li>
          <li>• Drag to Pan</li>
        </ul>
      </div>
    </div>
  );
};

export default MindMapCanvas;

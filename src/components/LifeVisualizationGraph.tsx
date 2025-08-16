import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface LifeCategory extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  score: number;
  weight: number;
  color: string;
  icon: string;
}

const defaultCategories: LifeCategory[] = [
  { id: 'health', name: 'Health', score: 75, weight: 9, color: 'hsl(var(--health))', icon: '💪' },
  { id: 'money', name: 'Money', score: 60, weight: 8, color: 'hsl(var(--money))', icon: '💰' },
  { id: 'career', name: 'Career', score: 85, weight: 8, color: 'hsl(var(--career))', icon: '🚀' },
  { id: 'social', name: 'Social', score: 70, weight: 7, color: 'hsl(var(--social))', icon: '👥' },
  { id: 'love', name: 'Love', score: 90, weight: 9, color: 'hsl(var(--love))', icon: '❤️' },
  { id: 'growth', name: 'Growth', score: 80, weight: 8, color: 'hsl(var(--growth))', icon: '🌱' },
  { id: 'spirituality', name: 'Spirituality', score: 65, weight: 6, color: 'hsl(var(--spirituality))', icon: '🧘' },
];

interface LifeVisualizationGraphProps {
  categories?: LifeCategory[];
  onNodeClick?: (category: LifeCategory) => void;
  width?: number;
  height?: number;
}

export const LifeVisualizationGraph: React.FC<LifeVisualizationGraphProps> = ({
  categories = defaultCategories,
  onNodeClick,
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create simulation
    const simulation = d3.forceSimulation(categories)
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => Math.max(40, (d as LifeCategory).weight * 6)));

    // Create nodes
    const nodes = svg.selectAll(".node")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add glow filter
    const defs = svg.append("defs");
    const glowFilter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");

    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add circles
    const circles = nodes.append("circle")
      .attr("r", d => Math.max(30, d.weight * 4))
      .style("fill", d => d.color)
      .style("fill-opacity", 0.8)
      .style("stroke", d => d.color)
      .style("stroke-width", 2)
      .style("filter", "url(#glow)")
      .style("transition", "all 0.3s ease");

    // Add text labels
    nodes.append("text")
      .text(d => d.icon)
      .style("font-size", "24px")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("pointer-events", "none");

    // Add category names
    nodes.append("text")
      .text(d => d.name)
      .attr("dy", d => Math.max(30, d.weight * 4) + 20)
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .style("font-weight", "500")
      .style("pointer-events", "none");

    // Add score badges
    nodes.append("circle")
      .attr("cx", d => Math.max(20, d.weight * 3))
      .attr("cy", d => -Math.max(20, d.weight * 3))
      .attr("r", 12)
      .style("fill", "hsl(var(--surface))")
      .style("stroke", d => d.color)
      .style("stroke-width", 2);

    nodes.append("text")
      .text(d => d.score)
      .attr("x", d => Math.max(20, d.weight * 3))
      .attr("y", d => -Math.max(20, d.weight * 3))
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("fill", "hsl(var(--foreground))")
      .style("font-weight", "600")
      .style("pointer-events", "none");

    // Add interactions
    nodes
      .on("mouseenter", function(event, d) {
        setHoveredNode(d.id);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", Math.max(35, d.weight * 4.5))
          .style("fill-opacity", 1)
          .style("stroke-width", 3);
      })
      .on("mouseleave", function(event, d) {
        setHoveredNode(null);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", Math.max(30, d.weight * 4))
          .style("fill-opacity", 0.8)
          .style("stroke-width", 2);
      })
      .on("click", function(event, d) {
        onNodeClick?.(d);
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      nodes.attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [categories, width, height, onNodeClick]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full h-full"
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Hover tooltip */}
      {hoveredNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 glass-card p-3 rounded-lg"
        >
          {(() => {
            const category = categories.find(c => c.id === hoveredNode);
            return category && (
              <div className="text-sm">
                <div className="font-semibold text-foreground">{category.name}</div>
                <div className="text-muted-foreground">Score: {category.score}/100</div>
                <div className="text-muted-foreground">Priority: {category.weight}/10</div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
};
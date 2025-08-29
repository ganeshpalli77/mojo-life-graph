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

interface LifeConnection {
  source: string;
  target: string;
  strength: number;
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

const defaultConnections: LifeConnection[] = [
  { source: 'health', target: 'career', strength: 0.7 },
  { source: 'health', target: 'love', strength: 0.6 },
  { source: 'career', target: 'money', strength: 0.8 },
  { source: 'career', target: 'growth', strength: 0.7 },
  { source: 'social', target: 'love', strength: 0.8 },
  { source: 'social', target: 'career', strength: 0.5 },
  { source: 'growth', target: 'spirituality', strength: 0.6 },
  { source: 'growth', target: 'health', strength: 0.5 },
  { source: 'money', target: 'health', strength: 0.4 },
  { source: 'love', target: 'spirituality', strength: 0.5 },
];

interface LifeVisualizationGraphProps {
  categories?: LifeCategory[];
  connections?: LifeConnection[];
  onNodeClick?: (category: LifeCategory) => void;
  width?: number;
  height?: number;
}

export const LifeVisualizationGraph: React.FC<LifeVisualizationGraphProps> = ({
  categories = defaultCategories,
  connections = defaultConnections,
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

    // Calculate better dimensions with padding
    const padding = 80;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // Create links data for D3
    const links = connections.map(conn => ({
      source: categories.find(c => c.id === conn.source),
      target: categories.find(c => c.id === conn.target),
      strength: conn.strength
    })).filter(link => link.source && link.target);

    // Create simulation with better force parameters for even distribution
    const simulation = d3.forceSimulation(categories)
      .force("link", d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(d => Math.min(innerWidth, innerHeight) * 0.25) // Responsive distance
        .strength(d => (d as any).strength * 0.8))
      .force("charge", d3.forceManyBody()
        .strength(-Math.min(innerWidth, innerHeight) * 2) // Responsive repulsion
        .distanceMax(Math.min(innerWidth, innerHeight) * 0.8))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius(d => Math.max(40, (d as LifeCategory).weight * 4.5) + 10))
      .force("x", d3.forceX(width / 2).strength(0.1)) // Keep nodes centered horizontally
      .force("y", d3.forceY(height / 2).strength(0.1)) // Keep nodes centered vertically
      .force("boundary", () => {
        // Custom force to keep nodes within boundaries
        categories.forEach((node: any) => {
          if (node.x < padding) node.x = padding;
          if (node.x > width - padding) node.x = width - padding;
          if (node.y < padding) node.y = padding;
          if (node.y > height - padding) node.y = height - padding;
        });
      });

    // Create enhanced links with gradients
    const linkElements = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "hsl(var(--muted-foreground))")
      .attr("stroke-opacity", d => 0.4 + (d as any).strength * 0.4)
      .attr("stroke-width", d => Math.max(2, (d as any).strength * 6))
      .style("filter", "drop-shadow(0 0 3px hsl(var(--primary) / 0.3))");

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

    // Add enhanced circles with better styling
    const circles = nodes.append("circle")
      .attr("r", d => Math.max(35, d.weight * 5))
      .style("fill", d => d.color)
      .style("fill-opacity", 0.9)
      .style("stroke", d => d.color)
      .style("stroke-width", 3)
      .style("filter", "url(#glow)")
      .style("box-shadow", "var(--shadow-node)");

    // Add text labels
    nodes.append("text")
      .text(d => d.icon)
      .style("font-size", "24px")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
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

    // Add drag behavior
    const dragBehavior = d3.drag()
      .on("start", function(event, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", function(event, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", function(event, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Add interactions with drag
    nodes
      .call(dragBehavior as any)
      .on("mouseenter", function(event, d) {
        setHoveredNode(d.id);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", Math.max(42, d.weight * 5.5))
          .style("fill-opacity", 1)
          .style("stroke-width", 4);
      })
      .on("mouseleave", function(event, d) {
        setHoveredNode(null);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", Math.max(35, d.weight * 5))
          .style("fill-opacity", 0.9)
          .style("stroke-width", 3);
      })
      .on("click", function(event, d) {
        onNodeClick?.(d);
      });

    // Add category names with better positioning
    nodes.append("text")
      .text(d => d.name)
      .attr("dy", d => Math.max(35, d.weight * 5) + 24)
      .style("font-size", "13px")
      .style("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .style("font-weight", "600")
      .style("pointer-events", "none");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      // Update link positions
      linkElements
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);
      
      // Update node positions
      nodes.attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [categories, connections, width, height, onNodeClick]);

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
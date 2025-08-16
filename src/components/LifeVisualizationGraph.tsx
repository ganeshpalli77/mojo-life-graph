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

    // Create links data for D3
    const links = connections.map(conn => ({
      source: categories.find(c => c.id === conn.source),
      target: categories.find(c => c.id === conn.target),
      strength: conn.strength
    })).filter(link => link.source && link.target);

    // Create simulation with better distribution
    const simulation = d3.forceSimulation(categories)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150).strength(d => (d as any).strength * 0.3))
      .force("charge", d3.forceManyBody().strength(-1200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => Math.max(60, (d as LifeCategory).weight * 7)))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))
      .alphaDecay(0.01)
      .velocityDecay(0.3);

    // Create links with animated particles
    const linkElements = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "hsl(var(--border))")
      .attr("stroke-opacity", d => 0.3 + ((d as any).strength * 0.4))
      .attr("stroke-width", d => Math.max(2, (d as any).strength * 3))
      .attr("stroke-dasharray", "8,4")
      .style("filter", "drop-shadow(0 0 4px hsl(var(--primary) / 0.3))");

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

    // Add circles with improved styling
    const circles = nodes.append("circle")
      .attr("r", d => Math.max(35, d.weight * 5))
      .style("fill", d => d.color)
      .style("fill-opacity", 0.9)
      .style("stroke", d => d.color)
      .style("stroke-width", 3)
      .style("filter", "url(#glow) drop-shadow(0 4px 8px hsl(var(--foreground) / 0.1))")
      .style("transition", "all 0.3s ease");

    // Add emoji icons with better sizing
    nodes.append("text")
      .text(d => d.icon)
      .style("font-size", d => `${Math.max(28, d.weight * 3.5)}px`)
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("pointer-events", "none")
      .style("filter", "drop-shadow(0 2px 4px hsl(var(--background) / 0.3))");

    // Add category names with better positioning
    nodes.append("text")
      .text(d => d.name)
      .attr("dy", d => Math.max(40, d.weight * 6) + 25)
      .style("font-size", "14px")
      .style("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .style("filter", "drop-shadow(0 1px 2px hsl(var(--background) / 0.5))");

    // Add score badges with better styling
    nodes.append("circle")
      .attr("cx", d => Math.max(25, d.weight * 4))
      .attr("cy", d => -Math.max(25, d.weight * 4))
      .attr("r", 16)
      .style("fill", "hsl(var(--surface))")
      .style("stroke", d => d.color)
      .style("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px hsl(var(--foreground) / 0.1))");

    nodes.append("text")
      .text(d => d.score)
      .attr("x", d => Math.max(25, d.weight * 4))
      .attr("y", d => -Math.max(25, d.weight * 4))
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("fill", "hsl(var(--foreground))")
      .style("font-weight", "700")
      .style("pointer-events", "none");

    // Add interactions with improved hover effects
    nodes
      .on("mouseenter", function(event, d) {
        setHoveredNode(d.id);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", Math.max(42, d.weight * 6))
          .style("fill-opacity", 1)
          .style("stroke-width", 4)
          .style("filter", "url(#glow) drop-shadow(0 8px 16px hsl(var(--foreground) / 0.2))");
        
        // Highlight connected links
        linkElements
          .style("stroke-opacity", link => {
            const isConnected = (link.source as any).id === d.id || (link.target as any).id === d.id;
            return isConnected ? 0.8 : 0.1;
          })
          .style("stroke-width", link => {
            const isConnected = (link.source as any).id === d.id || (link.target as any).id === d.id;
            return isConnected ? Math.max(3, (link as any).strength * 4) : Math.max(1, (link as any).strength * 2);
          });
      })
      .on("mouseleave", function(event, d) {
        setHoveredNode(null);
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", Math.max(35, d.weight * 5))
          .style("fill-opacity", 0.9)
          .style("stroke-width", 3)
          .style("filter", "url(#glow) drop-shadow(0 4px 8px hsl(var(--foreground) / 0.1))");
        
        // Reset links
        linkElements
          .style("stroke-opacity", d => 0.3 + ((d as any).strength * 0.4))
          .style("stroke-width", d => Math.max(2, (d as any).strength * 3));
      })
      .on("click", function(event, d) {
        onNodeClick?.(d);
      });

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

  // Add drag functionality for better interactivity
  const drag = d3.drag()
    .on("start", function(event, d: any) {
      if (!event.active) d3.select(svgRef.current).select("g").selectAll("circle").style("cursor", "grabbing");
    })
    .on("drag", function(event, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", function(event, d: any) {
      if (!event.active) {
        d.fx = null;
        d.fy = null;
        d3.select(svgRef.current).select("g").selectAll("circle").style("cursor", "grab");
      }
    });

  // Apply drag to nodes after creation
  React.useEffect(() => {
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll(".node").call(drag as any);
    }
  });

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
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  ArrowRightLeft,
  Search,
  Trophy,
  Zap,
  Compass
} from 'lucide-react';
import { CustomRoadmapNode } from './CustomRoadmapNode';
import { PhaseGroupNode } from './PhaseGroupNode';
import { NodeActionCenter } from './NodeActionCenter';
import { replanRoadmapGraph } from '../utils/replanningEngine';
import type { CareerRoadmapResponse, RoadmapNodeData, NodeStatus } from '../types/roadmap';

const nodeTypes = {
  roadmapNode: CustomRoadmapNode,
  phaseGroup: PhaseGroupNode,
};

const NODE_WIDTH = 295;
const NODE_HEIGHT = 165;
const PHASE_PADDING = 30;

// Hierarchical Dagre Layout with Phase Container Grouping
function getLayoutedElements(
  roadmap: CareerRoadmapResponse,
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: direction === 'TB' ? 100 : 120,
    nodesep: 60,
    edgesep: 40,
    marginx: 40,
    marginy: 40,
  });

  // Add all skill nodes to Dagre graph
  roadmap.nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  roadmap.edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Position skill nodes
  const layoutedSkillNodes: Node[] = roadmap.nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      id: node.id,
      type: 'roadmapNode',
      data: node as unknown as Record<string, unknown>,
      targetPosition: direction === 'TB' ? Position.Top : Position.Left,
      sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      zIndex: 10,
    };
  });

  // Calculate bounding boxes for each phase to create background phase swimlane containers
  const phaseGroupNodes: Node[] = (roadmap.phases || []).map((phase, idx) => {
    const phaseNodes = layoutedSkillNodes.filter((sn) => {
      const data = sn.data as unknown as RoadmapNodeData;
      return (
        data.phase === phase.title ||
        (phase.nodeIds && phase.nodeIds.includes(sn.id)) ||
        data.phase.toLowerCase().includes(phase.id.toLowerCase())
      );
    });

    if (phaseNodes.length === 0) {
      return null;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    phaseNodes.forEach((pn) => {
      minX = Math.min(minX, pn.position.x);
      maxX = Math.max(maxX, pn.position.x + NODE_WIDTH);
      minY = Math.min(minY, pn.position.y);
      maxY = Math.max(maxY, pn.position.y + NODE_HEIGHT);
    });

    const containerX = minX - PHASE_PADDING;
    const containerY = minY - (PHASE_PADDING + 45); // Extra headroom for phase title banner
    const containerWidth = maxX - minX + PHASE_PADDING * 2;
    const containerHeight = maxY - minY + PHASE_PADDING * 2 + 50;

    const completedInPhase = phaseNodes.filter(
      (pn) => (pn.data as unknown as RoadmapNodeData).status === 'completed'
    ).length;

    return {
      id: `group-${phase.id}`,
      type: 'phaseGroup',
      position: { x: containerX, y: containerY },
      data: {
        title: phase.title,
        timeframe: phase.timeframe,
        description: phase.description,
        phaseNumber: idx + 1,
        totalNodes: phaseNodes.length,
        completedNodes: completedInPhase,
        width: Math.max(containerWidth, 360),
        height: Math.max(containerHeight, 240),
      },
      selectable: false,
      draggable: false,
      zIndex: 1,
    };
  }).filter(Boolean) as Node[];

  // Style edges based on roadmap status
  const nodeStatusMap = new Map<string, NodeStatus>();
  roadmap.nodes.forEach((n) => nodeStatusMap.set(n.id, n.status));

  const layoutedEdges: Edge[] = roadmap.edges.map((edge) => {
    const sourceStatus = nodeStatusMap.get(edge.source);
    const targetStatus = nodeStatusMap.get(edge.target);

    const isFullyCompleted = sourceStatus === 'completed' && targetStatus === 'completed';
    const isActiveBranch = targetStatus === 'active';

    let strokeColor = '#334155';
    let arrowColor = '#475569';
    let strokeWidth = 2;
    let animated = false;

    if (isFullyCompleted) {
      strokeColor = '#10b981';
      arrowColor = '#10b981';
      strokeWidth = 2.5;
      animated = false;
    } else if (isActiveBranch) {
      strokeColor = '#818cf8';
      arrowColor = '#a855f7';
      strokeWidth = 2.5;
      animated = true;
    }

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated,
      style: {
        stroke: strokeColor,
        strokeWidth,
        strokeDasharray: isFullyCompleted ? undefined : '5,5',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: arrowColor,
        width: 15,
        height: 15,
      },
      labelStyle: {
        fill: '#cbd5e1',
        fontWeight: 600,
        fontSize: 10,
        fontFamily: 'monospace',
      },
      labelBgStyle: {
        fill: '#121222',
        fillOpacity: 0.9,
        stroke: strokeColor,
        strokeWidth: 1,
        rx: 6,
        ry: 6,
      },
    };
  });

  // Combine background phase group cards + foreground skill nodes
  const allNodes = [...phaseGroupNodes, ...layoutedSkillNodes];

  return { nodes: allNodes, edges: layoutedEdges };
}

interface RoadmapGraphProps {
  roadmapData: CareerRoadmapResponse;
  onUpdateRoadmap?: (updated: CareerRoadmapResponse) => void;
}

export const RoadmapGraph: React.FC<RoadmapGraphProps> = ({
  roadmapData,
  onUpdateRoadmap,
}) => {
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
  const [selectedNode, setSelectedNode] = useState<RoadmapNodeData | null>(null);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replanToast, setReplanToast] = useState<string | null>(null);

  const initialLayout = useMemo(
    () => getLayoutedElements(roadmapData, direction),
    [roadmapData, direction]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialLayout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayout.edges);

  useEffect(() => {
    const layout = getLayoutedElements(roadmapData, direction);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [roadmapData, direction, setNodes, setEdges]);

  // Toggle layout direction
  const handleToggleDirection = () => {
    const nextDir = direction === 'TB' ? 'LR' : 'TB';
    setDirection(nextDir);
  };

  // Node click handler
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'phaseGroup') return;
    const nodeData = node.data as unknown as RoadmapNodeData;
    setSelectedNode(nodeData);
    setIsActionCenterOpen(true);
  }, []);

  // Dynamic Replanning Trigger
  const handleTriggerReplan = (nodeId: string, newStatus: NodeStatus) => {
    const result = replanRoadmapGraph(roadmapData, nodeId, newStatus);

    if (onUpdateRoadmap) {
      onUpdateRoadmap(result.updatedRoadmap);
    }

    const updatedTargetNode = result.updatedRoadmap.nodes.find((n) => n.id === nodeId);
    if (updatedTargetNode) {
      setSelectedNode(updatedTargetNode);
    }

    setReplanToast(result.message);
    setTimeout(() => {
      setReplanToast(null);
    }, 4500);
  };

  const handleMarkAsKnown = (nodeId: string) => {
    const currentNode = roadmapData.nodes.find((n) => n.id === nodeId);
    const nextStatus: NodeStatus = currentNode?.status === 'completed' ? 'missing' : 'completed';
    handleTriggerReplan(nodeId, nextStatus);
  };

  // Filtered nodes display
  const displayedNodes = useMemo(() => {
    return nodes.map((node) => {
      if (node.type === 'phaseGroup') {
        return node;
      }

      const nodeData = node.data as unknown as RoadmapNodeData;
      const matchesFilter =
        filterStatus === 'all' || nodeData.status === filterStatus;
      const matchesSearch =
        searchQuery === '' ||
        nodeData.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nodeData.category.toLowerCase().includes(searchQuery.toLowerCase());

      const isDimmed = !matchesFilter || !matchesSearch;

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isDimmed ? 0.2 : 1,
          filter: isDimmed ? 'grayscale(80%)' : 'none',
          transition: 'all 0.25s ease',
        },
      };
    });
  }, [nodes, filterStatus, searchQuery]);

  // Metrics summary calculation
  const remainingHours = useMemo(
    () =>
      roadmapData.nodes
        .filter((n) => n.status !== 'completed')
        .reduce((acc, n) => acc + (n.estimatedHours || 0), 0),
    [roadmapData.nodes]
  );
  const completedCount = useMemo(
    () => roadmapData.nodes.filter((n) => n.status === 'completed').length,
    [roadmapData.nodes]
  );
  const activeCount = useMemo(
    () => roadmapData.nodes.filter((n) => n.status === 'active').length,
    [roadmapData.nodes]
  );
  const missingCount = useMemo(
    () => roadmapData.nodes.filter((n) => n.status === 'missing').length,
    [roadmapData.nodes]
  );
  const percentComplete = Math.round(
    (completedCount / Math.max(1, roadmapData.nodes.length)) * 100
  );

  return (
    <div className="w-full flex flex-col rounded-3xl bg-[#090912] border border-indigo-500/20 shadow-2xl overflow-hidden relative">
      {/* Top Roadmap.sh style stats & controls banner */}
      <div className="p-4 sm:p-5 bg-[#0e0e1a]/95 backdrop-blur-md border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-20">
        {/* Left: Summary Metrics */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 bg-[#141426] px-3.5 py-1.5 rounded-xl border border-white/5">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400">Target:</span>
            <span className="text-white font-bold">{roadmapData.targetSummary.targetRole}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#141426] px-3 py-1.5 rounded-xl border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Readiness:</span>
            <span className="text-emerald-400 font-bold font-mono">
              {percentComplete}% ({completedCount}/{roadmapData.nodes.length})
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#141426] px-3 py-1.5 rounded-xl border border-white/5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Active Focus:</span>
            <span className="text-indigo-300 font-bold font-mono">{activeCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#141426] px-3 py-1.5 rounded-xl border border-white/5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Gaps:</span>
            <span className="text-amber-400 font-bold font-mono">{missingCount}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#141426] px-3 py-1.5 rounded-xl border border-white/5">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">Est. Hours:</span>
            <span className="text-indigo-300 font-bold font-mono">{remainingHours}h</span>
          </div>
        </div>

        {/* Right: Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics..."
              className="w-full sm:w-36 bg-[#141426] text-white text-xs pl-8 pr-3 py-1.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          {/* Filter Status Selector */}
          <div className="flex items-center bg-[#141426] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'active'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('missing')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'missing'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gaps
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'completed'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mastered
            </button>
          </div>

          {/* Direction Toggle */}
          <button
            onClick={handleToggleDirection}
            title="Toggle Layout Direction"
            className="p-2 rounded-xl bg-[#141426] hover:bg-[#1e1e36] text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            {direction === 'TB' ? (
              <>
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Vertical</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Horizontal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Flow Canvas */}
      <div className="h-[740px] w-full relative bg-[#07070d]">
        {/* Dynamic Replanning Live Toast Banner */}
        {replanToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-indigo-900/95 border border-indigo-400/50 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-bounce">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{replanToast}</span>
          </div>
        )}

        <ReactFlow
          nodes={displayedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.15}
          maxZoom={1.6}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background
            color="#27273f"
            gap={20}
            size={1.2}
            variant={BackgroundVariant.Dots}
            className="opacity-20"
          />
          <Controls
            className="!bg-[#121222] !border-white/10 !rounded-xl !shadow-2xl overflow-hidden [&>button]:!bg-[#121222] [&>button]:!border-white/10 [&>button]:!text-slate-300 [&>button:hover]:!bg-[#1c1c34]"
          />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'phaseGroup') return 'rgba(99, 102, 241, 0.08)';
              const nd = n.data as unknown as RoadmapNodeData;
              if (nd?.status === 'completed') return '#10b981';
              if (nd?.status === 'active') return '#6366f1';
              if (nd?.status === 'missing') return '#f59e0b';
              if (nd?.status === 'target') return '#a855f7';
              return '#475569';
            }}
            maskColor="rgba(7, 7, 13, 0.85)"
            className="!bg-[#0f0f1c] !border-white/10 !rounded-2xl overflow-hidden shadow-2xl !bottom-4 !right-4"
          />
        </ReactFlow>

        {/* Floating guidance helper */}
        <div className="absolute bottom-4 left-4 z-10 bg-[#121222]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-[11px] text-slate-400 flex items-center gap-2 pointer-events-none shadow-xl">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any topic card to inspect practice guides, interview questions & mark as known</span>
        </div>
      </div>

      {/* Slide-over Action Center Drawer */}
      <NodeActionCenter
        node={selectedNode}
        allNodes={roadmapData.nodes}
        isOpen={isActionCenterOpen}
        onClose={() => setIsActionCenterOpen(false)}
        onMarkAsKnown={handleMarkAsKnown}
        onUpdateStatus={handleTriggerReplan}
      />
    </div>
  );
};

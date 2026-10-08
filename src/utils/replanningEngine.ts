import type {
  CareerRoadmapResponse,
  RoadmapNodeData,
  NodeStatus,
} from '../types/roadmap';

export interface ReplanResult {
  updatedRoadmap: CareerRoadmapResponse;
  unlockedNodeIds: string[];
  revertedNodeIds: string[];
  message: string;
}

/**
 * Dynamic Replanning Engine for Career Roadmapper DAGs.
 * Traverses prerequisites and downstream nodes to dynamically unlock or adjust paths.
 */
export function replanRoadmapGraph(
  roadmap: CareerRoadmapResponse,
  targetNodeId: string,
  newStatus: NodeStatus
): ReplanResult {
  // 1. Create a deep copy of nodes map for fast lookup
  const nodesMap = new Map<string, RoadmapNodeData>();
  roadmap.nodes.forEach((node) => {
    nodesMap.set(node.id, { ...node });
  });

  // 2. Build prerequisite map from explicit prerequisites and edges
  const prerequisiteMap = new Map<string, Set<string>>();
  const downstreamMap = new Map<string, Set<string>>();

  roadmap.nodes.forEach((node) => {
    prerequisiteMap.set(node.id, new Set(node.prerequisites || []));
    downstreamMap.set(node.id, new Set());
  });

  roadmap.edges.forEach((edge) => {
    if (!prerequisiteMap.has(edge.target)) {
      prerequisiteMap.set(edge.target, new Set());
    }
    prerequisiteMap.get(edge.target)!.add(edge.source);

    if (!downstreamMap.has(edge.source)) {
      downstreamMap.set(edge.source, new Set());
    }
    downstreamMap.get(edge.source)!.add(edge.target);
  });

  // 3. Update the target node's status
  const targetNode = nodesMap.get(targetNodeId);
  if (!targetNode) {
    return {
      updatedRoadmap: roadmap,
      unlockedNodeIds: [],
      revertedNodeIds: [],
      message: 'Node not found',
    };
  }

  targetNode.status = newStatus;
  nodesMap.set(targetNodeId, targetNode);

  const unlockedNodeIds: string[] = [];
  const revertedNodeIds: string[] = [];

  // 4. DAG Traversal & Status Propagation
  // Topological / iterative evaluation of all downstream nodes
  let changed = true;
  let iterations = 0;
  const maxIterations = roadmap.nodes.length * 2;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const [nodeId, node] of nodesMap.entries()) {
      if (node.status === 'target') {
        continue;
      }

      const prereqs = prerequisiteMap.get(nodeId) || new Set<string>();

      if (prereqs.size > 0) {
        // Check if all prerequisites are completed
        const allPrereqsCompleted = Array.from(prereqs).every((prereqId) => {
          const prereqNode = nodesMap.get(prereqId);
          return prereqNode && prereqNode.status === 'completed';
        });

        // If all prereqs are completed and node was 'missing', unlock it to 'active'
        if (allPrereqsCompleted && node.status === 'missing') {
          node.status = 'active';
          unlockedNodeIds.push(nodeId);
          changed = true;
        }

        // If prerequisites are broken and node was 'active', revert to 'missing'
        if (!allPrereqsCompleted && node.status === 'active' && nodeId !== targetNodeId) {
          node.status = 'missing';
          revertedNodeIds.push(nodeId);
          changed = true;
        }
      }
    }
  }

  const updatedNodes = Array.from(nodesMap.values());

  // 5. Recalculate remaining estimated hours and readiness score
  const remainingHours = updatedNodes
    .filter((n) => n.status !== 'completed')
    .reduce((acc, n) => acc + (n.estimatedHours || 0), 0);

  const completedCount = updatedNodes.filter((n) => n.status === 'completed').length;
  const newReadinessScore = Math.round(
    (completedCount / Math.max(1, updatedNodes.length)) * 100
  );

  // 6. Recalculate edge representations based on status
  const updatedEdges = roadmap.edges.map((edge) => {
    return { ...edge };
  });

  const updatedRoadmap: CareerRoadmapResponse = {
    ...roadmap,
    targetSummary: {
      ...roadmap.targetSummary,
      estimatedTotalHours: remainingHours,
      readinessScore: newReadinessScore,
    },
    nodes: updatedNodes,
    edges: updatedEdges,
  };

  let message = `Marked "${targetNode.title}" as ${newStatus}.`;
  if (unlockedNodeIds.length > 0) {
    const unlockedTitles = unlockedNodeIds
      .map((id) => nodesMap.get(id)?.title)
      .filter(Boolean)
      .join(', ');
    message += ` Unlocked next focus: ${unlockedTitles}!`;
  }

  return {
    updatedRoadmap,
    unlockedNodeIds,
    revertedNodeIds,
    message,
  };
}

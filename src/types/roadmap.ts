export type NodeStatus = 'completed' | 'active' | 'missing' | 'target';
export type NodePriority = 'critical' | 'high' | 'medium' | 'low';

export interface InterviewQuestion {
  question: string;
  topic: string;
  difficulty: 'Junior' | 'Mid' | 'Senior' | 'Staff';
  answerHint: string;
}

export interface RecommendedProject {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Production';
  description: string;
  deliverables: string[];
  skillsCovered: string[];
}

export interface ReferenceSite {
  title: string;
  url: string;
  type: 'docs' | 'article' | 'course' | 'github' | 'official';
}

export interface HandsOnExercise {
  title: string;
  prompt: string;
  sandboxUrl?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface RoadmapNodeData {
  id: string;
  title: string;
  category: string;
  phase: string;
  status: NodeStatus;
  estimatedHours: number;
  priority: NodePriority;
  description: string;
  whyItMatters: string;
  prerequisites: string[]; // ids of prerequisite nodes
  practiceStrategy: string[];
  quickNotes?: string[];
  referenceSites?: ReferenceSite[];
  handsOnExercises?: HandsOnExercise[];
  interviewQuestions: InterviewQuestion[];
  recommendedProjects: RecommendedProject[];
  isUserSkill?: boolean;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  timeframe: string;
  description: string;
  nodeIds: string[];
}

export interface CareerRoadmapResponse {
  targetSummary: {
    targetRole: string;
    timelineMonths: number;
    hoursPerWeek: number;
    estimatedTotalHours: number;
    targetSalaryRange: string;
    marketDemand: string;
    keyGrowthAreas: string[];
    readinessScore: number;
  };
  phases: RoadmapPhase[];
  nodes: RoadmapNodeData[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
  }[];
}

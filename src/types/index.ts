export type TaskStatus =
  | 'pending_verification'
  | 'mesh_generation'
  | 'cavitation_calculation'
  | 'turbulence_calculation'
  | 'stress_analysis'
  | 'completed'
  | 'error'
  | 'under_review'
  | 'approved';

export type AlertLevel = 'level_1' | 'level_2' | 'level_3';

export type AlertStatus = 'pending' | 'reviewed' | 'resolved' | 'ignored';

export type AlertType =
  | 'cavitation_volume'
  | 'pressure_fluctuation'
  | 'erosion_rate'
  | 'thrust_fluctuation'
  | 'vapor_pressure';

export type ApprovalLevel = 'level_1' | 'level_2';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type UserRole =
  | 'hydraulic_engineer'
  | 'fluid_engineer'
  | 'chief_engineer'
  | 'chief_scientist'
  | 'manufacturing_team';

export interface SimulationParameters {
  rotationalSpeed: number;
  waterHead: number;
  flowRate: number;
  guideVaneOpening: number;
  bladeAngle: number;
  cavitationModel: string;
  turbulenceModel: string;
  vaporPressure: number;
}

export interface MeshSettings {
  adaptiveMesh: boolean;
  curvatureRefinement: boolean;
  boundaryLayers: number;
  baseCellSize: number;
  maxCellCount: number;
}

export interface StatusLog {
  id: string;
  taskId: string;
  status: TaskStatus;
  description: string;
  timestamp: Date;
}

export interface Alert {
  id: string;
  taskId: string;
  taskName: string;
  level: AlertLevel;
  type: AlertType;
  title: string;
  description: string;
  value: number;
  threshold: number;
  unit: string;
  status: AlertStatus;
  triggeredAt: Date;
  reviewedBy?: string;
  reviewComment?: string;
  reviewedAt?: Date;
}

export interface AdjustmentLog {
  id: string;
  taskId: string;
  adjustedBy: string;
  beforeParams: Partial<SimulationParameters>;
  afterParams: Partial<SimulationParameters>;
  reason: string;
  timestamp: Date;
}

export interface MonitoringData {
  timestamp: number;
  cavitationVolume: number;
  pressureFluctuation: number;
  erosionRate: number;
  thrustFluctuation: number;
  minPressure: number;
  maxShearStress: number;
}

export interface SimulationTask {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  progress: number;
  parameters: SimulationParameters;
  meshSettings: MeshSettings;
  modelFile: {
    name: string;
    size: number;
    format: string;
  };
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  turbineType: string;
  alertCount: number;
  adjustmentCount: number;
}

export type ReportRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ReportReviewRecord {
  id: string;
  reportId: string;
  reviewer: string;
  reviewedAt: Date;
  conclusion: string;
  riskLevel: ReportRiskLevel;
  suggestion: string;
}

export interface Report {
  id: string;
  taskId: string;
  taskName: string;
  summaryData: {
    maxCavitationVolume: number;
    avgPressureFluctuation: number;
    maxErosionRate: number;
    maxShearStress: number;
    bladeLiftForce: number;
    efficiency: number;
  };
  generatedAt: Date;
  fileSize: number;
  reviewRecords?: ReportReviewRecord[];
}

export interface Approval {
  id: string;
  taskId: string;
  taskName: string;
  level: ApprovalLevel;
  approver?: string;
  status: ApprovalStatus;
  comment?: string;
  submittedAt: Date;
  approvedAt?: Date;
}

export interface Recommendation {
  id: string;
  type: 'airfoil' | 'coating';
  name: string;
  description: string;
  score: number;
  advantages: string[];
  disadvantages: string[];
  expectedLifespan: number;
  costLevel: 'low' | 'medium' | 'high';
  applicableScenarios: string[];
  historicalSuccessRate: number;
}

export interface DashboardStatistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  activeAlerts: number;
  pendingApprovals: number;
  avgErosionDepthDeviation: number;
  optimizationConvergenceCount: number;
  tasksToday: number;
  avgSimulationTime: number;
}

export interface TrendDataPoint {
  date: string;
  completionRate: number;
  avgErosionDepth: number;
  optimizationCount: number;
  taskCount: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface PushedToManufacturingRecord {
  taskId: string;
  pushedBy: string;
  pushedAt: Date;
}

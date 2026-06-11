import { TaskStatus, AlertLevel, AlertType, UserRole } from '../types';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending_verification: '待校验',
  mesh_generation: '网格生成',
  cavitation_calculation: '空化计算',
  turbulence_calculation: '湍流计算',
  stress_analysis: '叶片受力分析',
  completed: '已完成',
  error: '异常回退',
  under_review: '审批中',
  approved: '已批准',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending_verification: 'badge-pending',
  mesh_generation: 'badge-info',
  cavitation_calculation: 'badge-info',
  turbulence_calculation: 'badge-info',
  stress_analysis: 'badge-info',
  completed: 'badge-success',
  error: 'badge-danger',
  under_review: 'badge-warning',
  approved: 'badge-success',
};

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  level_1: '一级预警',
  level_2: '二级预警',
  level_3: '三级预警',
};

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  level_1: 'badge-info',
  level_2: 'badge-warning',
  level_3: 'badge-danger',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  cavitation_volume: '空泡体积分数',
  pressure_fluctuation: '压力脉动',
  erosion_rate: '空蚀速率',
  thrust_fluctuation: '推力波动',
  vapor_pressure: '汽化压力',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  hydraulic_engineer: '水轮工程师',
  fluid_engineer: '流体工程师',
  chief_engineer: '项目总工程师',
  chief_scientist: '首席科学家',
  manufacturing_team: '制造工艺组',
};

export const CAVITATION_MODELS = [
  'Schnerr-Sauer',
  'Zwart-Gerber-Belamri',
  'Kunz',
  'Singhal',
  'Merkle',
];

export const TURBULENCE_MODELS = [
  'k-ω SST',
  'k-ε RNG',
  'k-ε Realizable',
  'LES',
  'DES',
  'RSM',
];

export const TURBINE_TYPES = [
  '混流式水轮机',
  '轴流式水轮机',
  '贯流式水轮机',
  '斜流式水轮机',
  '冲击式水轮机',
];

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: '综合看板',
    icon: 'LayoutDashboard',
    path: '/dashboard',
  },
  {
    id: 'tasks',
    label: '模拟任务',
    icon: 'Layers',
    path: '/tasks',
  },
  {
    id: 'alerts',
    label: '预警中心',
    icon: 'AlertTriangle',
    path: '/alerts',
    badge: 5,
  },
  {
    id: 'reports',
    label: '报告中心',
    icon: 'FileBarChart',
    path: '/reports',
  },
  {
    id: 'recommendations',
    label: '智能推荐',
    icon: 'Sparkles',
    path: '/recommendations',
  },
  {
    id: 'approvals',
    label: '审批中心',
    icon: 'CheckSquare',
    path: '/approvals',
    badge: 3,
  },
];

export const SIMULATION_STEPS = [
  { id: 'pending_verification', label: '待校验', icon: 'Clock' },
  { id: 'mesh_generation', label: '网格生成', icon: 'Grid3X3' },
  { id: 'cavitation_calculation', label: '空化计算', icon: 'Droplets' },
  { id: 'turbulence_calculation', label: '湍流计算', icon: 'Wind' },
  { id: 'stress_analysis', label: '受力分析', icon: 'Gauge' },
  { id: 'completed', label: '完成', icon: 'CheckCircle' },
];

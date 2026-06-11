import { create } from 'zustand';
import {
  SimulationTask,
  Alert,
  DashboardStatistics,
  TrendDataPoint,
  Report,
  Approval,
  Recommendation,
  MonitoringData,
  AdjustmentLog,
  StatusLog,
  User,
  TaskStatus,
} from '../types';
import {
  mockTasks,
  mockAlerts,
  mockStatistics,
  mockTrendData,
  mockReports,
  mockApprovals,
  mockRecommendations,
  mockAdjustmentLogs,
  mockStatusLogs,
  mockCurrentUser,
  generateMonitoringData,
} from '../mock/data';
import { generateId } from '../utils/formatters';

interface AppState {
  currentUser: User;
  tasks: SimulationTask[];
  alerts: Alert[];
  reports: Report[];
  approvals: Approval[];
  recommendations: Recommendation[];
  statistics: DashboardStatistics;
  trendData: TrendDataPoint[];
  monitoringData: Record<string, MonitoringData[]>;
  adjustmentLogs: AdjustmentLog[];
  statusLogs: StatusLog[];
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  pushedToManufacturing: string[];

  selectTask: (id: string | null) => void;
  toggleSidebar: () => void;
  getTaskById: (id: string) => SimulationTask | undefined;
  getAlertsByTaskId: (taskId: string) => Alert[];
  getMonitoringData: (taskId: string) => MonitoringData[];
  getAdjustmentLogs: (taskId: string) => AdjustmentLog[];
  getStatusLogs: (taskId: string) => StatusLog[];

  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  reviewAlert: (alertId: string, status: 'reviewed' | 'resolved' | 'ignored', comment: string) => void;
  adjustTaskParams: (taskId: string, params: Record<string, number>, reason: string) => void;
  approveApproval: (approvalId: string, comment: string) => void;
  rejectApproval: (approvalId: string, comment: string) => void;

  createTask: (task: Partial<SimulationTask>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockCurrentUser,
  tasks: mockTasks,
  alerts: mockAlerts,
  reports: mockReports,
  approvals: mockApprovals,
  recommendations: mockRecommendations,
  statistics: mockStatistics,
  trendData: mockTrendData,
  monitoringData: {
    'task-001': generateMonitoringData(120),
    'task-004': generateMonitoringData(80),
    'task-007': generateMonitoringData(150),
  },
  adjustmentLogs: mockAdjustmentLogs,
  statusLogs: mockStatusLogs,
  selectedTaskId: null,
  sidebarCollapsed: false,
  pushedToManufacturing: ['task-002'],

  selectTask: (id) => set({ selectedTaskId: id }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  getAlertsByTaskId: (taskId) => get().alerts.filter((a) => a.taskId === taskId),

  getMonitoringData: (taskId) => get().monitoringData[taskId] || [],

  getAdjustmentLogs: (taskId) => get().adjustmentLogs.filter((l) => l.taskId === taskId),

  getStatusLogs: (taskId) => get().statusLogs.filter((l) => l.taskId === taskId),

  updateTaskStatus: (taskId, status, reason = '手动状态变更') =>
    set((state) => {
      const currentState = get();
      const existingTask = currentState.tasks.find((t) => t.id === taskId);
      const newStatusLog = existingTask
        ? {
            id: generateId(),
            taskId,
            fromStatus: existingTask.status,
            toStatus: status,
            operator: currentState.currentUser.name,
            reason,
            status,
            description: reason,
            timestamp: new Date(),
          }
        : undefined;

      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status,
                progress: status === 'completed' ? 100 : t.progress,
                updatedAt: new Date(),
              }
            : t
        ),
        statusLogs: newStatusLog
          ? [...state.statusLogs, newStatusLog]
          : state.statusLogs,
      };
    }),

  reviewAlert: (alertId, status, comment) =>
    set((state) => {
      const alert = state.alerts.find((a) => a.id === alertId);
      const task = alert ? state.tasks.find((t) => t.id === alert.taskId) : undefined;

      let newTasks = state.tasks;
      let newAdjustmentLogs = state.adjustmentLogs;
      let newStatusLogs = state.statusLogs;
      let newAlerts = state.alerts;

      if (status === 'resolved' && alert && task) {
        const adjustmentType =
          alert.type === 'thrust_fluctuation' ? 'guideVaneOpening' : 'bladeAngle';
        const adjustmentDelta =
          alert.type === 'thrust_fluctuation'
            ? alert.value > alert.threshold * 1.3
              ? -5
              : -2
            : alert.value < alert.threshold
            ? 1.5
            : 0.8;

        if (adjustmentType) {
          const beforeParams: Record<string, number> = {};
          const afterParams: Record<string, number> = {};
          const key = adjustmentType as 'guideVaneOpening' | 'bladeAngle';
          beforeParams[key] = task.parameters[key] as number;
          afterParams[key] = parseFloat((task.parameters[key] + adjustmentDelta).toFixed(2));

          const newLog = {
            id: generateId(),
            taskId: alert.taskId,
            adjustedBy: state.currentUser.name,
            beforeParams,
            afterParams,
            reason: `【${alert.title}】触发自动优化：${alert.type === 'thrust_fluctuation' ? '调整导叶开度抑制推力波动' : '调整叶片安放角改善局部压力'}，超出阈值 ${(((alert.value - alert.threshold) / alert.threshold) * 100).toFixed(1)}%。${comment ? ' 复核意见：' + comment : ''}`,
            timestamp: new Date(),
          };
          newAdjustmentLogs = [...newAdjustmentLogs, newLog];

          newTasks = state.tasks.map((t) =>
            t.id === alert.taskId
              ? {
                  ...t,
                  parameters: { ...t.parameters, ...afterParams },
                  adjustmentCount: t.adjustmentCount + 1,
                  updatedAt: new Date(),
                }
              : t
          );

          const statusLog = {
            id: generateId(),
            taskId: alert.taskId,
            fromStatus: task.status,
            toStatus: 'pending_verification',
            operator: state.currentUser.name,
            reason: `参数调整后重新模拟：${alert.title}，${key} ${beforeParams[key]} → ${afterParams[key]}`,
            status: "pending_verification" as TaskStatus,
            description: `参数调整后重新模拟：${alert.title}，${key} ${beforeParams[key]} → ${afterParams[key]}`,
            timestamp: new Date(),
          };
          newStatusLogs = [...newStatusLogs, statusLog];
          newTasks = newTasks.map((t) =>
            t.id === alert.taskId
              ? { ...t, status: 'pending_verification', progress: 0, updatedAt: new Date() }
              : t
          );
        }
      }

      newAlerts = newAlerts.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status,
              reviewComment: comment,
              reviewedBy: state.currentUser.name,
              reviewedAt: new Date(),
            }
          : a
      );

      return {
        alerts: newAlerts,
        tasks: newTasks,
        adjustmentLogs: newAdjustmentLogs,
        statusLogs: newStatusLogs,
      };
    }),

  adjustTaskParams: (taskId, params, reason) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const beforeParams: Record<string, number> = {};
    const afterParams: Record<string, number> = {};

    Object.keys(params).forEach((key) => {
      const k = key as keyof typeof task.parameters;
      if (k in task.parameters) {
        beforeParams[key] = task.parameters[k] as number;
        afterParams[key] = params[key];
      }
    });

    const newLog: AdjustmentLog = {
      id: generateId(),
      taskId,
      adjustedBy: state.currentUser.name,
      beforeParams,
      afterParams,
      reason,
      timestamp: new Date(),
    };

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              parameters: { ...t.parameters, ...params },
              adjustmentCount: t.adjustmentCount + 1,
              updatedAt: new Date(),
            }
          : t
      ),
      adjustmentLogs: [...state.adjustmentLogs, newLog],
    }));
  },

  approveApproval: (approvalId, comment) =>
    set((state) => {
      const existing = state.approvals.find((a) => a.id === approvalId);
      let newApprovals = state.approvals.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status: 'approved' as const,
              approver: state.currentUser.name,
              comment,
              approvedAt: new Date(),
            }
          : a
      );

      if (existing && existing.level === 'level_1') {
        const level2Exists = newApprovals.some(
          (a) => a.taskId === existing.taskId && a.level === 'level_2'
        );
        if (!level2Exists) {
          const newLevel2 = {
            id: generateId(),
            taskId: existing.taskId,
            taskName: existing.taskName,
            level: 'level_2' as const,
            status: 'pending' as const,
            submittedAt: new Date(),
          };
          newApprovals = [...newApprovals, newLevel2];
        } else {
          newApprovals = newApprovals.map((a) =>
            a.taskId === existing.taskId && a.level === 'level_2'
              ? { ...a, status: 'pending' as const, submittedAt: new Date() }
              : a
          );
        }
      }

      let pushedToManufacturing = state.pushedToManufacturing || [];
      if (existing && existing.level === 'level_2') {
        pushedToManufacturing = [...pushedToManufacturing, existing.taskId];
      }

      return {
        approvals: newApprovals,
        pushedToManufacturing,
      };
    }),

  rejectApproval: (approvalId, comment) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status: 'rejected',
              approver: state.currentUser.name,
              comment,
              approvedAt: new Date(),
            }
          : a
      ),
    })),

  createTask: (taskData) => {
    const state = get();
    if (!taskData.modelFile) {
      return;
    }
    const newTask: SimulationTask = {
      id: generateId(),
      name: taskData.name || '新模拟任务',
      description: taskData.description || '',
      status: 'pending_verification',
      progress: 0,
      priority: taskData.priority || 'medium',
      parameters: {
        rotationalSpeed: 100,
        waterHead: 100,
        flowRate: 500,
        guideVaneOpening: 70,
        bladeAngle: 18,
        cavitationModel: 'Schnerr-Sauer',
        turbulenceModel: 'k-ω SST',
        vaporPressure: 2.34,
        ...taskData.parameters,
      },
      meshSettings: {
        adaptiveMesh: true,
        curvatureRefinement: true,
        boundaryLayers: 10,
        baseCellSize: 5,
        maxCellCount: 8000000,
        ...taskData.meshSettings,
      },
      modelFile: {
        name: taskData.modelFile.name,
        size: taskData.modelFile.size,
        format: taskData.modelFile.format,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: state.currentUser.name,
      turbineType: taskData.turbineType || '混流式水轮机',
      alertCount: 0,
      adjustmentCount: 0,
      ...taskData,
    } as SimulationTask;

    set((state) => ({
      tasks: [newTask, ...state.tasks],
      statistics: {
        ...state.statistics,
        totalTasks: state.statistics.totalTasks + 1,
      },
    }));
  },
}));

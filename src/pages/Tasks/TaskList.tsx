import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Zap,
  Clock,
  User,
  AlertTriangle,
  Settings2,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { formatDate, formatFileSize, formatRelativeTime } from '../../utils/formatters';
import { TaskStatus } from '../../types';
import { TASK_STATUS_LABELS } from '../../utils/constants';

const statusFilters: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending_verification', label: '待校验' },
  { value: 'mesh_generation', label: '网格生成' },
  { value: 'cavitation_calculation', label: '空化计算' },
  { value: 'turbulence_calculation', label: '湍流计算' },
  { value: 'stress_analysis', label: '受力分析' },
  { value: 'completed', label: '已完成' },
  { value: 'error', label: '异常' },
];

export function TaskList() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { tasks, alerts } = useAppStore();
  const navigate = useNavigate();

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getTaskAlerts = (taskId: string) => {
    return alerts.filter((a) => a.taskId === taskId && a.status === 'pending').length;
  };

  const priorityColors = {
    high: 'bg-status-danger',
    medium: 'bg-status-warning',
    low: 'bg-status-info',
  };

  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">模拟任务</h1>
          <p className="text-text-secondary text-sm mt-1">
            共 {filteredTasks.length} 个模拟任务
          </p>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建模拟
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === filter.value
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
              />
            </div>
            <button className="p-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-bg-tertiary border border-border rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' ? 'bg-bg-secondary text-accent' : 'text-text-muted'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list' ? 'bg-bg-secondary text-accent' : 'text-text-muted'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task, index) => {
            const pendingAlerts = getTaskAlerts(task.id);
            return (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="card card-hover p-5 group animate-fade-in opacity-0"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                        {task.name}
                      </h3>
                      <p className="text-xs text-text-muted">{task.turbineType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
                      title={`${priorityLabels[task.priority]}优先级`}
                    />
                  </div>
                </div>

                <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                  {task.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-lg bg-bg-tertiary/50">
                    <p className="text-lg font-mono font-bold text-text-primary">
                      {task.parameters.waterHead}
                    </p>
                    <p className="text-xs text-text-muted">水头 (m)</p>
                  </div>
                  <div className="p-2 rounded-lg bg-bg-tertiary/50">
                    <p className="text-lg font-mono font-bold text-text-primary">
                      {task.parameters.rotationalSpeed}
                    </p>
                    <p className="text-xs text-text-muted">转速 (rpm)</p>
                  </div>
                  <div className="p-2 rounded-lg bg-bg-tertiary/50">
                    <p className="text-lg font-mono font-bold text-text-primary">
                      {task.parameters.flowRate}
                    </p>
                    <p className="text-xs text-text-muted">流量 (m³/s)</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-text-muted">
                      {task.progress}%
                    </span>
                  </div>
                  <ProgressBar value={task.progress} size="sm" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {task.createdBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(task.updatedAt)}
                    </span>
                  </div>
                  {pendingAlerts > 0 && (
                    <span className="flex items-center gap-1 text-xs text-status-warning">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {pendingAlerts} 条预警
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-tertiary/50">
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  任务名称
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  状态
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  进度
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  水头/转速/流量
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  创建人
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  更新时间
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <tr
                  key={task.id}
                  className="border-b border-border/50 hover:bg-bg-tertiary/30 transition-colors animate-fade-in opacity-0"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary text-sm">
                          {task.name}
                        </p>
                        <p className="text-xs text-text-muted">{task.turbineType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar value={task.progress} size="sm" />
                      </div>
                      <span className="text-xs text-text-secondary font-mono w-10">
                        {task.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-text-primary font-mono">
                      {task.parameters.waterHead}m / {task.parameters.rotationalSpeed}rpm /{' '}
                      {task.parameters.flowRate}m³/s
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-text-secondary">{task.createdBy}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-text-muted">{formatDate(task.updatedAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-light"
                    >
                      查看
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">未找到任务</h3>
          <p className="text-text-secondary text-sm">尝试调整筛选条件或创建新的模拟任务</p>
        </div>
      )}
    </div>
  );
}

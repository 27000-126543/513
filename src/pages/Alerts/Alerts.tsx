import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Droplets,
  Gauge,
  Activity,
  Zap,
  Waves,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { AlertLevel, AlertStatus, AlertType } from '../../types';
import { ALERT_LEVEL_LABELS, ALERT_TYPE_LABELS } from '../../utils/constants';

const levelColors: Record<AlertLevel, string> = {
  level_1: 'border-status-info bg-status-info/5',
  level_2: 'border-status-warning bg-status-warning/5',
  level_3: 'border-status-danger bg-status-danger/5',
};

const levelBadgeColors: Record<AlertLevel, string> = {
  level_1: 'badge-info',
  level_2: 'badge-warning',
  level_3: 'badge-danger',
};

const typeIcons: Record<AlertType, typeof Droplets> = {
  cavitation_volume: Droplets,
  pressure_fluctuation: Gauge,
  erosion_rate: Activity,
  thrust_fluctuation: Zap,
  vapor_pressure: Waves,
};

const statusFilters: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'reviewed', label: '已复核' },
  { value: 'resolved', label: '已解决' },
  { value: 'ignored', label: '已忽略' },
];

export function Alerts() {
  const { alerts, tasks, reviewAlert } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ alertId: string; action: 'resolve' | 'ignore' } | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.taskName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = alerts.filter((a) => a.status === 'pending').length;

  const handleReview = () => {
    if (!reviewModal) return;
    const status = reviewModal.action === 'resolve' ? 'resolved' : 'ignored';
    reviewAlert(reviewModal.alertId, status, reviewComment);
    setReviewModal(null);
    setReviewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">预警中心</h1>
          <p className="text-text-secondary text-sm mt-1">
            共 {alerts.length} 条预警，{pendingCount} 条待处理
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">待处理</p>
              <p className="text-2xl font-bold text-status-warning font-mono mt-1">
                {alerts.filter((a) => a.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-status-warning/10">
              <Clock className="w-6 h-6 text-status-warning" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已复核</p>
              <p className="text-2xl font-bold text-status-info font-mono mt-1">
                {alerts.filter((a) => a.status === 'reviewed').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-status-info/10">
              <Eye className="w-6 h-6 text-status-info" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已解决</p>
              <p className="text-2xl font-bold text-status-success font-mono mt-1">
                {alerts.filter((a) => a.status === 'resolved').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-status-success/10">
              <CheckCircle className="w-6 h-6 text-status-success" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">三级预警</p>
              <p className="text-2xl font-bold text-status-danger font-mono mt-1">
                {alerts.filter((a) => a.level === 'level_3').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-status-danger/10">
              <AlertTriangle className="w-6 h-6 text-status-danger" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => {
              const count =
                filter.value === 'all'
                  ? alerts.length
                  : alerts.filter((a) => a.status === filter.value).length;
              return (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    statusFilter === filter.value
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  {filter.label}
                  <span
                    className={`px-1.5 py-0.5 text-xs rounded-full ${
                      statusFilter === filter.value ? 'bg-accent/30' : 'bg-bg-tertiary'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="搜索预警..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
              />
            </div>
            <button className="p-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary border border-border transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert, index) => {
          const TypeIcon = typeIcons[alert.type];
          const isExpanded = expandedId === alert.id;

          return (
            <div
              key={alert.id}
              className={`card border-l-4 ${levelColors[alert.level]} animate-fade-in opacity-0`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.level === 'level_3'
                        ? 'bg-status-danger/20'
                        : alert.level === 'level_2'
                        ? 'bg-status-warning/20'
                        : 'bg-status-info/20'
                    }`}
                  >
                    <TypeIcon
                      className={`w-5 h-5 ${
                        alert.level === 'level_3'
                          ? 'text-status-danger'
                          : alert.level === 'level_2'
                          ? 'text-status-warning'
                          : 'text-status-info'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-text-primary">{alert.title}</h3>
                          <span className={`badge ${levelBadgeColors[alert.level]}`}>
                            {ALERT_LEVEL_LABELS[alert.level]}
                          </span>
                          <span className="badge badge-primary">{ALERT_TYPE_LABELS[alert.type]}</span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">{alert.description}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <Link
                        to={`/tasks/${alert.taskId}`}
                        className="text-accent hover:text-accent-light transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {alert.taskName}
                      </Link>
                      <span className="text-text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatRelativeTime(alert.triggeredAt)}
                      </span>
                      <span className="font-mono text-text-secondary">
                        当前值: <span className="text-status-warning">{alert.value}{alert.unit}</span>
                        {' / '}
                        阈值: {alert.threshold}{alert.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-bg-tertiary/50 rounded-lg">
                        <p className="text-xs text-text-muted mb-1">当前值</p>
                        <p className="text-xl font-mono font-bold text-status-warning">
                          {alert.value} {alert.unit}
                        </p>
                      </div>
                      <div className="p-3 bg-bg-tertiary/50 rounded-lg">
                        <p className="text-xs text-text-muted mb-1">警戒阈值</p>
                        <p className="text-xl font-mono font-bold text-text-secondary">
                          {alert.threshold} {alert.unit}
                        </p>
                      </div>
                      <div className="p-3 bg-bg-tertiary/50 rounded-lg">
                        <p className="text-xs text-text-muted mb-1">超出幅度</p>
                        <p className="text-xl font-mono font-bold text-status-danger">
                          {(((alert.value - alert.threshold) / alert.threshold) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {alert.reviewedBy && (
                      <div className="p-3 bg-bg-tertiary/30 rounded-lg mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-text-muted" />
                          <span className="text-text-secondary">{alert.reviewedBy}</span>
                          <span className="text-text-muted">于</span>
                          <span className="text-text-secondary">
                            {alert.reviewedAt ? formatDate(alert.reviewedAt) : '-'}
                          </span>
                          <span className="text-text-muted">复核</span>
                        </div>
                        {alert.reviewComment && (
                          <p className="text-sm text-text-primary mt-2 ml-6">
                            "{alert.reviewComment}"
                          </p>
                        )}
                      </div>
                    )}

                    {alert.status === 'pending' && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewModal({ alertId: alert.id, action: 'resolve' });
                          }}
                          className="btn-success text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          标记已解决
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewModal({ alertId: alert.id, action: 'ignore' });
                          }}
                          className="btn-secondary text-sm flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          忽略
                        </button>
                        <Link
                          to={`/tasks/${alert.taskId}`}
                          className="btn-primary text-sm flex items-center gap-2 ml-auto"
                        >
                          查看任务
                          →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="card p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">暂无预警</h3>
          <p className="text-text-secondary text-sm">当前筛选条件下没有找到预警记录</p>
        </div>
      )}

      {reviewModal && (() => {
        const alert = alerts.find((a) => a.id === reviewModal.alertId);
        const task = alert ? tasks.find((t) => t.id === alert.taskId) : undefined;
        const isResolve = reviewModal.action === 'resolve';
        const isAutoAdjust =
          isResolve && alert && (alert.type === 'thrust_fluctuation' || alert.type === 'vapor_pressure');
        const adjustmentType =
          alert?.type === 'thrust_fluctuation' ? 'guideVaneOpening' : 'bladeAngle';
        const adjustmentDelta = alert
          ? alert.type === 'thrust_fluctuation'
            ? alert.value > alert.threshold * 1.3
              ? -5
              : -2
            : alert.type === 'vapor_pressure'
            ? alert.value < alert.threshold
              ? 1.5
              : 0.8
            : 0
          : 0;
        const key = adjustmentType as 'guideVaneOpening' | 'bladeAngle';
        const beforeVal = task?.parameters?.[key];
        const afterVal = beforeVal !== undefined ? parseFloat((beforeVal + adjustmentDelta).toFixed(2)) : undefined;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-md animate-fade-in">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {reviewModal.action === 'resolve' ? '复核通过并优化' : '忽略预警'}
              </h3>
              {isAutoAdjust && task && (
                <div className="mb-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <h4 className="font-medium text-accent text-sm mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    系统自动优化方案
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">调整参数</span>
                      <span className="text-text-primary font-medium">
                        {key === 'guideVaneOpening' ? '导叶开度' : '叶片安放角'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">当前值</span>
                      <span className="font-mono text-status-warning">
                        {beforeVal}{key === 'guideVaneOpening' ? '%' : '°'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">调整后</span>
                      <span className="font-mono text-status-success">
                        {afterVal}{key === 'guideVaneOpening' ? '%' : '°'}
                        {' '}({adjustmentDelta > 0 ? '+' : ''}{adjustmentDelta}{key === 'guideVaneOpening' ? '%' : '°'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-text-muted">任务状态</span>
                      <span className="text-text-primary">
                        重置为<span className="badge badge-warning ml-2">待校验</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="label">复核意见 {!isAutoAdjust && <span className="text-text-muted">(可选)</span>}</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input h-24 resize-none"
                  placeholder={
                    isAutoAdjust
                      ? '请输入复核意见，将自动记录到调整日志...'
                      : '请输入忽略该预警的原因...'
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setReviewModal(null);
                    setReviewComment('');
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleReview} className="btn-primary">
                  {reviewModal.action === 'resolve'
                    ? isAutoAdjust
                      ? '确认调整并重新模拟'
                      : '确认解决'
                    : '确认忽略'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

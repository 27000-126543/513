import ReactECharts from 'echarts-for-react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  TrendingDown,
  TrendingUp,
  Target,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { formatPercent, formatNumber, formatRelativeTime } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  delay?: string;
}

function StatCard({ title, value, icon, trend, trendLabel, color, delay = '' }: StatCardProps) {
  const colorClasses = {
    accent: 'from-accent/20 to-accent/5 border-accent/30',
    success: 'from-status-success/20 to-status-success/5 border-status-success/30',
    warning: 'from-status-warning/20 to-status-warning/5 border-status-warning/30',
    danger: 'from-status-danger/20 to-status-danger/5 border-status-danger/30',
    info: 'from-status-info/20 to-status-info/5 border-status-info/30',
  };

  const iconColorClasses = {
    accent: 'text-accent',
    success: 'text-status-success',
    warning: 'text-status-warning',
    danger: 'text-status-danger',
    info: 'text-status-info',
  };

  return (
    <div
      className={`stat-card bg-gradient-to-br ${colorClasses[color]} animate-fade-in opacity-0 ${delay}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-text-primary font-mono">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-status-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-status-danger" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend >= 0 ? 'text-status-success' : 'text-status-danger'
                }`}
              >
                {trend >= 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-text-muted">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-bg-tertiary/50 ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { statistics, trendData, tasks, alerts } = useAppStore();

  const recentTasks = tasks.slice(0, 5);
  const pendingAlerts = alerts.filter((a) => a.status === 'pending').slice(0, 4);

  const trendChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#1E3A5F',
      textStyle: { color: '#E8F1FF', fontSize: 12 },
      axisPointer: {
        type: 'line',
        lineStyle: { color: '#00D4FF', type: 'dashed' },
      },
    },
    legend: {
      data: ['完成率', '任务数', '优化次数'],
      textStyle: { color: '#8AA0C0', fontSize: 12 },
      top: 0,
      right: 0,
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: {
      left: 48,
      right: 48,
      top: 40,
      bottom: 24,
    },
    xAxis: {
      type: 'category',
      data: trendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#1E3A5F' } },
      axisTick: { show: false },
      axisLabel: { color: '#5A7090', fontSize: 11 },
    },
    yAxis: [
      {
        type: 'value',
        name: '完成率',
        position: 'left',
        axisLabel: {
          color: '#5A7090',
          fontSize: 11,
          formatter: '{value}%',
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#142640', type: 'dashed' } },
        max: 100,
      },
      {
        type: 'value',
        name: '数量',
        position: 'right',
        axisLabel: { color: '#5A7090', fontSize: 11 },
        axisLine: { show: false },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '完成率',
        type: 'line',
        yAxisIndex: 0,
        data: trendData.map((d) => (d.completionRate * 100).toFixed(1)),
        smooth: true,
        lineStyle: { color: '#00D4FF', width: 2 },
        itemStyle: { color: '#00D4FF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: '任务数',
        type: 'bar',
        yAxisIndex: 1,
        data: trendData.map((d) => d.taskCount),
        barWidth: 16,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(68, 138, 255, 0.6)' },
              { offset: 1, color: 'rgba(68, 138, 255, 0.1)' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: '优化次数',
        type: 'line',
        yAxisIndex: 1,
        data: trendData.map((d) => d.optimizationCount),
        smooth: true,
        lineStyle: { color: '#00C853', width: 2, type: 'dashed' },
        itemStyle: { color: '#00C853' },
        symbol: 'diamond',
        symbolSize: 6,
      },
    ],
  };

  const erosionChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#1E3A5F',
      textStyle: { color: '#E8F1FF', fontSize: 12 },
      formatter: '{b}<br/>空蚀深度: {c} mm',
    },
    grid: { left: 48, right: 24, top: 16, bottom: 24 },
    xAxis: {
      type: 'category',
      data: trendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#1E3A5F' } },
      axisTick: { show: false },
      axisLabel: { color: '#5A7090', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: 'mm',
      axisLabel: { color: '#5A7090', fontSize: 11 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#142640', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        data: trendData.map((d) => d.avgErosionDepth.toFixed(3)),
        smooth: true,
        lineStyle: { color: '#FF6B35', width: 2 },
        itemStyle: { color: '#FF6B35' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 53, 0.25)' },
              { offset: 1, color: 'rgba(255, 107, 53, 0)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 6,
        markLine: {
          silent: true,
          lineStyle: { color: '#FF1744', type: 'dashed' },
          data: [{ yAxis: 0.4, label: { formatter: '阈值 0.4', color: '#FF1744', fontSize: 10 } }],
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">综合看板</h1>
          <p className="text-text-secondary text-sm mt-1">
            实时监控空化模拟平台运行状态与性能指标
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input w-40 text-sm">
            <option>最近7天</option>
            <option>最近14天</option>
            <option>最近30天</option>
            <option>最近90天</option>
          </select>
          <Link to="/tasks/new" className="btn-primary text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            新建模拟
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="模拟完成率"
          value={formatPercent(statistics.completionRate, 1)}
          icon={<Target className="w-6 h-6" />}
          trend={5.2}
          trendLabel="较上周"
          color="accent"
          delay="animate-stagger-1"
        />
        <StatCard
          title="平均空蚀深度偏差"
          value={`${formatNumber(statistics.avgErosionDepthDeviation, 3)} mm`}
          icon={<Activity className="w-6 h-6" />}
          trend={-8.5}
          trendLabel="较上月"
          color="success"
          delay="animate-stagger-2"
        />
        <StatCard
          title="优化收敛次数"
          value={statistics.optimizationConvergenceCount.toString()}
          icon={<CheckCircle2 className="w-6 h-6" />}
          trend={12.3}
          trendLabel="较上月"
          color="info"
          delay="animate-stagger-3"
        />
        <StatCard
          title="活跃预警"
          value={statistics.activeAlerts.toString()}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="warning"
          delay="animate-stagger-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5 animate-fade-in opacity-0 animate-stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">性能趋势</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-xs rounded-md bg-accent/10 text-accent border border-accent/30">
                完成率
              </button>
              <button className="px-3 py-1 text-xs rounded-md text-text-muted hover:text-text-secondary hover:bg-bg-tertiary">
                空蚀深度
              </button>
            </div>
          </div>
          <ReactECharts option={trendChartOption} style={{ height: 280 }} notMerge={true} />
        </div>

        <div className="card p-5 animate-fade-in opacity-0 animate-stagger-3">
          <h3 className="text-lg font-semibold text-text-primary mb-4">空蚀深度趋势</h3>
          <ReactECharts option={erosionChartOption} style={{ height: 280 }} notMerge={true} />
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">材料耐受阈值</span>
              <span className="text-status-danger font-mono">0.400 mm</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-text-secondary">当前平均值</span>
              <span className="text-status-warning font-mono">
                {statistics.avgErosionDepthDeviation.toFixed(3)} mm
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5 animate-fade-in opacity-0 animate-stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">最近模拟任务</h3>
            <Link
              to="/tasks"
              className="text-sm text-accent hover:text-accent-light transition-colors"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {recentTasks.map((task, index) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="flex items-center gap-4 p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary border border-transparent hover:border-border transition-all"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary truncate">{task.name}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(task.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-mono text-text-primary">
                    {task.progress}%
                  </div>
                  <div className="w-20 h-1.5 bg-bg-tertiary rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-5 animate-fade-in opacity-0 animate-stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">待处理预警</h3>
            <Link
              to="/alerts"
              className="text-sm text-accent hover:text-accent-light transition-colors"
            >
              全部预警 →
            </Link>
          </div>
          <div className="space-y-3">
            {pendingAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-bg-tertiary/50 border-l-2 border-status-warning"
                style={{ animationDelay: `${0.35 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-text-primary">{alert.title}</p>
                  <span className="text-xs text-text-muted">
                    {formatRelativeTime(alert.triggeredAt)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {alert.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono text-status-warning">
                    当前: {alert.value}{alert.unit}
                  </span>
                  <span className="text-xs text-text-muted">
                    阈值: {alert.threshold}{alert.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in opacity-0 animate-stagger-6">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-text-primary font-mono">{statistics.totalTasks}</p>
          <p className="text-sm text-text-secondary mt-1">总任务数</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-status-success font-mono">{statistics.completedTasks}</p>
          <p className="text-sm text-text-secondary mt-1">已完成</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-status-info font-mono">{statistics.tasksToday}</p>
          <p className="text-sm text-text-secondary mt-1">今日新增</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-text-primary font-mono">
            {statistics.avgSimulationTime.toFixed(1)}h
          </p>
          <p className="text-sm text-text-secondary mt-1">平均模拟时长</p>
        </div>
      </div>
    </div>
  );
}

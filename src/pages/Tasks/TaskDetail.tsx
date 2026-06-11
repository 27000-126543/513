import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft,
  Layers,
  Clock,
  User,
  FileText,
  Settings2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Play,
  Pause,
  Grid3X3,
  Droplets,
  Wind,
  Gauge,
  Activity,
  Zap,
  FileBarChart,
  Download,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import {
  formatDate,
  formatFileSize,
  formatNumber,
  formatRelativeTime,
} from '../../utils/formatters';
import { SIMULATION_STEPS, TASK_STATUS_LABELS } from '../../utils/constants';
import { MonitoringData, TaskStatus } from '../../types';

const stepIconMap: Record<string, typeof Clock> = {
  Clock,
  Grid3X3,
  Droplets,
  Wind,
  Gauge,
  CheckCircle2,
};

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTaskById, getAlertsByTaskId, getMonitoringData, getAdjustmentLogs, getStatusLogs } =
    useAppStore();

  const task = getTaskById(id || '');
  const alerts = getAlertsByTaskId(id || '');
  const monitoringData = getMonitoringData(id || '');
  const adjustmentLogs = getAdjustmentLogs(id || '');
  const statusLogs = getStatusLogs(id || '');

  const [activeTab, setActiveTab] = useState<'monitoring' | 'details' | 'logs' | 'report'>('monitoring');
  const [isPaused, setIsPaused] = useState(false);
  const [localData, setLocalData] = useState<MonitoringData[]>(monitoringData);

  useEffect(() => {
    if (task && ['cavitation_calculation', 'turbulence_calculation', 'stress_analysis'].includes(task.status) && !isPaused) {
      const interval = setInterval(() => {
        setLocalData((prev) => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1];
          const newPoint: MonitoringData = {
            timestamp: last.timestamp + 10,
            cavitationVolume: Math.max(0.5, last.cavitationVolume + (Math.random() - 0.48) * 1),
            pressureFluctuation: Math.max(10, last.pressureFluctuation + (Math.random() - 0.5) * 3),
            erosionRate: Math.max(0.01, last.erosionRate + (Math.random() - 0.48) * 0.01),
            thrustFluctuation: Math.max(0.5, last.thrustFluctuation + (Math.random() - 0.48) * 0.3),
            minPressure: Math.max(1, last.minPressure + (Math.random() - 0.5) * 0.2),
            maxShearStress: Math.max(50, last.maxShearStress + (Math.random() - 0.5) * 10),
          };
          return [...prev.slice(-199), newPoint];
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [task, isPaused]);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Layers className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">任务不存在</h2>
        <p className="text-text-secondary mb-4">找不到指定的模拟任务</p>
        <button onClick={() => navigate('/tasks')} className="btn-primary">
          返回任务列表
        </button>
      </div>
    );
  }

  const currentStepIndex = SIMULATION_STEPS.findIndex((s) => s.id === task.status);

  const monitoringChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#1E3A5F',
      textStyle: { color: '#E8F1FF', fontSize: 12 },
      axisPointer: { type: 'cross', lineStyle: { color: '#00D4FF', type: 'dashed' } },
    },
    legend: {
      data: ['空泡体积分数', '压力脉动', '空蚀速率'],
      textStyle: { color: '#8AA0C0', fontSize: 12 },
      top: 0,
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: { left: 48, right: 48, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      data: localData.map((d) => `${d.timestamp}s`),
      axisLine: { lineStyle: { color: '#1E3A5F' } },
      axisTick: { show: false },
      axisLabel: { color: '#5A7090', fontSize: 10 },
    },
    yAxis: [
      {
        type: 'value',
        name: '体积分数 (%)',
        position: 'left',
        axisLabel: { color: '#5A7090', fontSize: 10 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#142640', type: 'dashed' } },
      },
      {
        type: 'value',
        name: '压力 (kPa)',
        position: 'right',
        axisLabel: { color: '#5A7090', fontSize: 10 },
        axisLine: { show: false },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '空泡体积分数',
        type: 'line',
        yAxisIndex: 0,
        data: localData.map((d) => d.cavitationVolume.toFixed(2)),
        smooth: true,
        lineStyle: { color: '#00D4FF', width: 2 },
        itemStyle: { color: '#00D4FF' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.25)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0)' },
            ],
          },
        },
        showSymbol: false,
      },
      {
        name: '压力脉动',
        type: 'line',
        yAxisIndex: 1,
        data: localData.map((d) => d.pressureFluctuation.toFixed(1)),
        smooth: true,
        lineStyle: { color: '#FF6B35', width: 2 },
        itemStyle: { color: '#FF6B35' },
        showSymbol: false,
      },
      {
        name: '空蚀速率',
        type: 'line',
        yAxisIndex: 0,
        data: localData.map((d) => (d.erosionRate * 100).toFixed(2)),
        smooth: true,
        lineStyle: { color: '#00C853', width: 2, type: 'dashed' },
        itemStyle: { color: '#00C853' },
        showSymbol: false,
      },
    ],
  };

  const thrustChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#1E3A5F',
      textStyle: { color: '#E8F1FF', fontSize: 12 },
      formatter: '{b}<br/>推力波动: {c}%',
    },
    grid: { left: 48, right: 24, top: 16, bottom: 32 },
    xAxis: {
      type: 'category',
      data: localData.map((d) => `${d.timestamp}s`),
      axisLine: { lineStyle: { color: '#1E3A5F' } },
      axisTick: { show: false },
      axisLabel: { color: '#5A7090', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: '波动 (%)',
      axisLabel: { color: '#5A7090', fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#142640', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        data: localData.map((d) => d.thrustFluctuation.toFixed(2)),
        smooth: true,
        lineStyle: { color: '#FF1744', width: 2 },
        itemStyle: { color: '#FF1744' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 23, 68, 0.2)' },
              { offset: 1, color: 'rgba(255, 23, 68, 0)' },
            ],
          },
        },
        showSymbol: false,
        markLine: {
          silent: true,
          lineStyle: { color: '#FF6B35', type: 'dashed' },
          data: [
            { yAxis: 5, label: { formatter: '阈值 5%', color: '#FF6B35', fontSize: 10 } },
          ],
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 rounded-lg bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text-primary">{task.name}</h1>
            <StatusBadge status={task.status} />
            <span className="text-xs text-text-muted">ID: {task.id}</span>
          </div>
          <p className="text-text-secondary text-sm mt-1">{task.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {task.status === 'error' && (
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4" />
              重新开始
            </button>
          )}
          {task.status === 'completed' && (
            <button className="btn-primary flex items-center gap-2 text-sm">
              <FileBarChart className="w-4 h-4" />
              生成报告
            </button>
          )}
          {['cavitation_calculation', 'turbulence_calculation', 'stress_analysis'].includes(
            task.status
          ) && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  继续计算
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  暂停
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">计算流程</h3>
        <div className="flex items-center justify-between">
          {SIMULATION_STEPS.map((step, index) => {
            const Icon = stepIconMap[step.icon] || Clock;
            const isCompleted = currentStepIndex > index || task.status === 'completed';
            const isCurrent = step.id === task.status;
            const isError = task.status === 'error' && index === currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                {index < SIMULATION_STEPS.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isCompleted ? 'bg-status-success' : 'bg-border'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-status-success border-status-success text-white'
                      : isCurrent
                      ? 'bg-accent/20 border-accent text-accent animate-pulse'
                      : isError
                      ? 'bg-status-danger/20 border-status-danger text-status-danger'
                      : 'bg-bg-tertiary border-border text-text-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    isCurrent || isCompleted
                      ? 'text-text-primary font-medium'
                      : 'text-text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <ProgressBar value={task.progress} showLabel size="lg" />
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'monitoring', label: '实时监控', icon: Activity },
          { id: 'details', label: '参数详情', icon: Settings2 },
          { id: 'logs', label: '调整日志', icon: FileText },
          { id: 'report', label: '模拟报告', icon: FileBarChart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          {localData.length === 0 ? (
            <div className="card p-12 text-center">
              <Activity className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">暂无实时监控数据</h3>
              <p className="text-text-secondary text-sm">
                {task.status === 'pending_verification'
                  ? '任务待校验中，请等待校验通过后开始计算'
                  : task.status === 'mesh_generation'
                  ? '正在生成自适应网格，请等待网格生成完成'
                  : task.status === 'completed'
                  ? '该任务已完成，模拟过程中未产生监控数据序列'
                  : task.status === 'error'
                  ? '任务计算异常，已终止数据采集'
                  : '等待计算开始...'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <p className="text-text-secondary text-sm">最大空泡体积分数</p>
                  <p className="text-2xl font-bold text-accent font-mono mt-2">
                    {formatNumber(Math.max(...localData.map((d) => d.cavitationVolume)), 2)}%
                  </p>
                  <p className="text-xs text-text-muted mt-1">体积分数 / 阈值 10%</p>
                </div>
                <div className="stat-card">
                  <p className="text-text-secondary text-sm">压力脉动幅值</p>
                  <p className="text-2xl font-bold text-status-warning font-mono mt-2">
                    {formatNumber(Math.max(...localData.map((d) => d.pressureFluctuation)), 1)} kPa
                  </p>
                  <p className="text-xs text-text-muted mt-1">最大脉动值</p>
                </div>
                <div className="stat-card">
                  <p className="text-text-secondary text-sm">空蚀速率</p>
                  <p className="text-2xl font-bold text-status-danger font-mono mt-2">
                    {formatNumber(Math.max(...localData.map((d) => d.erosionRate)), 3)} mm/年
                  </p>
                  <p className="text-xs text-text-muted mt-1">材料限值 0.4 mm/年</p>
                </div>
                <div className="stat-card">
                  <p className="text-text-secondary text-sm">推力波动</p>
                  <p className="text-2xl font-bold text-status-info font-mono mt-2">
                    {formatNumber(Math.max(...localData.map((d) => d.thrustFluctuation)), 2)}%
                  </p>
                  <p className="text-xs text-text-muted mt-1">阈值 5%</p>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-lg font-semibold text-text-primary mb-4">空化与压力监控</h3>
                <ReactECharts option={monitoringChartOption} style={{ height: 320 }} notMerge={true} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">推力波动监控</h3>
                  <ReactECharts option={thrustChartOption} style={{ height: 240 }} notMerge={true} />
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">预警记录</h3>
                    <span className="text-sm text-text-muted">共 {alerts.length} 条</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                    {alerts.length > 0 ? (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border-l-2 ${
                            alert.level === 'level_3'
                              ? 'border-status-danger bg-status-danger/5'
                              : alert.level === 'level_2'
                              ? 'border-status-warning bg-status-warning/5'
                              : 'border-status-info bg-status-info/5'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-text-primary">{alert.title}</p>
                            <span className="text-xs text-text-muted">
                              {formatRelativeTime(alert.triggeredAt)}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-1">{alert.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-mono text-accent">
                              {alert.value}{alert.unit}
                            </span>
                            <span
                              className={`text-xs ${
                                alert.status === 'pending'
                                  ? 'text-status-warning'
                                  : alert.status === 'resolved'
                                  ? 'text-status-success'
                                  : 'text-text-muted'
                              }`}
                            >
                              {alert.status === 'pending'
                                ? '待处理'
                                : alert.status === 'resolved'
                                ? '已解决'
                                : alert.status === 'reviewed'
                                ? '已复核'
                                : '已忽略'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-text-muted">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无预警记录</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-accent" />
              工况参数
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">转速</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.parameters.rotationalSpeed} rpm
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">水头</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.parameters.waterHead} m
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">流量</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.parameters.flowRate} m³/s
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">导叶开度</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.parameters.guideVaneOpening}%
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">叶片安放角</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.parameters.bladeAngle}°
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">汽化压力</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.parameters.vaporPressure} kPa
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              数值模型
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-bg-tertiary/50 rounded-lg">
                <span className="text-text-secondary text-sm">空化模型</span>
                <span className="text-text-primary font-medium">
                  {task.parameters.cavitationModel}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bg-tertiary/50 rounded-lg">
                <span className="text-text-secondary text-sm">湍流模型</span>
                <span className="text-text-primary font-medium">
                  {task.parameters.turbulenceModel}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bg-tertiary/50 rounded-lg">
                <span className="text-text-secondary text-sm">自适应网格</span>
                <span className={task.meshSettings.adaptiveMesh ? 'text-status-success' : 'text-text-muted'}>
                  {task.meshSettings.adaptiveMesh ? '已启用' : '未启用'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-bg-tertiary/50 rounded-lg">
                <span className="text-text-secondary text-sm">曲率细化</span>
                <span className={task.meshSettings.curvatureRefinement ? 'text-status-success' : 'text-text-muted'}>
                  {task.meshSettings.curvatureRefinement ? '已启用' : '未启用'}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-accent" />
              网格信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">基元尺寸</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.meshSettings.baseCellSize} mm
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">边界层数</p>
                <p className="text-lg font-mono text-text-primary">
                  {task.meshSettings.boundaryLayers} 层
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">最大单元数</p>
                <p className="text-lg font-mono text-text-primary">
                  {(task.meshSettings.maxCellCount / 1000000).toFixed(1)} M
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              模型文件
            </h3>
            <div className="p-4 bg-bg-tertiary/50 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{task.modelFile.name}</p>
                  <p className="text-sm text-text-muted">
                    {task.modelFile.format} · {formatFileSize(task.modelFile.size)}
                  </p>
                </div>
                <button className="p-2 rounded-lg bg-bg-secondary text-text-secondary hover:text-accent transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">水轮机类型</span>
                <span className="text-text-primary">{task.turbineType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">创建人</span>
                <span className="text-text-primary">{task.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">创建时间</span>
                <span className="text-text-primary">{formatDate(task.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-4">状态流转记录</h3>
            <div className="space-y-4">
              {statusLogs.map((log, index) => (
                <div key={log.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-accent' : 'bg-border'
                      }`}
                    />
                    {index < statusLogs.length - 1 && (
                      <div className="w-px h-full bg-border flex-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">
                        {TASK_STATUS_LABELS[log.status as TaskStatus] || log.status}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">参数调整日志</h3>
              <span className="text-sm text-text-muted">共 {adjustmentLogs.length} 次</span>
            </div>
            {adjustmentLogs.length > 0 ? (
              <div className="space-y-4">
                {adjustmentLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-bg-tertiary/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-muted" />
                        <span className="text-sm font-medium text-text-primary">
                          {log.adjustedBy}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 bg-bg-secondary rounded">
                        <p className="text-xs text-text-muted mb-1">调整前</p>
                        {Object.entries(log.beforeParams).map(([key, value]) => (
                          <p key={key} className="text-sm font-mono text-text-secondary">
                            {key}: {value}
                          </p>
                        ))}
                      </div>
                      <div className="p-2 bg-accent/10 rounded border border-accent/30">
                        <p className="text-xs text-text-muted mb-1">调整后</p>
                        {Object.entries(log.afterParams).map(([key, value]) => (
                          <p key={key} className="text-sm font-mono text-accent">
                            {key}: {value}
                          </p>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">
                      <span className="text-text-muted">原因：</span>
                      {log.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无参数调整记录</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="card p-12 text-center">
          <FileBarChart className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">报告生成中</h3>
          <p className="text-text-secondary text-sm mb-6">
            模拟完成后将自动生成包含空泡分布云图、压力系数曲线等内容的综合报告
          </p>
          <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
            等待模拟完成...
          </button>
        </div>
      )}
    </div>
  );
}

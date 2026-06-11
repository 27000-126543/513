import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  FileBarChart,
  Search,
  Download,
  Eye,
  Clock,
  User,
  FileText,
  Layers,
  DownloadCloud,
  Filter,
  ChevronDown,
  ChevronUp,
  Activity,
  Gauge,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import {
  formatDate,
  formatFileSize,
  formatNumber,
  formatRelativeTime,
  exportToCSV,
  exportReportPDF,
  generateCavitationDataByWaterHead,
  generateCavitationDataBySpeed,
  generateCavitationDataByGuideVane,
} from '../../utils/formatters';

export function Reports() {
  const { reports, tasks } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cavitation' | 'pressure' | 'stress'>(
    'overview'
  );

  const filteredReports = reports.filter(
    (r) =>
      r.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ''
  );

  const selected = reports.find((r) => r.id === selectedReport) || reports[0];
  const selectedTask = selected ? tasks.find((t) => t.id === selected.taskId) : undefined;

  const pressureChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#1E3A5F',
      textStyle: { color: '#E8F1FF', fontSize: 12 },
    },
    grid: { left: 48, right: 24, top: 16, bottom: 32 },
    xAxis: {
      type: 'category',
      data: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
      name: '叶片弦长 (%)',
      axisLine: { lineStyle: { color: '#1E3A5F' } },
      axisTick: { show: false },
      axisLabel: { color: '#5A7090', fontSize: 10 },
      nameTextStyle: { color: '#5A7090' },
    },
    yAxis: {
      type: 'value',
      name: '压力系数 Cp',
      axisLabel: { color: '#5A7090', fontSize: 10 },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#142640', type: 'dashed' } },
    },
    series: [
      {
        name: '压力面',
        type: 'line',
      smooth: true,
      data: [1.2, 1.0, 0.8, 0.6, 0.4, 0.2, 0.1, 0.0, -0.1, -0.2, -0.3],
      lineStyle: { color: '#00D4FF', width: 2 },
      itemStyle: { color: '#00D4FF' },
      showSymbol: false,
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0)' },
          ],
        },
      },
    },
    {
      name: '吸力面',
      type: 'line',
      smooth: true,
      data: [-0.5, -0.8, -1.0, -1.2, -1.5, -1.3, -1.0, -0.8, -0.6, -0.4, -0.2],
      lineStyle: { color: '#FF6B35', width: 2 },
      itemStyle: { color: '#FF6B35' },
      showSymbol: false,
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 107, 53, 0.3)' },
            { offset: 1, color: 'rgba(255, 107, 53, 0)' },
          ],
        },
      },
      markLine: {
        silent: true,
        lineStyle: { color: '#FF1744', type: 'dashed' },
        data: [{ yAxis: -1.2, label: { formatter: '汽化压力', color: '#FF1744', fontSize: 10 } }],
      },
    },
    ],
  } as any;

  const efficiencyChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 56, 0.95)',
      borderColor: '#1E3A5F',
      textStyle: { color: '#E8F1FF', fontSize: 12 },
    },
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 85,
        max: 100,
        progress: {
          show: true,
          width: 18,
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#00D4FF' },
                { offset: 1, color: '#00C853' },
              ],
            },
          },
        },
        axisLine: { lineStyle: { width: 18, color: [[1, '#1E3A5F']] } } as any,
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 32,
          fontWeight: 'bold',
          color: '#E8F1FF',
          offsetCenter: [0, '0%'],
          formatter: '{value}%',
        },
        data: [{ value: selected?.summaryData.efficiency || 94.2, name: '效率' }],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">报告中心</h1>
          <p className="text-text-secondary text-sm mt-1">
            模拟完成后自动生成综合分析报告，支持数据导出
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="搜索报告..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
              />
            </div>

            <div className="space-y-2 max-h-[600px overflow-y-auto scrollbar-thin pr-1">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedReport === report.id
                      ? 'bg-accent/10 border border-accent/30'
                      : 'hover:bg-bg-tertiary/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileBarChart className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm truncate">
                        {report.taskName}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatFileSize(report.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-text-primary mb-3">数据导出</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (selected) {
                    exportToCSV(
                      generateCavitationDataByWaterHead(selectedTask || selected),
                      `${selected.taskName}_按水头空化数据_${formatDate(new Date()).replace(/[: ]/g, '-')}.csv`
                    );
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary border border-border hover:border-accent/30 transition-all text-left">
                <DownloadCloud className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-text-primary">按水头导出</p>
                  <p className="text-xs text-text-muted">全水头范围空化数据</p>
                </div>
              </button>
              <button
                onClick={() => {
                  if (selected) {
                    exportToCSV(
                      generateCavitationDataBySpeed(selectedTask || selected),
                      `${selected.taskName}_按转速叶片载荷_${formatDate(new Date()).replace(/[: ]/g, '-')}.csv`
                    );
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary border border-border hover:border-accent/30 transition-all text-left">
                <DownloadCloud className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-text-primary">按转速导出</p>
                  <p className="text-xs text-text-muted">不同转速下叶片载荷</p>
                </div>
              </button>
              <button
                onClick={() => {
                  if (selected) {
                    exportToCSV(
                      generateCavitationDataByGuideVane(selectedTask || selected),
                      `${selected.taskName}_按导叶开度性能_${formatDate(new Date()).replace(/[: ]/g, '-')}.csv`
                    );
                  }
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary border border-border hover:border-accent/30 transition-all text-left">
                <DownloadCloud className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-text-primary">按导叶开度导出</p>
                  <p className="text-xs text-text-muted">全开度范围性能曲线</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {selected.taskName}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  生成于 {formatDate(selected.generatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selected) {
                      exportReportPDF(selected, selectedTask);
                    }
                  }}
                  className="btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  下载报告
                </button>
              </div>
            </div>

            <div className="flex gap-2 px-5 pt-4 border-b border-border">
              {[
                { id: 'overview', label: '概览' },
                { id: 'cavitation', label: '空化分析' },
                { id: 'pressure', label: '压力分布' },
                { id: 'stress', label: '应力分析' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="stat-card">
                      <p className="text-text-secondary text-sm">最大空泡体积分数</p>
                      <p className="text-2xl font-bold text-accent font-mono mt-1">
                        {selected.summaryData.maxCavitationVolume}%
                      </p>
                    </div>
                    <div className="stat-card">
                      <p className="text-text-secondary text-sm">平均压力脉动</p>
                      <p className="text-2xl font-bold text-status-warning font-mono mt-1">
                        {selected.summaryData.avgPressureFluctuation} kPa
                      </p>
                    </div>
                    <div className="stat-card">
                      <p className="text-text-secondary text-sm">最大空蚀速率</p>
                      <p className="text-2xl font-bold text-status-danger font-mono mt-1">
                        {selected.summaryData.maxErosionRate} mm/年
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-bg-tertiary/30 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent" />
                        水力效率
                      </h4>
                      <ReactECharts
                        option={efficiencyChartOption}
                        style={{ height: 200 }}
                        notMerge={true}
                      />
                    </div>

                    <div className="p-5 bg-bg-tertiary/30 rounded-lg">
                      <h4 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-accent" />
                        关键指标
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm">最大剪切应力</span>
                          <span className="font-mono text-text-primary">
                            {selected.summaryData.maxShearStress} kPa
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-status-warning rounded-full"
                            style={{ width: '65%' }}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm">叶片升力</span>
                          <span className="font-mono text-text-primary">
                            {selected.summaryData.bladeLiftForce} kN
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-status-success rounded-full"
                            style={{ width: '78%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-bg-tertiary/30 rounded-lg">
                    <h4 className="font-medium text-text-primary mb-3">结论</h4>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-success mt-1.5 flex-shrink-0" />
                      <span>
                        优化后空泡体积分数降低18.5%，空化性能显著提升</span>
                      </li>
                      <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-success mt-1.5 flex-shrink-0" />
                      <span>
                        叶片表面最大压力脉动处于合理范围，无异常高压区</span>
                      </li>
                      <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-warning mt-1.5 flex-shrink-0" />
                      <span>
                        出水边空蚀速率接近材料限值，建议采用涂层方案可延长寿命</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'cavitation' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-bg-tertiary/30 rounded-lg">
                    <h4 className="font-medium text-text-primary mb-4">空泡体积分布云图</h4>
                    <div className="aspect-video bg-gradient-to-br from-bg-secondary to-bg-tertiary rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-transparent to-transparent opacity-50" />
                      <div className="text-center relative z-10">
                        <Layers className="w-16 h-16 text-accent/50 mx-auto mb-2" />
                        <p className="text-text-muted">空泡分布云图预览</p>
                        <p className="text-xs text-text-muted mt-1">
                          蓝色-青色-黄色-红色 表示体积分数递增</p>
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <div className="w-32 h-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-red-500" />
                          <span className="text-xs text-text-muted">低 → 高</span>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-bg-tertiary/30 rounded-lg">
                      <h5 className="text-sm font-medium text-text-primary mb-2">
                        空泡体积分数时间历程
                      </h5>
                      <ReactECharts
                        option={{
                          backgroundColor: 'transparent',
                          grid: { left: 40, right: 20, top: 20, bottom: 30 },
                          xAxis: {
                          type: 'category',
                          data: ['0', '5', '10', '15', '20', '25', '30'],
                          axisLine: { lineStyle: { color: '#1E3A5F' } },
                          axisTick: { show: false },
                          axisLabel: { color: '#5A7090', fontSize: 10 },
                        },
                        yAxis: {
                          type: 'value',
                          axisLabel: { color: '#5A7090', fontSize: 10 },
                          axisLine: { show: false },
                          splitLine: { lineStyle: { color: '#142640', type: 'dashed' } },
                        },
                        series: [{
                          type: 'line',
                          smooth: true,
                          data: [2, 5, 8, 12, 10, 8.5, 7.5],
                          lineStyle: { color: '#00D4FF', width: 2 },
                          itemStyle: { color: '#00D4FF' },
                          areaStyle: {
                            color: {
                              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                              colorStops: [
                                { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
                                { offset: 1, color: 'rgba(0, 212, 255, 0)' },
                              ],
                            },
                          },
                          showSymbol: false,
                        }],
                      } as any}
                        style={{ height: 180 }}
                        notMerge={true}
                      />
                    </div>
                    <div className="p-4 bg-bg-tertiary/30 rounded-lg">
                      <h5 className="text-sm font-medium text-text-primary mb-2">
                      空蚀速率分布
                    </h5>
                      <ReactECharts
                        option={{
                          backgroundColor: 'transparent',
                          grid: { left: 40, right: 20, top: 20, bottom: 30 },
                          xAxis: {
                            type: 'category',
                            data: ['进水边', '前缘', '中部', '尾部', '出水边'],
                            axisLine: { lineStyle: { color: '#1E3A5F' } },
                            axisTick: { show: false },
                            axisLabel: { color: '#5A7090', fontSize: 10 },
                          },
                          yAxis: {
                            type: 'value',
                            axisLabel: { color: '#5A7090', fontSize: 10 },
                            axisLine: { show: false },
                            splitLine: { lineStyle: { color: '#142640', type: 'dashed' } },
                          },
                          series: [{
                            type: 'bar',
                            data: [0.05, 0.12, 0.18, 0.25, 0.28],
                            itemStyle: {
                              color: {
                                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [
                                  { offset: 0, color: '#FF6B35' },
                                  { offset: 1, color: 'rgba(255, 107, 53, 0.2)' },
                                ],
                              },
                              borderRadius: [4, 4, 0, 0],
                            },
                            barWidth: 24,
                          }],
                        } as any}
                        style={{ height: 180 }}
                        notMerge={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pressure' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-bg-tertiary/30 rounded-lg">
                    <h4 className="font-medium text-text-primary mb-4">压力系数分布曲线</h4>
                    <ReactECharts option={pressureChartOption} style={{ height: 280 }} notMerge={true} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-bg-tertiary/50 rounded-lg">
                      <p className="text-xs text-text-muted">最小压力系数</p>
                      <p className="text-xl font-bold font-mono text-status-danger">-1.5</p>
                    </div>
                    <div className="text-center p-3 bg-bg-tertiary/50 rounded-lg">
                      <p className="text-xs text-text-muted">最大压力系数</p>
                      <p className="text-xl font-bold font-mono text-status-success">1.2</p>
                    </div>
                    <div className="text-center p-3 bg-bg-tertiary/50 rounded-lg">
                      <p className="text-xs text-text-muted">压力不均度</p>
                      <p className="text-xl font-bold font-mono text-accent">2.7</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stress' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-bg-tertiary/30 rounded-lg">
                    <h4 className="font-medium text-text-primary mb-4">叶片表面剪切应力热图</h4>
                    <div className="aspect-video bg-gradient-to-br from-bg-secondary to-bg-tertiary rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-radial from-status-warning/20 via-transparent to-transparent opacity-60" />
                      <div className="text-center relative z-10">
                        <Gauge className="w-16 h-16 text-status-warning/50 mx-auto mb-2" />
                        <p className="text-text-muted">剪切应力热图预览</p>
                        <p className="text-xs text-text-muted mt-1">
                          蓝色-绿色-黄色-红色 表示应力递增</p>
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <div className="w-32 h-2 rounded-full bg-gradient-to-r from-blue-500 via-green-400 to-red-500" />
                        <span className="text-xs text-text-muted">低 → 高</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-bg-tertiary/30 rounded-lg">
                      <h5 className="text-sm font-medium text-text-primary mb-3">
                        应力分布统计
                      </h5>
                      <div className="space-y-2">
                        {[
                          { label: '进水边', value: 85, max: 200 },
                          { label: '叶片中部', value: 120, max: 200 },
                          { label: '出水边', value: 156, max: 200 },
                          { label: '轮毂处', value: 95, max: 200 },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3">
                            <span className="text-xs text-text-secondary w-16">{item.label}</span>
                            <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-accent to-status-warning rounded-full transition-all"
                                style={{ width: `${(item.value / item.max) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-text-primary w-12 text-right">
                              {item.value} kPa
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-bg-tertiary/30 rounded-lg">
                      <h5 className="text-sm font-medium text-text-primary mb-3">
                        叶片载荷分布</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">轴向力</span>
                          <span className="font-mono text-text-primary">12,500 kN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">径向力</span>
                          <span className="font-mono text-text-primary">2,380 kN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">扭矩</span>
                          <span className="font-mono text-text-primary">8,560 kN·m</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">最大应力位置</span>
                          <span className="text-text-primary">出水边</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : (
            <div className="card p-12 text-center">
              <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">选择报告查看详情</h3>
              <p className="text-text-secondary text-sm">从左侧列表选择一个报告查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { formatNumber } from '../../utils/formatters';

export function Recommendations() {
  const { recommendations } = useAppStore();
  const [activeTab, setActiveTab] = useState<'airfoil' | 'coating'>('airfoil');
  const [selectedRec, setSelectedRec] = useState<string | null>(null);

  const filteredRecs = recommendations.filter((r) => r.type === activeTab);

  const costLevelLabels = {
    low: '低成本',
    medium: '中成本',
    high: '高成本',
  };

  const costLevelColors = {
    low: 'text-status-success',
    medium: 'text-status-warning',
    high: 'text-status-danger',
  };

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < stars ? 'text-accent fill-accent' : 'text-border'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">智能推荐</h1>
          <p className="text-text-secondary text-sm mt-1">
            基于历史模拟数据，智能推荐最优叶片翼型与抗空蚀涂层方案
          </p>
        </div>
      </div>

      <div className="card p-5 bg-gradient-to-br from-accent/10 via-bg-secondary to-bg-secondary">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">AI 推荐引擎</h3>
            <p className="text-text-secondary text-sm">
              已分析 48 个历史项目，综合评估12种翼型方案和8种涂层方案
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-bg-tertiary/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-accent font-mono">88%</p>
            <p className="text-xs text-text-muted">推荐准确率</p>
          </div>
          <div className="p-3 bg-bg-tertiary/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-status-success font-mono">48</p>
            <p className="text-xs text-text-muted">历史项目</p>
          </div>
          <div className="p-3 bg-bg-tertiary/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-status-warning font-mono">12</p>
            <p className="text-xs text-text-muted">翼型方案</p>
          </div>
          <div className="p-3 bg-bg-tertiary/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-status-info font-mono">8</p>
            <p className="text-xs text-text-muted">涂层方案</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('airfoil')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'airfoil'
              ? 'bg-accent/20 text-accent border border-accent/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <Layers className="w-4 h-4" />
          翼型方案
        </button>
        <button
          onClick={() => setActiveTab('coating')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'coating'
              ? 'bg-accent/20 text-accent border border-accent/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
          }`}
        >
          <Shield className="w-4 h-4" />
          涂层方案
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filteredRecs.map((rec, index) => (
          <div
            key={rec.id}
            className="card card-hover p-5 cursor-pointer animate-fade-in opacity-0"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedRec(selectedRec === rec.id ? null : rec.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                {rec.type === 'airfoil' ? (
                  <Layers className="w-6 h-6 text-accent" />
                ) : (
                  <Shield className="w-6 h-6 text-accent" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">{rec.name}</h3>
                <p className="text-xs text-text-muted">综合评分 {rec.score}分</p>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-xs font-medium">
              推荐
            </div>
          </div>

            <div className="mb-3">{renderStars(rec.score)}</div>

            <p className="text-sm text-text-secondary line-clamp-2 mb-4">
              {rec.description}
            </p>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="flex items-center gap-1 text-text-muted">
                <Clock className="w-4 h-4" />
                预期寿命 {rec.expectedLifespan} 年
              </span>
              <span className={`flex items-center gap-1 ${costLevelColors[rec.costLevel]}`}>
                <DollarSign className="w-4 h-4" />
                {costLevelLabels[rec.costLevel]}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {rec.applicableScenarios.slice(0, 2).map((scenario) => (
                <span
                  key={scenario}
                  className="px-2 py-0.5 text-xs rounded-full bg-bg-tertiary text-text-secondary"
                >
                  {scenario}
                </span>
              ))}
              {rec.applicableScenarios.length > 2 && (
                <span className="text-xs text-text-muted">
                +{rec.applicableScenarios.length - 2}
              </span>
              )}
            </div>

            {selectedRec === rec.id && (
              <div className="pt-4 border-t border-border space-y-4 animate-fade-in">
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-status-success" />
                    优势
                  </h4>
                  <ul className="space-y-1">
                    {rec.advantages.map((adv, i) => (
                      <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-status-success mt-0.5 flex-shrink-0" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-status-warning" />
                  注意事项
                </h4>
                  <ul className="space-y-1">
                    {rec.disadvantages.map((dis, i) => (
                      <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-status-warning mt-0.5 flex-shrink-0" />
                        {dis}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-bg-tertiary/50 rounded-lg text-center">
                    <p className="text-lg font-bold text-accent font-mono">
                    {(rec.historicalSuccessRate * 100).toFixed(0)}%
                  </p>
                    <p className="text-xs text-text-muted">历史成功率</p>
                  </div>
                  <div className="p-3 bg-bg-tertiary/50 rounded-lg text-center">
                    <p className="text-lg font-bold text-status-success font-mono">
                      {rec.score}
                    </p>
                    <p className="text-xs text-text-muted">综合评分</p>
                  </div>
                </div>

                <button className="w-full btn-primary text-sm flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  应用此方案
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          方案对比分析
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-text-secondary">方案名称</th>
              <th className="text-center py-3 px-4 font-medium text-text-secondary">类型</th>
              <th className="text-center py-3 px-4 font-medium text-text-secondary">评分</th>
              <th className="text-center py-3 px-4 font-medium text-text-secondary">预期寿命</th>
              <th className="text-center py-3 px-4 font-medium text-text-secondary">成本</th>
              <th className="text-center py-3 px-4 font-medium text-text-secondary">成功率</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec) => (
              <tr key={rec.id} className="border-b border-border/50 hover:bg-bg-tertiary/30">
                <td className="py-3 px-4">
                  <span className="font-medium text-text-primary">{rec.name}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="badge badge-primary">
                    {rec.type === 'airfoil' ? '翼型' : '涂层'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-20 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${rec.score}%` }}
                      />
                    </div>
                    <span className="font-mono text-text-primary">{rec.score}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-mono text-text-primary">
                  {rec.expectedLifespan} 年
                </td>
                <td className={`py-3 px-4 text-center font-medium ${costLevelColors[rec.costLevel]}`}>
                  {costLevelLabels[rec.costLevel]}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-status-success font-mono">
                    {(rec.historicalSuccessRate * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Settings2,
  Grid3X3,
  Zap,
  ChevronRight,
  Check,
  FileText,
  Droplets,
  Wind,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { CAVITATION_MODELS, TURBULENCE_MODELS, TURBINE_TYPES } from '../../utils/constants';

const steps = [
  { id: 1, label: '模型上传', icon: Upload },
  { id: 2, label: '工况参数', icon: Settings2 },
  { id: 3, label: '网格设置', icon: Grid3X3 },
  { id: 4, label: '数值模型', icon: Zap },
];

export function NewTask() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { createTask } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    turbineType: TURBINE_TYPES[0],
    priority: 'medium' as 'low' | 'medium' | 'high',
    parameters: {
      rotationalSpeed: 125,
      waterHead: 105,
      flowRate: 720,
      guideVaneOpening: 75,
      bladeAngle: 18,
      vaporPressure: 2.34,
    },
    meshSettings: {
      adaptiveMesh: true,
      curvatureRefinement: true,
      boundaryLayers: 10,
      baseCellSize: 5,
      maxCellCount: 8000000,
    },
    cavitationModel: CAVITATION_MODELS[0],
    turbulenceModel: TURBULENCE_MODELS[0],
    modelFile: null as File | null,
  });

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value,
      },
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, modelFile: file }));
    }
  };

  const handleSubmit = () => {
    if (!formData.modelFile) {
      return;
    }
    createTask({
      name: formData.name || '未命名模拟任务',
      description: formData.description,
      turbineType: formData.turbineType,
      priority: formData.priority,
      parameters: {
        ...formData.parameters,
        cavitationModel: formData.cavitationModel,
        turbulenceModel: formData.turbulenceModel,
      },
      meshSettings: formData.meshSettings,
      modelFile: {
        name: formData.modelFile.name,
        size: formData.modelFile.size,
        format: formData.modelFile.name.split('.').pop()?.toUpperCase() || 'STEP',
      },
    });
    navigate('/tasks');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.modelFile !== null;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 rounded-lg bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">创建模拟任务</h1>
          <p className="text-text-secondary text-sm">配置模拟参数，开始空化流计算</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-status-success border-status-success text-white'
                        : isCurrent
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-bg-tertiary border-border text-text-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isCurrent ? 'text-accent font-medium' : 'text-text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-status-success' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="label">任务名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder="请输入模拟任务名称"
              />
            </div>

            <div>
              <label className="label">任务描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="input h-24 resize-none"
                placeholder="请输入任务描述（可选）"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">水轮机类型</label>
                <select
                  value={formData.turbineType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, turbineType: e.target.value }))}
                  className="input"
                >
                  {TURBINE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">优先级</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    }))
                  }
                  className="input"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-1">
                几何模型文件
                <span className="text-status-danger">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center hover:border-accent/50 transition-colors ${
                  formData.modelFile ? 'border-status-success bg-status-success/5' : 'border-border'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".step,.stp,.iges,.igs"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-accent" />
                  </div>
                  <p className="text-text-primary font-medium mb-1">
                    {formData.modelFile ? formData.modelFile.name : '点击上传几何模型'}
                  </p>
                  <p className="text-sm text-text-muted">
                    支持 STEP / IGES 格式，最大 100MB
                  </p>
                  {formData.modelFile && (
                    <div className="mt-4 p-3 bg-bg-tertiary/50 rounded-lg inline-block text-left">
                      <div className="text-sm space-y-1">
                        <div className="flex gap-2">
                          <span className="text-text-muted">文件名：</span>
                          <span className="text-text-primary font-medium">{formData.modelFile.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-text-muted">格式：</span>
                          <span className="text-text-primary font-medium font-mono">
                            {(formData.modelFile.name.split('.').pop() || '').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-text-muted">大小：</span>
                          <span className="text-text-primary font-medium font-mono">
                            {(formData.modelFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {!formData.modelFile && (
                    <p className="mt-2 text-xs text-status-danger">请上传几何模型文件（必填）</p>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-accent" />
              工况参数配置
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="label">转速 (rpm)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={formData.parameters.rotationalSpeed}
                    onChange={(e) =>
                      updateFormData('parameters', 'rotationalSpeed', Number(e.target.value))
                    }
                    className="flex-1 accent-accent"
                  />
                  <input
                    type="number"
                    value={formData.parameters.rotationalSpeed}
                    onChange={(e) =>
                      updateFormData('parameters', 'rotationalSpeed', Number(e.target.value))
                    }
                    className="input w-20 text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label">水头 (m)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={formData.parameters.waterHead}
                    onChange={(e) =>
                      updateFormData('parameters', 'waterHead', Number(e.target.value))
                    }
                    className="flex-1 accent-accent"
                  />
                  <input
                    type="number"
                    value={formData.parameters.waterHead}
                    onChange={(e) =>
                      updateFormData('parameters', 'waterHead', Number(e.target.value))
                    }
                    className="input w-20 text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label">流量 (m³/s)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    value={formData.parameters.flowRate}
                    onChange={(e) =>
                      updateFormData('parameters', 'flowRate', Number(e.target.value))
                    }
                    className="flex-1 accent-accent"
                  />
                  <input
                    type="number"
                    value={formData.parameters.flowRate}
                    onChange={(e) =>
                      updateFormData('parameters', 'flowRate', Number(e.target.value))
                    }
                    className="input w-20 text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label">导叶开度 (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={formData.parameters.guideVaneOpening}
                    onChange={(e) =>
                      updateFormData('parameters', 'guideVaneOpening', Number(e.target.value))
                    }
                    className="flex-1 accent-accent"
                  />
                  <input
                    type="number"
                    value={formData.parameters.guideVaneOpening}
                    onChange={(e) =>
                      updateFormData('parameters', 'guideVaneOpening', Number(e.target.value))
                    }
                    className="input w-20 text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label">叶片安放角 (°)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="0.5"
                    value={formData.parameters.bladeAngle}
                    onChange={(e) =>
                      updateFormData('parameters', 'bladeAngle', Number(e.target.value))
                    }
                    className="flex-1 accent-accent"
                  />
                  <input
                    type="number"
                    value={formData.parameters.bladeAngle}
                    step="0.5"
                    onChange={(e) =>
                      updateFormData('parameters', 'bladeAngle', Number(e.target.value))
                    }
                    className="input w-20 text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label">汽化压力 (kPa)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.parameters.vaporPressure}
                  onChange={(e) =>
                    updateFormData('parameters', 'vaporPressure', Number(e.target.value))
                  }
                  className="input font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-accent" />
              网格生成设置
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-bg-tertiary/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-primary font-medium">自适应网格</span>
                  <button
                    onClick={() =>
                      updateFormData('meshSettings', 'adaptiveMesh', !formData.meshSettings.adaptiveMesh)
                    }
                    className={`w-11 h-6 rounded-full transition-colors ${
                      formData.meshSettings.adaptiveMesh ? 'bg-accent' : 'bg-bg-secondary'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.meshSettings.adaptiveMesh ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-text-muted">根据几何曲率自动调整网格密度</p>
              </div>

              <div className="p-4 bg-bg-tertiary/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-primary font-medium">曲率细化</span>
                  <button
                    onClick={() =>
                      updateFormData('meshSettings', 'curvatureRefinement', !formData.meshSettings.curvatureRefinement)
                    }
                    className={`w-11 h-6 rounded-full transition-colors ${
                      formData.meshSettings.curvatureRefinement ? 'bg-accent' : 'bg-bg-secondary'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.meshSettings.curvatureRefinement ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-text-muted">高曲率区域自动加密网格</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">基元尺寸 (mm)</label>
                <input
                  type="number"
                  value={formData.meshSettings.baseCellSize}
                  onChange={(e) =>
                    updateFormData('meshSettings', 'baseCellSize', Number(e.target.value))
                  }
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="label">边界层数</label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={formData.meshSettings.boundaryLayers}
                  onChange={(e) =>
                    updateFormData('meshSettings', 'boundaryLayers', Number(e.target.value))
                  }
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="label">最大单元数 (万)</label>
                <input
                  type="number"
                  value={formData.meshSettings.maxCellCount / 10000}
                  onChange={(e) =>
                    updateFormData('meshSettings', 'maxCellCount', Number(e.target.value) * 10000)
                  }
                  className="input font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              数值模型选择
            </h3>

            <div>
              <label className="label flex items-center gap-2">
                <Droplets className="w-4 h-4 text-accent" />
                空化模型
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CAVITATION_MODELS.map((model) => (
                  <button
                    key={model}
                    onClick={() => setFormData((prev) => ({ ...prev, cavitationModel: model }))}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.cavitationModel === model
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-bg-tertiary/30 text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Wind className="w-4 h-4 text-accent" />
                湍流模型
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TURBULENCE_MODELS.map((model) => (
                  <button
                    key={model}
                    onClick={() => setFormData((prev) => ({ ...prev, turbulenceModel: model }))}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.turbulenceModel === model
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-bg-tertiary/30 text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-bg-tertiary/30 rounded-lg border border-border">
              <h4 className="font-medium text-text-primary mb-3">配置摘要</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">任务名称</span>
                  <span className="text-text-primary">{formData.name || '未命名'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">水轮机类型</span>
                  <span className="text-text-primary">{formData.turbineType}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-text-muted">几何模型</span>
                  <span className="text-text-primary font-mono text-right">
                    {formData.modelFile?.name} ({(formData.modelFile?.size ? formData.modelFile.size / (1024 * 1024) : 0).toFixed(2)} MB)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">水头 / 转速</span>
                  <span className="text-text-primary font-mono">
                    {formData.parameters.waterHead}m / {formData.parameters.rotationalSpeed}rpm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">导叶开度 / 叶片角</span>
                  <span className="text-text-primary font-mono">
                    {formData.parameters.guideVaneOpening}% / {formData.parameters.bladeAngle}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">空化模型</span>
                  <span className="text-text-primary">{formData.cavitationModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">湍流模型</span>
                  <span className="text-text-primary">{formData.turbulenceModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">预计网格数</span>
                  <span className="text-text-primary font-mono">
                    {(formData.meshSettings.maxCellCount / 1000000).toFixed(1)} M
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一步
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
              <Zap className="w-4 h-4" />
              开始模拟
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

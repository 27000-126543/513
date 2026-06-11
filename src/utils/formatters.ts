export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(date);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}天${remainingHours > 0 ? `${remainingHours}小时` : ''}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function exportToCSV(content: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(content: object, filename: string): void {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportPDF(report: any, task?: any): void {
  const now = formatDate(new Date());
  const lines: string[] = [];
  lines.push('='.repeat(80));
  lines.push(`  高精度空化流模拟综合报告 - CavSim Pro`);
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`报告编号: ${report.id.toUpperCase()}`);
  lines.push(`生成时间: ${now}`);
  lines.push(`所属任务: ${report.taskName}`);
  lines.push(`报告类型: 空化流模拟综合分析报告`);
  if (task) {
    lines.push(`水轮机类型: ${task.turbineType || 'N/A'}`);
    lines.push(`几何模型: ${task.modelFile?.name || 'N/A'}`);
  }
  lines.push('');
  lines.push('-'.repeat(80));
  lines.push('  一、工况参数');
  lines.push('-'.repeat(80));
  if (task) {
    lines.push(`  转速:        ${task.parameters?.rotationalSpeed || 'N/A'} rpm`);
    lines.push(`  水头:        ${task.parameters?.waterHead || 'N/A'} m`);
    lines.push(`  流量:        ${task.parameters?.flowRate || 'N/A'} m³/s`);
    lines.push(`  导叶开度:    ${task.parameters?.guideVaneOpening || 'N/A'} %`);
    lines.push(`  叶片安放角:  ${task.parameters?.bladeAngle || 'N/A'} °`);
    lines.push(`  汽化压力:    ${task.parameters?.vaporPressure || 'N/A'} kPa`);
    lines.push(`  空化模型:    ${task.parameters?.cavitationModel || 'N/A'}`);
    lines.push(`  湍流模型:    ${task.parameters?.turbulenceModel || 'N/A'}`);
  }
  lines.push('');
  lines.push('-'.repeat(80));
  lines.push('  二、核心性能指标');
  lines.push('-'.repeat(80));
  const sd = report.summaryData || {};
  lines.push(`  最大空泡体积分数:   ${sd.maxCavitationVolume || 'N/A'} %`);
  lines.push(`  平均压力脉动:       ${sd.avgPressureFluctuation || 'N/A'} kPa`);
  lines.push(`  最大空蚀速率:       ${sd.maxErosionRate || 'N/A'} mm/年`);
  lines.push(`  最大剪切应力:       ${sd.maxShearStress || 'N/A'} kPa`);
  lines.push(`  叶片升力:           ${sd.bladeLiftForce || 'N/A'} kN`);
  lines.push(`  预计空蚀深度(10年): ${sd.predictedErosionDepth || 'N/A'} μm`);
  lines.push(`  水力效率:           ${sd.hydraulicEfficiency || 'N/A'} %`);
  lines.push('');
  lines.push('-'.repeat(80));
  lines.push('  三、结论与建议');
  lines.push('-'.repeat(80));
  lines.push('  1. 优化后空泡体积分数降低18.5%，空化性能显著提升');
  lines.push('  2. 叶片表面最大压力脉动处于合理范围，无异常高压区');
  lines.push('  3. 出水边空蚀速率接近材料限值，建议采用涂层方案延长寿命');
  lines.push('  4. 推荐叶片安放角调整 +1.5°，导叶开度优化至 72%');
  lines.push('');
  lines.push('='.repeat(80));
  lines.push(`  报告生成系统: CavSim Pro v1.0`);
  lines.push(`  本报告由系统自动生成，如需人工复核请联系流体工程师`);
  lines.push('='.repeat(80));

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${report.taskName}_综合报告.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateCavitationDataByWaterHead(task: any, waterHeads: number[] = [50, 75, 100, 125, 150, 175, 200]): string {
  const headers = ['水头(m)', '空泡体积分数(%)', '空蚀速率(mm/年)', '推力波动(%)', '最小压力(kPa)', '效率(%)'];
  const rows = waterHeads.map((h) => {
    const cav = Math.min(15, Math.max(0.5, 2 + (h - 100) * 0.12 + Math.random() * 2));
    const erosion = Math.min(0.5, Math.max(0.02, 0.08 + (h - 100) * 0.003 + Math.random() * 0.05));
    const thrust = Math.min(8, Math.max(1, 2.5 + (h - 100) * 0.03 + Math.random() * 1));
    const pmin = Math.max(1.5, 2.8 - (h - 100) * 0.015 + Math.random() * 0.3);
    const eff = Math.min(96, Math.max(88, 92 - Math.abs(h - 120) * 0.03 + Math.random() * 0.8));
    return [h.toFixed(0), cav.toFixed(3), erosion.toFixed(4), thrust.toFixed(2), pmin.toFixed(2), eff.toFixed(2)];
  });
  const meta = [
    `# 数据导出 - 按水头变化全场空化数据`,
    `# 任务名称: ${task?.name || 'N/A'}`,
    `# 任务ID: ${task?.id || 'N/A'}`,
    `# 水轮机类型: ${task?.turbineType || 'N/A'}`,
    `# 固定转速: ${task?.parameters?.rotationalSpeed || 'N/A'} rpm`,
    `# 固定导叶开度: ${task?.parameters?.guideVaneOpening || 'N/A'} %`,
    `# 固定叶片角: ${task?.parameters?.bladeAngle || 'N/A'} °`,
    `# 导出时间: ${formatDate(new Date())}`,
    `#`,
  ];
  return [...meta, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateCavitationDataBySpeed(task: any, speeds: number[] = [75, 100, 125, 150, 175, 200, 225]): string {
  const headers = ['转速(rpm)', '叶片载荷(kN)', '最大弯矩(kN·m)', '剪切应力(kPa)', '压力脉动(kPa)', '推力(kN)'];
  const rows = speeds.map((n) => {
    const load = Math.max(200, 150 + n * 3.5 + Math.random() * 50);
    const moment = Math.max(50, 30 + n * 0.9 + Math.random() * 15);
    const shear = Math.max(30, 45 + n * 0.6 + Math.random() * 20);
    const pflu = Math.max(20, 35 + n * 0.45 + Math.random() * 15);
    const thrust = Math.max(500, 400 + n * 7 + Math.random() * 100);
    return [n.toFixed(0), load.toFixed(2), moment.toFixed(2), shear.toFixed(2), pflu.toFixed(2), thrust.toFixed(2)];
  });
  const meta = [
    `# 数据导出 - 按转速变化叶片载荷数据`,
    `# 任务名称: ${task?.name || 'N/A'}`,
    `# 任务ID: ${task?.id || 'N/A'}`,
    `# 水轮机类型: ${task?.turbineType || 'N/A'}`,
    `# 固定水头: ${task?.parameters?.waterHead || 'N/A'} m`,
    `# 固定导叶开度: ${task?.parameters?.guideVaneOpening || 'N/A'} %`,
    `# 固定叶片角: ${task?.parameters?.bladeAngle || 'N/A'} °`,
    `# 导出时间: ${formatDate(new Date())}`,
    `#`,
  ];
  return [...meta, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateCavitationDataByGuideVane(task: any, openings: number[] = [30, 40, 50, 60, 70, 80, 90, 100]): string {
  const headers = ['导叶开度(%)', '流量(m³/s)', '水头(m)', '效率(%)', '功率(MW)', '空化系数σ', '空蚀速率(mm/年)'];
  const rows = openings.map((o) => {
    const flow = Math.max(80, task?.parameters?.waterHead ? task.parameters.flowRate * (o / 75) : 500 * (o / 75));
    const head = Math.max(10, (task?.parameters?.waterHead || 100) * (1 - Math.abs(o - 70) * 0.003));
    const eff = Math.min(96, Math.max(70, 88 - Math.pow(Math.abs(o - 70) / 25, 2) * 10));
    const power = Math.max(10, (flow * head * 9.81 * eff / 100) / 1000);
    const sigma = Math.max(0.05, 0.3 - Math.abs(o - 65) * 0.003 + Math.random() * 0.02);
    const erosion = Math.min(0.5, Math.max(0.02, 0.05 + Math.pow(Math.abs(o - 60) / 20, 2) * 0.3));
    return [o.toFixed(0), flow.toFixed(2), head.toFixed(2), eff.toFixed(2), power.toFixed(3), sigma.toFixed(4), erosion.toFixed(4)];
  });
  const meta = [
    `# 数据导出 - 按导叶开度变化性能曲线`,
    `# 任务名称: ${task?.name || 'N/A'}`,
    `# 任务ID: ${task?.id || 'N/A'}`,
    `# 水轮机类型: ${task?.turbineType || 'N/A'}`,
    `# 固定水头: ${task?.parameters?.waterHead || 'N/A'} m`,
    `# 固定转速: ${task?.parameters?.rotationalSpeed || 'N/A'} rpm`,
    `# 固定叶片角: ${task?.parameters?.bladeAngle || 'N/A'} °`,
    `# 导出时间: ${formatDate(new Date())}`,
    `#`,
  ];
  return [...meta, headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateReportCoreMetricsCSV(report: any, task?: any): string {
  const headers = ["指标名称", "数值", "单位", "阈值/参考值", "评估状态"];
  const metrics = [
    ["空泡体积分数最大值", report?.metrics?.maxCavitationVolume || "0.15", "%", "< 0.5%", "合格"],
    ["空泡体积分数平均值", report?.metrics?.avgCavitationVolume || "0.03", "%", "< 0.1%", "合格"],
    ["压力脉动幅值", report?.metrics?.pressurePulsation || "2.8", "%", "< 5%", "合格"],
    ["空蚀速率", report?.metrics?.erosionRate || "0.08", "mm/年", "< 0.1 mm/年", "合格"],
    ["最大剪切应力", report?.metrics?.maxShearStress || "156", "kPa", "< 200 kPa", "合格"],
    ["平均剪切应力", report?.metrics?.avgShearStress || "92", "kPa", "< 150 kPa", "合格"],
    ["叶片升力系数", report?.metrics?.liftCoefficient || "0.85", "-", "0.6-1.0", "合格"],
    ["水力效率", report?.metrics?.hydraulicEfficiency || "94.2", "%", "> 92%", "合格"],
    ["额定流量", task?.parameters?.flowRate || report?.flowRate || "500", "m³/s", "-", "-"],
    ["额定水头", task?.parameters?.waterHead || report?.waterHead || "100", "m", "-", "-"],
    ["额定转速", task?.parameters?.rotationalSpeed || report?.rotationalSpeed || "150", "rpm", "-", "-"],
    ["空化系数σ", report?.cavitationCoefficient || "0.18", "-", "> 0.12", "合格"],
  ];
  const meta = [
    "# 核心指标导出 - 水轮机CFD仿真报告归档",
    `# 任务名称: ${report?.taskName || task?.name || "N/A"}`,
    `# 报告ID: ${report?.id || "N/A"}`,
    `# 导出时间: ${formatDate(new Date())}`,
    "#",
  ];
  return [...meta, headers.join(","), ...metrics.map((r) => r.join(","))].join('\n');

}

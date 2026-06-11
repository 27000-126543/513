const fs = require('fs');
const path = '/Users/mac/Desktop/6.11项目/513/src/utils/formatters.ts';
let content = fs.readFileSync(path, 'utf8');

// 问题2：修改 sd.xxx || 'N/A' 为严格判断
content = content.replace(
  /sd\.maxCavitationVolume \|\| 'N\/A'/g,
  "(sd.maxCavitationVolume !== undefined && sd.maxCavitationVolume !== null ? sd.maxCavitationVolume : 'N/A')"
);
content = content.replace(
  /sd\.avgPressureFluctuation \|\| 'N\/A'/g,
  "(sd.avgPressureFluctuation !== undefined && sd.avgPressureFluctuation !== null ? sd.avgPressureFluctuation : 'N/A')"
);
content = content.replace(
  /sd\.maxErosionRate \|\| 'N\/A'/g,
  "(sd.maxErosionRate !== undefined && sd.maxErosionRate !== null ? sd.maxErosionRate : 'N/A')"
);
content = content.replace(
  /sd\.maxShearStress \|\| 'N\/A'/g,
  "(sd.maxShearStress !== undefined && sd.maxShearStress !== null ? sd.maxShearStress : 'N/A')"
);
content = content.replace(
  /sd\.bladeLiftForce \|\| 'N\/A'/g,
  "(sd.bladeLiftForce !== undefined && sd.bladeLiftForce !== null ? sd.bladeLiftForce : 'N/A')"
);
content = content.replace(
  /sd\.predictedErosionDepth \|\| 'N\/A'/g,
  "(sd.predictedErosionDepth !== undefined && sd.predictedErosionDepth !== null ? sd.predictedErosionDepth : 'N/A')"
);

// 问题1：在 exportReportPDF 函数之后插入 generateReportCoreMetricsCSV
const newFunction = `
export function generateReportCoreMetricsCSV(report: any, task?: any): string {
  const sd = report?.summaryData || {};
  const meta = [
    '# 核心指标导出 - 空化流模拟综合报告',
    \`# 报告编号: \${String(report?.id || 'N/A').toUpperCase()}\`,
    \`# 任务名称: \${report?.taskName || 'N/A'}\`,
    \`# 任务ID: \${report?.taskId || 'N/A'}\`,
    \`# 水轮机类型: \${task?.turbineType || 'N/A'}\`,
    \`# 几何模型: \${task?.modelFile?.name || 'N/A'}\`,
    \`# 报告生成时间: \${report?.generatedAt ? formatDate(new Date(report.generatedAt)) : 'N/A'}\`,
    \`# 导出时间: \${formatDate(new Date())}\`,
    '#',
  ];
  const headers = ['指标名称', '数值', '单位'];
  const readVal = (v: any) => (v !== undefined && v !== null ? String(v) : 'N/A');
  const rows: string[][] = [
    ['最大空泡体积分数', readVal(sd.maxCavitationVolume), '%'],
    ['平均压力脉动', readVal(sd.avgPressureFluctuation), 'kPa'],
    ['最大空蚀速率', readVal(sd.maxErosionRate), 'mm/年'],
    ['最大剪切应力', readVal(sd.maxShearStress), 'kPa'],
    ['叶片载荷', readVal(sd.bladeLiftForce), 'kN'],
    ['水力效率', sd.efficiency !== undefined && sd.efficiency !== null ? String(sd.efficiency) : readVal(sd.hydraulicEfficiency), '%'],
    ['报告文件大小', report?.fileSize !== undefined ? (report.fileSize / 1024 / 1024).toFixed(2) : 'N/A', 'MB'],
  ];
  if (task?.parameters) {
    const p = task.parameters;
    rows.push(['转速', readVal(p.rotationalSpeed), 'rpm']);
    rows.push(['水头', readVal(p.waterHead), 'm']);
    rows.push(['流量', readVal(p.flowRate), 'm³/s']);
    rows.push(['导叶开度', readVal(p.guideVaneOpening), '%']);
    rows.push(['叶片安放角', readVal(p.bladeAngle), '°']);
    rows.push(['汽化压力', readVal(p.vaporPressure), 'kPa']);
  }
  return [...meta, headers.join(','), ...rows.map((r) => r.join(','))].join('\\n');
}
`;

// 在 exportReportPDF 结束后，generateCavitationDataByWaterHead 之前插入
const marker = 'export function generateCavitationDataByWaterHead';
if (content.indexOf(marker) !== -1 && content.indexOf('export function generateReportCoreMetricsCSV') === -1) {
  content = content.replace(marker, newFunction.trim() + '\n\n' + marker);
}

fs.writeFileSync(path, content);
console.log('文件修改完成');

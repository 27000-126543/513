with open('src/utils/formatters.ts', 'r') as f:
    lines = f.readlines()

# 1. 找到 generateReportCoreMetricsCSV 函数的起止行
func_start = None
func_end = None
for i, line in enumerate(lines):
    if 'export function generateReportCoreMetricsCSV' in line:
        func_start = i
    if func_start is not None and i > func_start and line.strip() == '}':
        func_end = i
        break

print(f"generateReportCoreMetricsCSV: {func_start} - {func_end}")

# 提取函数并删除原位置
func_lines = lines[func_start:func_end+1]
del lines[func_start:func_end+1]

# 2. 找到 exportReportPDF 函数的结束行
pdf_end = None
for i, line in enumerate(lines):
    if 'export function exportReportPDF' in line:
        depth = 0
        for j in range(i, len(lines)):
            for ch in lines[j]:
                if ch == '{':
                    depth += 1
                if ch == '}':
                    depth -= 1
                    if depth == 0:
                        pdf_end = j
                        break
        break

print(f"exportReportPDF ends at: {pdf_end}")

# 在 exportReportPDF 后插入函数
lines.insert(pdf_end + 1, '\n')
for idx, fl in enumerate(func_lines):
    lines.insert(pdf_end + 2 + idx, fl)

# 3. 在核心指标段补充缺失的两项
for i, line in enumerate(lines):
    if '预计空蚀深度' in line and '最小压力' not in lines[i+1]:
        missing1 = "  lines.push(`  最小压力(汽化压力限值对比): ${(task?.parameters?.vaporPressure !== undefined && task?.parameters?.vaporPressure !== null ? task.parameters.vaporPressure : 2.34).toFixed(2)} kPa`);\n"
        missing2 = "  lines.push(`  网格单元数量: ${task?.meshSettings?.maxCellCount !== undefined && task?.meshSettings?.maxCellCount !== null ? task.meshSettings.maxCellCount + ' 万' : 'N/A'}`);\n"
        lines.insert(i + 1, missing2)
        lines.insert(i + 1, missing1)
        print(f"Added missing metrics after line {i}")
        break

with open('src/utils/formatters.ts', 'w') as f:
    f.writelines(lines)

print("修复完成!")

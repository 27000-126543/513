const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/pages/Approvals/Approvals.tsx');
let content = fs.readFileSync(target, 'utf-8');
let lines = content.split('\n');

console.log('Total lines:', lines.length);

// Step 2: Replace text under 制造工艺组 node
let mfgLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].indexOf('制造工艺组</span>') !== -1) {
    mfgLineIdx = i;
    break;
  }
}
console.log('制造工艺组 line:', mfgLineIdx + 1);

if (mfgLineIdx !== -1) {
  const start = mfgLineIdx + 1;
  let end = -1;
  for (let j = start; j < lines.length && j < start + 20; j++) {
    if (lines[j].indexOf('待解锁') !== -1 || lines[j].indexOf('已推送') !== -1) {
      end = j + 1;
      break;
    }
  }
  console.log('Replace range:', start + 1, 'to', end + 1);
  
  if (end !== -1) {
    const SP6 = '                              ';
    const SP8 = '                                ';
    const SP10 = '                                  ';
    const newBlock = [
      SP6 + '{isPushed && pushedRecord && (',
      SP8 + '<>',
      SP10 + '<span className="text-[10px] mt-0.5 whitespace-nowrap text-success">',
      SP10 + '  {formatDate(pushedRecord.pushedAt)}',
      SP10 + '</span>',
      SP10 + '<span className="text-[10px] mt-0.5 whitespace-nowrap text-text-muted">',
      SP10 + '  {pushedRecord.pushedBy}',
      SP10 + '</span>',
      SP8 + '</>',
      SP6 + ')}',
      SP6 + "{!isPushed && level2Status === 'approved' && (",
      SP8 + '<span className="text-[10px] mt-0.5 whitespace-nowrap text-accent">',
      SP10 + String.fromCharCode(24453, 25512, 36865),
      SP8 + '</span>',
      SP6 + ')}',
      SP6 + "{!isPushed && level2Status !== 'approved' && (",
      SP8 + '<span className="text-[10px] mt-0.5 whitespace-nowrap text-text-muted">',
      SP10 + String.fromCharCode(24453, 35299, 38145),
      SP8 + '</span>',
      SP6 + ')}',
    ];
    lines.splice(start, end - start, ...newBlock);
    console.log('Step 2 done, lines:', lines.length);
  }
}

// Step 3: Insert green card after 二级通过时间 block
let l2LineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].indexOf(String.fromCharCode(20108, 32423, 36890, 36807, 26102, 38388)) !== -1) {
    l2LineIdx = i;
    break;
  }
}
console.log('二级通过时间 line:', l2LineIdx + 1);

if (l2LineIdx !== -1) {
  let insertAt = -1;
  for (let j = l2LineIdx; j < lines.length && j < l2LineIdx + 20; j++) {
    const trimmed = lines[j].trim();
    if (trimmed === ')}' && j + 1 < lines.length) {
      const nextTrimmed = lines[j + 1].trim();
      if (nextTrimmed === '</div>') {
        insertAt = j + 1;
        break;
      }
    }
  }
  console.log('Insert at line:', insertAt + 1);
  
  if (insertAt !== -1) {
    const SP6 = '                        ';
    const SP7 = '                          ';
    const SP8 = '                            ';
    const greenCard = [
      SP6 + '{isPushed && pushedRecord && (',
      SP7 + '<div className="p-4 bg-success/5 rounded-lg border border-success/20">',
      SP8 + '<p className="text-xs text-success/80 mb-1">' + String.fromCharCode(25512, 36865, 33267, 21046, 36896, 24037, 33402, 32452) + '</p>',
      SP8 + '<p className="text-sm font-medium text-success">',
      SP8 + '  {pushedRecord.pushedBy}',
      SP8 + '</p>',
      SP8 + '<p className="text-xs text-success/70 mt-1">',
      SP8 + '  {formatDate(pushedRecord.pushedAt)}',
      SP8 + '</p>',
      SP7 + '</div>',
      SP6 + ')}',
    ];
    lines.splice(insertAt, 0, ...greenCard);
    console.log('Step 3 done, lines:', lines.length);
  }
}

fs.writeFileSync(target, lines.join('\n'), 'utf-8');
console.log('SAVED OK');

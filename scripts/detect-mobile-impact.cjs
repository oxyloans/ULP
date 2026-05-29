const { execSync } = require('child_process');

const watchPatterns = [
  'src/pages/',
  'src/api/',
  'src/context/',
  'src/components/',
  'contracts/'
];

function getChangedFiles(baseRef = 'origin/main') {
  const out = execSync(`git diff --name-only ${baseRef}...HEAD`, { encoding: 'utf8' });
  return out.split('\n').map(s => s.trim()).filter(Boolean);
}

const baseRef = process.env.BASE_REF || 'origin/main';
const files = getChangedFiles(baseRef);
const impacted = files.filter(f => watchPatterns.some(p => f.startsWith(p)));

const payload = {
  impacted: impacted.length > 0,
  changedFiles: files,
  impactedFiles: impacted,
  checklist: [
    'Map impacted web flows to mobile parity tasks',
    'Update parity-map.json in mobile repo',
    'Link originating web PR in mobile PR',
    'Run mobile regression smoke for impacted flows'
  ]
};

console.log(JSON.stringify(payload, null, 2));

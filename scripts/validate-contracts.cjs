const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const versionPath = path.join(process.cwd(), 'contracts', 'contract-version.json');
const changelogPath = path.join(process.cwd(), 'contracts', 'changelog', 'CHANGELOG.md');

if (!fs.existsSync(versionPath)) fail('contracts/contract-version.json missing');
if (!fs.existsSync(changelogPath)) fail('contracts/changelog/CHANGELOG.md missing');

const raw = fs.readFileSync(versionPath, 'utf8');
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  fail('Invalid JSON in contract-version.json');
}

if (!/^\d+\.\d+\.\d+$/.test(parsed.contractVersion || '')) {
  fail('contractVersion must be semver format x.y.z');
}

const changelog = fs.readFileSync(changelogPath, 'utf8');
if (!changelog.includes(parsed.contractVersion)) {
  fail(`CHANGELOG.md must include current contract version ${parsed.contractVersion}`);
}

console.log(`Contract metadata valid for version ${parsed.contractVersion}`);

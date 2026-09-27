const { execSync } = require('child_process');
try {
  const out = execSync('"C:\\Program Files\\GitHub CLI\\gh.exe" auth status');
  console.log('STATUS:', out.toString());
} catch (e) {
  console.log('STDOUT:', e.stdout ? e.stdout.toString() : '');
  console.log('STDERR:', e.stderr ? e.stderr.toString() : '');
}

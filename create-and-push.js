const { execSync } = require('child_process');
const path = require('path');

const mingitPath = 'C:\\Users\\Rakshith D\\mingit\\cmd';
process.env.PATH = mingitPath + ';' + process.env.PATH;

const ghExe = 'C:\\Program Files\\GitHub CLI\\gh.exe';

try {
  console.log('Creating public repo rakshithkd-creator/e-metrology and pushing...');
  const out = execSync(`"${ghExe}" repo create e-metrology --public --source=. --remote=origin --push`);
  console.log('OUTPUT:', out.toString());
  console.log('🎉 REPOSITORY CREATED AND PUSHED SUCCESSFULLY!');
} catch (e) {
  console.error('ERROR:');
  if (e.stdout) console.log('STDOUT:', e.stdout.toString());
  if (e.stderr) console.log('STDERR:', e.stderr.toString());
  if (!e.stdout && !e.stderr) console.log('MESSAGE:', e.message);
}

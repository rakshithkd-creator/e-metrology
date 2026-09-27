const { execSync } = require('child_process');
const path = require('path');

const mingitPath = 'C:\\Users\\Rakshith D\\mingit\\cmd';
process.env.PATH = mingitPath + ';' + process.env.PATH;

const gitExe = path.join(mingitPath, 'git.exe');
const ghExe = 'C:\\Program Files\\GitHub CLI\\gh.exe';

try {
  console.log('[1/4] Retrieving GitHub token...');
  const token = execSync(`"${ghExe}" auth token`).toString().trim();
  
  console.log('[2/4] Setting remote origin to rakshithkd-creator/e-metrology...');
  const repoUrl = `https://x-access-token:${token}@github.com/rakshithkd-creator/e-metrology.git`;
  try { execSync(`"${gitExe}" remote remove origin`); } catch (e) {}
  execSync(`"${gitExe}" remote add origin "${repoUrl}"`);
  
  console.log('[3/4] Staging files...');
  execSync(`"${gitExe}" add .`);
  try {
    execSync(`"${gitExe}" commit -m "e-Metrology Full Application"`);
  } catch (e) {
    console.log('Already committed.');
  }

  console.log('[4/4] Pushing full codebase to https://github.com/rakshithkd-creator/e-metrology ...');
  const out = execSync(`"${gitExe}" push --force -u origin main`);
  console.log('PUSH OUTPUT:', out.toString());
  console.log('======================================================');
  console.log('🎉 SUCCESS! ALL FILES (backend, frontend, configs) ARE LIVE ON GITHUB!');
  console.log('URL: https://github.com/rakshithkd-creator/e-metrology');
  console.log('======================================================');
} catch (e) {
  console.error('ERROR OCCURRED:');
  if (e.stdout) console.log('STDOUT:', e.stdout.toString());
  if (e.stderr) console.log('STDERR:', e.stderr.toString());
  if (!e.stdout && !e.stderr) console.log('MESSAGE:', e.message);
}

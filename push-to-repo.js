const { execSync } = require('child_process');
const path = require('path');

const mingitPath = 'C:\\Users\\Rakshith D\\mingit\\cmd';
process.env.PATH = mingitPath + ';' + process.env.PATH;

const gitExe = path.join(mingitPath, 'git.exe');
const ghExe = 'C:\\Program Files\\GitHub CLI\\gh.exe';

try {
  console.log('[1/4] Retrieving GitHub token from gh...');
  const token = execSync(`"${ghExe}" auth token`).toString().trim();
  console.log('Token retrieved successfully (length: ' + token.length + ')');
  
  console.log('[2/4] Setting remote origin with authentication token...');
  const repoUrl = `https://x-access-token:${token}@github.com/rakshithd0111/e-Metrology1.git`;
  try { execSync(`"${gitExe}" remote remove origin`); } catch (e) {}
  execSync(`"${gitExe}" remote add origin "${repoUrl}"`);
  
  console.log('[3/4] Staging all files...');
  execSync(`"${gitExe}" add .`);
  try {
    execSync(`"${gitExe}" commit -m "e-Metrology Full Application"`);
  } catch (e) {
    console.log('Already committed.');
  }

  console.log('[4/4] Pushing full codebase to GitHub (rakshithd0111/e-Metrology1)...');
  const out = execSync(`"${gitExe}" push --force -u origin main`);
  console.log('PUSH OUTPUT:', out.toString());
  console.log('======================================================');
  console.log('🎉 SUCCESS! All backend and frontend files are now on GitHub!');
  console.log('======================================================');
} catch (e) {
  console.error('ERROR OCCURRED:');
  if (e.stdout) console.log('STDOUT:', e.stdout.toString());
  if (e.stderr) console.log('STDERR:', e.stderr.toString());
  if (!e.stdout && !e.stderr) console.log('MESSAGE:', e.message);
}

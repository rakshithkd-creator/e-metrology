const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const targetDir = path.join('C:', 'Users', 'Rakshith D', 'mingit');
const zipFile = path.join(targetDir, 'mingit.zip');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Downloading MinGit portable...');
const file = fs.createWriteStream(zipFile);

https.get('https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip', (response) => {
  if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
    https.get(response.headers.location, (redirectResponse) => {
      redirectResponse.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log('Download complete. Extracting...');
          try {
            execSync(`tar -xf "${zipFile}" -C "${targetDir}"`);
            fs.unlinkSync(zipFile);
            console.log('MinGit extracted successfully!');
            const gitVersion = execSync(`"${path.join(targetDir, 'cmd', 'git.exe')}" --version`).toString();
            console.log('Git version:', gitVersion.trim());
          } catch (e) {
            console.error('Extraction error:', e.message);
          }
        });
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        try {
          execSync(`tar -xf "${zipFile}" -C "${targetDir}"`);
          fs.unlinkSync(zipFile);
          const gitVersion = execSync(`"${path.join(targetDir, 'cmd', 'git.exe')}" --version`).toString();
          console.log('Git version:', gitVersion.trim());
        } catch (e) {
          console.error('Extraction error:', e.message);
        }
      });
    });
  }
}).on('error', (err) => {
  console.error('Download error:', err.message);
});

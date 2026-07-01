const fs = require('fs');
const path = require('path');

function findCmakeCaches(dir, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findCmakeCaches(fullPath, results);
    } else if (entry.name === 'CMakeCache.txt') {
      results.push(fullPath);
    }
  }

  return results;
}

function hasBrokenCcacheReference(cmakeCachePath) {
  const content = fs.readFileSync(cmakeCachePath, 'utf8');
  const match = content.match(/^CCACHE_FOUND:FILEPATH=(.+)$/m);

  if (!match) {
    return false;
  }

  const ccachePath = match[1].trim();
  return ccachePath.length > 0 && !fs.existsSync(ccachePath);
}

function removeBrokenCxxCaches(rootDir) {
  const cxxDirs = [];

  const appCxx = path.join(rootDir, 'android', 'app', '.cxx');
  if (fs.existsSync(appCxx)) {
    cxxDirs.push(appCxx);
  }

  const nodeModules = path.join(rootDir, 'node_modules');
  if (fs.existsSync(nodeModules)) {
    for (const packageName of fs.readdirSync(nodeModules)) {
      const cxxPath = path.join(nodeModules, packageName, 'android', '.cxx');
      if (fs.existsSync(cxxPath)) {
        cxxDirs.push(cxxPath);
      }
    }
  }

  for (const cxxDir of cxxDirs) {
    const caches = findCmakeCaches(cxxDir);
    if (caches.some(hasBrokenCcacheReference)) {
      fs.rmSync(cxxDir, { recursive: true, force: true });
      console.log(`Removed stale native build cache: ${path.relative(rootDir, cxxDir)}`);
    }
  }
}

removeBrokenCxxCaches(path.join(__dirname, '..'));

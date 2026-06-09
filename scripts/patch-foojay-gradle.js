const fs = require('fs');
const path = require('path');

const settingsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts',
);

if (!fs.existsSync(settingsPath)) {
  process.exit(0);
}

const contents = fs.readFileSync(settingsPath, 'utf8');
const patched = contents.replace(
  'id("org.gradle.toolchains.foojay-resolver-convention").version("0.5.0")',
  'id("org.gradle.toolchains.foojay-resolver-convention").version("1.0.0")',
);

if (patched !== contents) {
  fs.writeFileSync(settingsPath, patched);
  console.log('Patched @react-native/gradle-plugin foojay resolver for Gradle 9');
}

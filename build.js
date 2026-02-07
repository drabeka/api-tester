const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Sicherstellen, dass dist-Verzeichnis existiert
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const buildOptions = {
  entryPoints: ['src/App.jsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  loader: {
    '.jsx': 'jsx',
    '.js': 'jsx'
  },
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  // React und ReactDOM über Shims laden (ES6-Module)
  alias: {
    'react': path.resolve(__dirname, 'src/shims/react.js'),
    'react-dom/client': path.resolve(__dirname, 'src/shims/react-dom-client.js'),
  },
  minify: !isWatch,
  sourcemap: isWatch,
  logLevel: 'info',
};

// CSS kopieren
function copyCSS() {
  const srcCSS = path.join(__dirname, 'src/styles/main.css');
  const destCSS = path.join(__dirname, 'dist/styles.css');

  if (fs.existsSync(srcCSS)) {
    fs.copyFileSync(srcCSS, destCSS);
    console.log('📝 CSS kopiert: dist/styles.css');
  } else {
    console.warn('⚠️  CSS-Datei nicht gefunden: src/styles/main.css');
  }
}

async function build() {
  try {
    if (isWatch) {
      console.log('👀 Watch mode aktiviert...');
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      copyCSS();
      console.log('✅ Watching for changes...');
    } else {
      console.log('🔨 Building...');
      await esbuild.build(buildOptions);
      copyCSS();
      console.log('✅ Build erfolgreich!');
      console.log(`📦 Bundle erstellt: dist/bundle.js`);
    }
  } catch (error) {
    console.error('❌ Build-Fehler:', error);
    process.exit(1);
  }
}

build();

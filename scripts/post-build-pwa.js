const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const webDir = path.join(__dirname, '..', 'web');

// 1. Copiar os ícones PWA para o dist/
const iconFiles = ['pwa-icon-192.png', 'pwa-icon-512.png', 'manifest.json', 'service-worker.js'];
iconFiles.forEach(file => {
  const src = path.join(webDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copiado: ${file}`);
  }
});

// 2. Injetar tags PWA no index.html gerado pelo Expo
const indexPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const pwaTags = `
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#0F2A5A" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="ControlTec" />
  <link rel="apple-touch-icon" href="/pwa-icon-192.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/pwa-icon-192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/pwa-icon-512.png" />
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(reg) { console.log('SW registrado:', reg.scope); })
          .catch(function(err) { console.log('SW erro:', err); });
      });
    }
  </script>
`;

// Injeta antes do </head>
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', pwaTags + '</head>');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✅ Tags PWA injetadas no index.html');
} else {
  console.log('ℹ️ Tags PWA já existem no index.html');
}

// 3. Copiar também para os outros HTMLs gerados
const htmlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html') && f !== 'index.html');
htmlFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('rel="manifest"')) {
    content = content.replace('</head>', pwaTags + '</head>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Tags PWA injetadas em ${file}`);
  }
});

console.log('🚀 Pós-build PWA concluído!');

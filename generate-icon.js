// Simple icon generator using Canvas (Node.js)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon with money symbol
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#grad)"/>
  <text x="256" y="360" font-family="Arial, sans-serif" font-size="280" fill="white" text-anchor="middle" font-weight="bold">$</text>
</svg>`;

// Save SVG file
const svgPath = path.join(__dirname, 'app-icon.svg');
fs.writeFileSync(svgPath, svgContent);

console.log('✅ SVG icon created at:', svgPath);
console.log('\n📋 Next steps:');
console.log('1. Use an online tool to convert SVG to Android icons:');
console.log('   - Visit: https://easyappicon.com or https://romannurik.github.io/AndroidAssetStudio/');
console.log('   - Upload app-icon.svg');
console.log('   - Download the generated icons');
console.log('2. Replace icons in android/app/src/main/res/mipmap-* folders');
console.log('3. Run: npx cap sync android');
console.log('4. Rebuild the APK');

// Generate simple icons for PWA
const fs = require('fs');
const path = require('path');

// Simple SVG icon with tool emoji
const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.15}"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="${size * 0.5}">🛠️</text>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svg = svgIcon(size);
  fs.writeFileSync(path.join(__dirname, `../public/icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);
});

console.log('Icons generated!');
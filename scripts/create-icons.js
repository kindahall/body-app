#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Génération des icônes PWA manquantes...');

// Création d'une icône simple au format PNG (base64)
function createIcon(size) {
  // SVG simple avec le logo de l'app
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 10}" fill="url(#grad)" />
      <text x="${size/2}" y="${size/2 + 8}" font-family="Arial, sans-serif" font-size="${size/8}" font-weight="bold" text-anchor="middle" fill="white">BC</text>
    </svg>
  `;
  
  return Buffer.from(svg).toString('base64');
}

// Créer l'icône 192x192
const icon192Data = `data:image/svg+xml;base64,${createIcon(192)}`;
const icon512Data = `data:image/svg+xml;base64,${createIcon(512)}`;

// Pour l'instant, créons des icônes temporaires simples
const simpleIcon192 = Buffer.from(`
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#ec4899" rx="20"/>
  <text x="96" y="110" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle" fill="white">BC</text>
</svg>
`);

const simpleIcon512 = Buffer.from(`
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#ec4899" rx="50"/>
  <text x="256" y="290" font-family="Arial" font-size="128" font-weight="bold" text-anchor="middle" fill="white">BC</text>
</svg>
`);

// Sauvegarder les icônes
fs.writeFileSync(path.join(__dirname, '../public/icon-192.svg'), simpleIcon192);
fs.writeFileSync(path.join(__dirname, '../public/icon-512.svg'), simpleIcon512);

console.log('✅ Icônes SVG créées avec succès !');
console.log('📁 public/icon-192.svg');
console.log('📁 public/icon-512.svg');

// Mettre à jour le manifest pour utiliser les SVG
const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.icons = [
  ...manifest.icons.filter(icon => !icon.src.includes('icon-')),
  {
    "src": "/icon-192.svg",
    "sizes": "192x192",
    "type": "image/svg+xml",
    "purpose": "any maskable"
  },
  {
    "src": "/icon-512.svg", 
    "sizes": "512x512",
    "type": "image/svg+xml",
    "purpose": "any maskable"
  }
];

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('✅ Manifest.json mis à jour !');
console.log('🎯 Les erreurs 404 sur les icônes devraient être résolues.'); 
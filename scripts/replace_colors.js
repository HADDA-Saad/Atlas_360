const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[#0F0D0A\]/g, replacement: 'bg-background' },
  { regex: /bg-\[#1A1814\]/g, replacement: 'bg-card' },
  { regex: /bg-\[#1A1610\]/g, replacement: 'bg-card' },
  { regex: /bg-\[#231F18\]/g, replacement: 'bg-muted' },
  { regex: /text-\[#F0E6D8\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#F0E6D3\]/g, replacement: 'text-foreground' },
  { regex: /text-\[#8B7355\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#BFA882\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#A89880\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#C1440E\]/g, replacement: 'text-primary' },
  { regex: /bg-\[#C1440E\]/g, replacement: 'bg-primary' },
  { regex: /border-\[#E8D5B7\]\/\d+/g, replacement: 'border-border' },
  { regex: /border-\[#C1440E\]/g, replacement: 'border-primary' },
  { regex: /from-\[#0F0D0A\]/g, replacement: 'from-background' },
  { regex: /from-\[#1A1610\]/g, replacement: 'from-card' },
  { regex: /text-white/g, replacement: 'text-foreground' },
  { regex: /bg-black/g, replacement: 'bg-background' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('./src/components');
processDir('./src/app');

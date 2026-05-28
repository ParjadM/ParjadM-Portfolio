const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      processDir(p);
    } else if (p.endsWith('.jsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      if (p.includes(path.join('src', 'components', 'layout'))) {
        content = content.replace(/\.\.\/utils\//g, '../../utils/');
      }
      
      fs.writeFileSync(p, content);
    }
  });
}

processDir(path.join(__dirname, 'src', 'components', 'layout'));

console.log('Fixed imports in layout components.');

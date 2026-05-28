const fs = require('fs');
const path = require('path');

const srcCode = fs.readFileSync('src/App.jsx', 'utf8');

// The file has // --- Section Name --- comments.
// We can use a regex to split the file by these headers.

const sections = [];
const regex = /\/\/ --- (.*?) ---\r?\n/g;
let match;
let lastIndex = 0;

while ((match = regex.exec(srcCode)) !== null) {
  if (lastIndex !== 0 || match.index > 0) {
    sections.push({
      title: srcCode.substring(lastIndex, match.index).trim() === '' ? 'Imports' : sections[sections.length - 1]?.title || 'Imports',
      content: srcCode.substring(lastIndex, match.index)
    });
  }
  sections.push({
    title: match[1],
    content: '', // will be filled next iteration or end
    startIndex: regex.lastIndex
  });
  lastIndex = regex.lastIndex;
}
if (lastIndex < srcCode.length) {
    sections[sections.length - 1].content = srcCode.substring(lastIndex);
}

// Log section titles
sections.forEach((s, i) => {
    console.log(`${i}: ${s.title}`);
});

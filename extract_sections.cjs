const fs = require('fs');
const srcCode = fs.readFileSync('src/App.jsx', 'utf8');

const componentsToExtract = [
  'HomeSection', 'AboutSection', 'ProjectsSection', 'LQFTBenchmarkPage', 
  'BlogSection', 'BlogPostPage', 'ContactSection'
];

const commonImports = `import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route, useParams } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../components/ui/Icons.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Reveal } from '../components/Reveal.jsx';
import { getAuthToken } from '../utils/auth.jsx';

// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.
import ParjadImage from '../Images/Parjad.jpg';
import GitHubStats from '../components/GitHubStats.tsx';
import LeetCodeStats from '../components/LeetCodeStats.tsx';
import ParjadM from '../Images/ParjadM.png';
import Logo from '../Images/Logo.png';
import CodeQuestImage from '../Images/CodeQuest.jpg';
import BinaryGeneratorImage from '../Images/Binary 1010 Generator.jpg';
import SpaceShooterImage from '../Images/SpaceShooter.jpg';

`;

for (const comp of componentsToExtract) {
  // Find "const CompName = ({...}) => {" or similar
  const regex = new RegExp(`const ${comp}\\s*=\\s*\\(.*?\\)\\s*=>\\s*\\{`, 'g');
  const match = regex.exec(srcCode);
  if (!match) continue;
  
  let braceCount = 1;
  let startIndex = match.index;
  // start searching right after the '{'
  let endIndex = -1;
  
  for (let i = startIndex + match[0].length; i < srcCode.length; i++) {
    if (srcCode[i] === '{') {
      braceCount++;
    } else if (srcCode[i] === '}') {
      braceCount--;
    }
    
    if (braceCount === 0) {
      endIndex = i + 1;
      if (srcCode[endIndex] === ';') endIndex++;
      break;
    }
  }
  
  if (endIndex !== -1) {
    let content = srcCode.substring(startIndex, endIndex);
    content = commonImports + content.replace(`const ${comp} =`, `export const ${comp} =`);
    fs.writeFileSync(`src/pages/${comp}.jsx`, content);
    console.log(`Wrote src/pages/${comp}.jsx length: \${content.length}`);
  } else {
    console.log(`Failed to extract ${comp}`);
  }
}

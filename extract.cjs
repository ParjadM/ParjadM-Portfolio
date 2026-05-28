const fs = require('fs');
const path = require('path');

const srcCode = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /\/\/ --- (.*?) ---\r?\n/g;
let match;
let lastIndex = 0;
const sections = [];

while ((match = regex.exec(srcCode)) !== null) {
  if (lastIndex !== 0 || match.index > 0) {
    sections.push({
      title: srcCode.substring(lastIndex, match.index).trim() === '' ? 'Imports' : sections[sections.length - 1]?.title || 'Imports',
      content: srcCode.substring(lastIndex, match.index)
    });
  }
  sections.push({
    title: match[1],
    content: '', 
    startIndex: regex.lastIndex
  });
  lastIndex = regex.lastIndex;
}
if (lastIndex < srcCode.length) {
    sections[sections.length - 1].content = srcCode.substring(lastIndex);
}

// Clean up duplicate headers
const uniqueSections = [];
for (let i = 0; i < sections.length; i++) {
  if (sections[i].content !== '') {
    uniqueSections.push(sections[i]);
  }
}

const fileMap = {
  'Admin Blog Manager': 'src/pages/admin/AdminBlogManager.jsx',
  'Admin Projects Manager': 'src/pages/admin/AdminProjectsManager.jsx',
  'Admin AI Manager': 'src/pages/admin/AdminAIManager.jsx',
  'Admin Dashboard': 'src/pages/admin/AdminDashboard.jsx',
  'Admin Login Page': 'src/pages/admin/AdminLoginPage.jsx',
  'News Feed (rotating blog titles + dropdown)': 'src/components/ui/NewsFeed.jsx',
  'Header Component': 'src/components/layout/Header.jsx',
  'Background Blobs': 'src/components/ui/BackgroundBlobs.jsx',
  'ClickUp Section (fun interactive counter)': 'src/pages/ContactSection.jsx', // Actually it's just the contact section?
  'Stats Page': 'src/pages/StatsPage.jsx',
  'Tiny Line Chart Component': 'src/components/ui/Chart.jsx',
  'Footer Component': 'src/components/layout/Footer.jsx',
  '404 Not Found Page': 'src/pages/NotFoundPage.jsx',
  'Layout Component (wraps all pages)': 'src/components/layout/Layout.jsx',
};

const commonImports = `import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../components/ui/Icons.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import { getAuthToken } from '../utils/auth.jsx';

`;

function ensureDirSync(dirpath) {
  try {
    fs.mkdirSync(dirpath, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}

uniqueSections.forEach(sec => {
  const file = fileMap[sec.title];
  if (file) {
    ensureDirSync(path.dirname(file));
    let content = sec.content;
    
    // For admin components
    if (file.includes('admin/')) {
        content = commonImports.replace(/\.\.\//g, '../../') + content;
    } else if (file.includes('components/')) {
        content = commonImports + content;
    } else if (file.includes('pages/')) {
        content = commonImports + content;
    }
    
    // Add export
    content = content.replace(/const ([A-Z][a-zA-Z0-9_]*) =/g, 'export const $1 =');
    fs.writeFileSync(file, content);
    console.log(`Wrote ${file}`);
  }
});

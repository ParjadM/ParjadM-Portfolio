import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../ui/Icons.jsx';
import { GlassCard } from '../ui/GlassCard.jsx';
import { RippleButton } from '../ui/RippleButton.jsx';
import { Toast } from '../ui/Toast.jsx';
import { getAuthToken } from '../../utils/auth.jsx';
import { useTranslation } from 'react-i18next';

export const Footer = ({ theme }) => {
    const { t } = useTranslation();
    const navLinks = [
        { name: t('nav.Home'), path: '/' },
        { name: t('nav.About'), path: '/about' },
        { name: t('nav.Projects'), path: '/projects' },
        { name: t('nav.Contact'), path: '/contact' }
    ];

    const socialLinks = [
        { 
            name: 'GitHub', 
            url: 'https://github.com/ParjadM',
            icon: <Github size={24} />
        },
        { 
            name: 'LinkedIn', 
            url: 'https://www.linkedin.com/in/parjadminooei',
            icon: <Linkedin size={24} />
        }
    ];

    return (
        <footer className="relative mt-20">
            {/* Decorative Top Border */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            
            <div className="container mx-auto px-6 py-16">
                {/* Main Content - Centered Layout */}
                <div className="max-w-4xl mx-auto">
                    {/* Brand & Description */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            Parjad Minooei
                        </h2>
                        <p className="text-gray-300 text-base max-w-2xl mx-auto leading-relaxed">
                            {t('footer.desc')}
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="mb-10">
                        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                            {navLinks.map(link => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 text-sm font-medium relative group"
                                    >
                                        {link.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-6 mb-10">
                        {socialLinks.map(social => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative"
                                aria-label={social.name}
                            >
                                <div className="p-4 bg-white/5 rounded-xl hover:bg-emerald-500/10 transition-all duration-300 text-gray-300 hover:text-emerald-400 transform hover:scale-110 hover:-translate-y-1">
                                    {social.icon}
                                </div>
                                {/* Tooltip */}
                                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-emerald-500/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                                    {social.name}
                                </span>
                            </a>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">
                            {t('footer.rights', { year: new Date().getFullYear() })}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};


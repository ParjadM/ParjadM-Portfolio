import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route, useParams } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../components/ui/Icons.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Reveal } from '../components/Reveal.jsx';
import { getAuthToken } from '../utils/auth.jsx';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { JobFitChecker } from '../components/JobFitChecker.jsx';
// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.
import ParjadImage from '../Images/Parjad.jpg';
import GitHubStats from '../components/GitHubStats.tsx';
import LeetCodeStats from '../components/LeetCodeStats.tsx';
import ParjadM from '../Images/ParjadM.png';
import Logo from '../Images/Logo.png';
import CodeQuestImage from '../Images/CodeQuest.jpg';
import BinaryGeneratorImage from '../Images/Binary 1010 Generator.jpg';
import SpaceShooterImage from '../Images/SpaceShooter.jpg';

export const AboutSection = ({ theme }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('story');

    const tabs = [
        { id: 'story', label: t('about.tabs.story') },
        { id: 'education', label: t('about.tabs.education') },
        { id: 'interests', label: t('about.tabs.interests') }
    ];

    const tabContent = {
        story: {
            title: "My Journey",
            content: (
                <div className="space-y-6">
                    <p className="text-gray-300 leading-relaxed">
                        {t('about.storyText1')}
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                        {t('about.storyText2')}
                    </p>
                    {t('about.storyText3_title') && (
                        <h4 className="text-lg font-bold text-white mt-8 mb-2">
                            {t('about.storyText3_title')}
                        </h4>
                    )}
                    <p className="text-gray-300 leading-relaxed">
                        {t('about.storyText3')}
                    </p>
                </div>
            )
        },
        education: {
            title: "Education & Learning",
            content: (
                <div className="space-y-6">
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">B.Tech in Software Engineering</h4>
                        <p className="text-gray-400 mb-1">McMaster University | Current</p>
                        <p className="text-gray-300">Focused on advanced software engineering principles, systems architecture, and large-scale application development. Building a deep foundation in engineering mathematics and professional software standards.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Graduate Certificate in Web Development</h4>
                        <p className="text-gray-400 mb-1">Previous Technical Training</p>
                        <p className="text-gray-300">Mastered modern frameworks (React, Node.js), responsive design, and full-stack architecture. Focused on industry best practices and deploying production-ready applications.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Computer Programming & Analysis</h4>
                        <p className="text-gray-400 mb-1">Advanced Diploma</p>
                        <p className="text-gray-300">Comprehensive programming education covering software development, data structures, and analytical problem-solving across multiple languages and platforms.</p>
                    </div>
                    <div className="border-l-4 border-white/20 pl-6">
                        <h4 className="text-xl font-bold text-white mb-2">Psychology</h4>
                        <p className="text-gray-400 mb-1">Bachelor's Degree</p>
                        <p className="text-gray-300">Focused on human behavior and cognition. This background provides a unique edge in User Experience (UX) design, understanding how users interact with technology and complex interfaces.</p>
                    </div>
                </div>
            )
        },
        interests: {
            title: "Beyond Code",
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Creative Pursuits</h4>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">Gaming & Game Development</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">UI/UX Design</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Learning & Growth</h4>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">LeetCode Challenges</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">Fitness & Wellness</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400'}`}></div>
                                <span className="text-gray-300">Mathematics & Algorithms</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    };

    const iconColor = theme === 'pink' ? "text-pink-400" : "text-emerald-400";
    const borderColor = theme === 'pink' ? "border-pink-400" : "border-emerald-400";

    return (
        <PageTransition className="min-h-screen flex items-center justify-center py-20 px-4">
            <SEO 
                title="About — Parjad Minooei"
                description="Learn about Parjad's background and skills."
            />
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <Reveal>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('about.title')}</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        {t('about.subtitle')}
                    </p>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Profile Section */}
                    <div className="lg:col-span-1">
                        <Reveal>
                        <GlassCard className="p-8 text-center" theme={theme}>
                            <div className={`w-48 h-48 mx-auto mb-6 rounded-full p-2 shadow-lg ${theme === 'pink' ? 'bg-gradient-to-br from-pink-500/50 to-red-500/50' : 'bg-gradient-to-br from-emerald-500/50 to-teal-500/50'}`}>
                                <img 
                                    src={ParjadImage}
                                    alt="Parjad Minooei" 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Parjad Minooei</h3>
                            <p className="text-gray-400 mb-4">{t('about.role')}</p>
                            <p className="text-gray-300 text-sm mb-6">
                                {t('about.location')}
                            </p>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 gap-4 mb-6">
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${iconColor}`}>3+</div>
                                    <div className="text-gray-400 text-sm">{t('about.yearsLearning')}</div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex justify-center space-x-4">
                                <a href="https://github.com/ParjadM" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-gray-300 hover:text-white">
                                    <Github size={20} />
                                </a>
                                <a href="https://www.linkedin.com/in/parjadminooei" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 text-gray-300 hover:text-white">
                                    <Linkedin size={20} />
                                </a>
                            </div>
                        </GlassCard>
                        </Reveal>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-2">
                        <Reveal>
                        <GlassCard className="p-8" theme={theme}>
                            {/* Tab Navigation */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                            activeTab === tab.id
                                                ? `${theme === 'pink' ? 'bg-pink-500/20' : 'bg-emerald-500/20'} text-white border-2 ${borderColor}`
                                                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border-2 border-transparent'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-6">
                                    {tabContent[activeTab].title}
                                </h3>
                                {tabContent[activeTab].content}
                            </div>
                        </GlassCard>
                        </Reveal>
                    </div>
                </div>

                <Reveal>
                <div className="mt-10">
                    <JobFitChecker theme={theme} />
                </div>
                </Reveal>
            </div>
        </PageTransition>
    );
};
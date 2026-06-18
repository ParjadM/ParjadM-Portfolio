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
// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.
import ParjadImage from '../Images/Parjad.jpg';
import GitHubStats from '../components/GitHubStats.tsx';
import LeetCodeStats from '../components/LeetCodeStats.tsx';
import ParjadM from '../Images/ParjadM.png';
import Logo from '../Images/Logo.png';
import CodeQuestImage from '../Images/CodeQuest.jpg';
import BinaryGeneratorImage from '../Images/Binary 1010 Generator.jpg';
import SpaceShooterImage from '../Images/SpaceShooter.jpg';

export const ContactSection = ({ theme }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        company: '' // honeypot
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('');
        
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                throw new Error('Failed to send');
            }
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '', company: '' });
        } catch (err) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus(''), 3000);
        }
    };

    const contactMethods = [
        {
            icon: <Github size={24} />,
            title: "GitHub",
            value: "github.com/ParjadM",
            href: "https://github.com/ParjadM",
            description: t('contact.info.githubDesc')
        },
        {
            icon: <Linkedin size={24} />,
            title: "LinkedIn",
            value: "linkedin.com/in/parjadminooei",
            href: "https://www.linkedin.com/in/parjadminooei",
            description: t('contact.info.linkedinDesc')
        }
    ];

    const gradientClass = theme === 'pink' 
        ? 'bg-gradient-to-r from-pink-500 to-red-500' 
        : 'bg-gradient-to-r from-emerald-500 to-teal-500';

    return (
        <PageTransition className="min-h-screen flex items-center justify-center py-20 px-4">
            <SEO 
                title="Contact — Parjad Minooei"
                description="Get in touch for opportunities and collaborations."
            />
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('contact.title')}</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        {t('contact.subtitle')}
                    </p>
                </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <Reveal>
                    <GlassCard className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-6">{t('contact.form.title')}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6 mobile-input">
                            {/* Honeypot field */}
                            <div className="hidden" aria-hidden="true">
                                <label>
                                    Company
                                    <input name="company" tabIndex={-1} autoComplete="off" onChange={(e)=>setFormData(prev=>({...prev, company: e.target.value}))} />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('contact.form.nameLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="name"
                                        inputMode="text"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder={t('contact.form.namePlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                        {t('contact.form.emailLabel')}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        autoComplete="email"
                                        inputMode="email"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder={t('contact.form.emailPlaceholder')}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('contact.form.subjectLabel')}
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    autoComplete="off"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                    placeholder={t('contact.form.subjectPlaceholder')}
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                    {t('contact.form.messageLabel')}
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 resize-none"
                                    placeholder={t('contact.form.messagePlaceholder')}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${gradientClass}`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        {t('contact.form.sending')}
                                    </div>
                                ) : (
                                    t('contact.form.send')
                                )}
                            </button>
                            
                            {submitStatus === 'success' && (
                                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-center">
                                    {t('contact.form.success')}
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
                                    {t('contact.form.error')}
                                </div>
                            )}
                        </form>
                    </GlassCard>
                    </Reveal>

                    {/* Contact Methods */}
                    <div className="space-y-8">
                        <Reveal>
                        <GlassCard className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">{t('contact.info.title')}</h3>
                            <div className="space-y-6">
                                {contactMethods.map((method, index) => (
                                    <a
                                        key={index}
                                        href={method.href}
                                        target={method.href.startsWith('http') ? '_blank' : '_self'}
                                        rel={method.href.startsWith('http') ? 'noopener noreferrer' : ''}
                                        className="flex items-center p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                                    >
                                        <div className={`p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 ${theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}`}>
                                            {method.icon}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="font-semibold text-white group-hover:text-white transition-colors duration-300">
                                                {method.title}
                                            </h4>
                                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                                                {method.description}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                {method.value}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </GlassCard>
                        </Reveal>
                        
                        <Reveal>
                        <GlassCard className="p-8 overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-4">{t('contact.info.availability')}</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className={`w-4 h-4 rounded-full ${theme === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'} animate-ping absolute`}></div>
                                        <div className={`w-4 h-4 rounded-full ${theme === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'} relative`}></div>
                                    </div>
                                    <p className="text-gray-300">{t('contact.info.availabilityStatus')}</p>
                                </div>
                                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                    <div className="text-gray-400 text-sm">{t('contact.info.responseTime')}</div>
                                    <div className="text-white font-medium">{t('contact.info.responseTimeValue')}</div>
                                </div>
                            </div>
                            
                            {/* Decorative chart-like background */}
                            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                                <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-white">
                                    <path d="M0 100 L20 80 L40 90 L60 50 L80 60 L100 20 V100 Z" />
                                </svg>
                            </div>
                        </GlassCard>
                        </Reveal>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
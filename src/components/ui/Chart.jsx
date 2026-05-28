import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from './Icons.jsx';
import { GlassCard } from './GlassCard.jsx';
import { RippleButton } from './RippleButton.jsx';
import { Toast } from './Toast.jsx';
import { getAuthToken } from '../../utils/auth.jsx';

export const Chart = ({ theme, data }) => {
  const width = 640, height = 220, padding = 32
  const xs = data.map((_, i) => i)
  const maxY = Math.max(1, ...data.map(d => Math.max(d.pageviews || 0, d.uniqueVisitors || 0)))
  const x = (i) => padding + (i * (width - 2*padding)) / Math.max(1, (data.length - 1))
  const y = (v) => height - padding - (v * (height - 2*padding)) / maxY
  const toPath = (vals) => vals.map((v, i) => `${i===0?'M':'L'}${x(i)},${y(v)}`).join(' ')
  const pv = toPath(data.map(d => d.pageviews || 0))
  const uv = toPath(data.map(d => d.uniqueVisitors || 0))
  const gridY = Array.from({length: 4}, (_,i)=>Math.round((maxY*i)/3))
  const colorA = theme === 'pink' ? '#fb7185' : '#34d399'
  const colorB = theme === 'pink' ? '#a78bfa' : '#22d3ee'
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* axes */}
      <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="rgba(255,255,255,0.2)" />
      <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="rgba(255,255,255,0.2)" />
      {gridY.map((gy,i)=> (
        <g key={i}>
          <line x1={padding} y1={y(gy)} x2={width-padding} y2={y(gy)} stroke="rgba(255,255,255,0.1)" />
          <text x={8} y={y(gy)+4} fontSize="10" fill="rgba(255,255,255,0.6)">{gy}</text>
        </g>
      ))}
      {/* lines */}
      <path d={pv} fill="none" stroke={colorA} strokeWidth="2.5" />
      <path d={uv} fill="none" stroke={colorB} strokeWidth="2.5" />
      {/* legend */}
      <g>
        <circle cx={width-200} cy={16} r={4} fill={colorA} />
        <text x={width-190} y={20} fontSize="12" fill="white">Impressions</text>
        <circle cx={width-100} cy={16} r={4} fill={colorB} />
        <text x={width-90} y={20} fontSize="12" fill="white">Visitors</text>
      </g>
    </svg>
  )
}

export const ContactSection = ({ theme }) => {
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
            description: "Check out my code"
        },
        {
            icon: <Linkedin size={24} />,
            title: "LinkedIn",
            value: "linkedin.com/in/parjadminooei",
            href: "https://www.linkedin.com/in/parjadminooei",
            description: "Connect professionally"
        }
    ];

    const gradientClass = theme === 'pink' 
        ? 'bg-gradient-to-r from-pink-500 to-red-500' 
        : 'bg-gradient-to-r from-emerald-500 to-teal-500';

    return (
        <section id="contact" className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Let's Connect</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        I'm currently seeking new opportunities and am open to collaboration. 
                        Whether you have a question or just want to say hi, feel free to reach out.
                    </p>
                </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <Reveal>
                    <GlassCard className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-6">Send me a message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                    placeholder="What's this about?"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 resize-none"
                                    placeholder="Tell me about your project or just say hello!"
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
                                        Sending...
                                    </div>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                            
                            {submitStatus === 'success' && (
                                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-center">
                                    ✅ Message sent successfully! I'll get back to you soon.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
                                    ❌ Failed to send message. Please try again later.
                                </div>
                            )}
                        </form>
                    </GlassCard>
                    </Reveal>

                    {/* Contact Methods */}
                    <div className="space-y-8">
                        <Reveal>
                        <GlassCard className="p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">Get in touch</h3>
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
                                <h3 className="text-2xl font-bold text-white mb-4">Availability</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className={`w-4 h-4 rounded-full ${theme === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'} animate-ping absolute`}></div>
                                        <div className={`w-4 h-4 rounded-full ${theme === 'pink' ? 'bg-pink-500' : 'bg-emerald-500'} relative`}></div>
                                    </div>
                                    <p className="text-gray-300">Open to new opportunities</p>
                                </div>
                                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                                    <div className="text-gray-400 text-sm">Response Time</div>
                                    <div className="text-white font-medium">Within 24 hours</div>
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
        </section>
    );
};



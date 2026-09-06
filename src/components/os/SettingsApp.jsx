import React, { useState } from 'react';
import { Monitor, Image as ImageIcon, Settings as SettingsIcon, Shield, Cpu, HardDrive, Terminal } from 'lucide-react';
import { getAchievements } from '../../os/achievements.js';

export const SettingsApp = ({ theme, osState }) => {
    const { wallpaper, setWallpaper, osTheme, setOsTheme, navigate } = osState || {};
    const [activeTab, setActiveTab] = useState('personalization');
    const [customUrl, setCustomUrl] = useState(wallpaper && wallpaper.startsWith('http') ? wallpaper : '');

    return (
        <div className="os-settings flex h-full w-full bg-gray-900 text-gray-200">
            {/* Sidebar */}
            <div className="w-1/3 max-w-[200px] border-r border-white/10 bg-gray-800/50 p-4 space-y-2">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Settings</h2>
                
                <button onClick={() => setActiveTab('personalization')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'personalization' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'}`}>
                    <Monitor className={`w-4 h-4 ${activeTab === 'personalization' ? 'text-blue-400' : 'text-gray-500'}`} />
                    <span>Personalization</span>
                </button>
                <button onClick={() => setActiveTab('system')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'system' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'}`}>
                    <SettingsIcon className={`w-4 h-4 ${activeTab === 'system' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span>System</span>
                </button>
                <button onClick={() => setActiveTab('privacy')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'privacy' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'}`}>
                    <Shield className={`w-4 h-4 ${activeTab === 'privacy' ? 'text-emerald-500' : 'text-gray-500'}`} />
                    <span>Privacy</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                    
                    {activeTab === 'personalization' && (
                        <>
                            {/* Header */}
                            <div>
                                <h1 className="text-3xl font-light text-white mb-1">Personalization</h1>
                                <p className="text-gray-400 text-sm">Customize how your workspace looks and feels.</p>
                            </div>

                    {/* Wallpaper Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-300 flex items-center">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Desktop Background
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { id: 'blobs', name: 'Fluid Blobs', preview: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' },
                                { id: 'solid', name: 'Solid Dark', preview: 'bg-gray-950' },
                                { id: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop', name: 'Abstract Liquid', type: 'image' },
                                { id: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', name: 'Earth Space', type: 'image' },
                                { id: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop', name: 'Cyber Neon', type: 'image' },
                                { id: 'https://images.unsplash.com/photo-1506744626753-140285396207?q=80&w=2070&auto=format&fit=crop', name: 'Mountain Lake', type: 'image' }
                            ].map(wp => (
                                <div 
                                    key={wp.id}
                                    onClick={() => setWallpaper(wp.id)}
                                    className={`cursor-pointer group relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${wallpaper === wp.id ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    {wp.type === 'image' ? (
                                        <img src={wp.id} alt={wp.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className={`absolute inset-0 ${wp.preview} opacity-80 group-hover:scale-105 transition-transform duration-500`} />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <span className="font-medium text-white drop-shadow-md text-xs sm:text-sm text-center px-1">{wp.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex space-x-2">
                            <input 
                                type="text"
                                placeholder="Custom Image URL..."
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                className="flex-1 bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <button 
                                onClick={() => { if (customUrl) setWallpaper(customUrl); }}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    {/* Theme Accent Color */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <h3 className="text-sm font-medium text-gray-300 flex items-center">
                            <Monitor className="w-4 h-4 mr-2" />
                            System Accent Color
                        </h3>
                        <div className="flex space-x-4">
                            {[
                                { id: 'emerald', color: 'bg-emerald-500' },
                                { id: 'blue', color: 'bg-blue-500' },
                                { id: 'purple', color: 'bg-purple-500' },
                                { id: 'pink', color: 'bg-pink-500' },
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setOsTheme(t.id)}
                                    className={`w-10 h-10 rounded-full transition-all ${t.color} ${osTheme === t.id ? 'ring-4 ring-white/50 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                                    title={t.id}
                                />
                            ))}
                        </div>
                    </div>
                    </>
                    )}

                    {activeTab === 'system' && (
                        <>
                            <div>
                                <h1 className="text-3xl font-light text-white mb-1">System</h1>
                                <p className="text-gray-400 text-sm">Hardware specifications and storage.</p>
                            </div>

                            {/* System Specs Mockup */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-300 flex items-center">
                                    <Cpu className="w-4 h-4 mr-2" />
                                    System Information
                                </h3>
                        
                        <div className="bg-gray-800/50 rounded-lg border border-white/5 p-4 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Processor</span>
                                <span className="text-gray-200">Neural Engine v4.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Installed RAM</span>
                                <span className="text-gray-200">128 GB Unified Memory</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">System Type</span>
                                <span className="text-gray-200">WebOS 64-bit architecture</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
                                <span className="text-gray-400 flex items-center"><HardDrive className="w-3.5 h-3.5 mr-1.5"/> Local Storage</span>
                                <button 
                                    onClick={() => {
                                        if (window.confirm("Clear all local storage (Notes, Settings, etc.)?")) {
                                            localStorage.clear();
                                            window.location.reload();
                                        }
                                    }}
                                    className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors text-xs font-medium"
                                >
                                    Format Drive
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate?.('/cli')}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-sm font-medium"
                        >
                            <Terminal className="w-4 h-4" /> Open Fullscreen CLI
                        </button>
                        <div className="mt-6 space-y-2">
                            <h3 className="text-sm font-medium text-gray-300">Achievements</h3>
                            {getAchievements().map(a => (
                                <div key={a.id} className={`text-xs px-3 py-2 rounded-lg border ${a.unlocked ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/5 bg-white/5 text-gray-500'}`}>
                                    {a.unlocked ? '✓' : '○'} {a.label} — {a.desc}
                                </div>
                            ))}
                        </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'privacy' && (
                        <>
                            <div>
                                <h1 className="text-3xl font-light text-white mb-1">Privacy & Security</h1>
                                <p className="text-gray-400 text-sm">Manage your security settings.</p>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg flex items-start space-x-3">
                                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-emerald-300 mb-1">Secure Environment</h4>
                                    <p className="text-sm opacity-80">This WebOS runs entirely in your browser sandbox. No personal files or data are uploaded to any external servers.</p>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

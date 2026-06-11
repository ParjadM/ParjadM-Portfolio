import React, { useState } from 'react';
import { Monitor, Image as ImageIcon, Settings as SettingsIcon, Shield, Cpu, HardDrive } from 'lucide-react';

export const SettingsApp = ({ theme, osState }) => {
    const { wallpaper, setWallpaper } = osState;
    const [activeTab, setActiveTab] = useState('personalization');

    return (
        <div className="flex h-full w-full bg-gray-900 text-gray-200">
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
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                onClick={() => setWallpaper('blobs')}
                                className={`cursor-pointer group relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${wallpaper === 'blobs' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <span className="font-medium text-white drop-shadow-md">Fluid Blobs</span>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setWallpaper('solid')}
                                className={`cursor-pointer group relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${wallpaper === 'solid' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                            >
                                <div className="absolute inset-0 bg-gray-950" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="font-medium text-white drop-shadow-md">Solid Dark</span>
                                </div>
                            </div>
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

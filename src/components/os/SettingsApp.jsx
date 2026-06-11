import React from 'react';
import { Monitor, Image as ImageIcon, Settings as SettingsIcon, Shield, Cpu, HardDrive } from 'lucide-react';

export const SettingsApp = ({ theme, osState }) => {
    const { wallpaper, setWallpaper } = osState;

    return (
        <div className="flex h-full w-full bg-gray-900 text-gray-200">
            {/* Sidebar */}
            <div className="w-1/3 max-w-[200px] border-r border-white/10 bg-gray-800/50 p-4 space-y-2">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Settings</h2>
                
                <button className="w-full flex items-center space-x-3 px-3 py-2 bg-white/10 rounded-lg text-sm font-medium transition-colors">
                    <Monitor className="w-4 h-4 text-blue-400" />
                    <span>Personalization</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors text-gray-400">
                    <SettingsIcon className="w-4 h-4 text-gray-500" />
                    <span>System</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors text-gray-400">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Privacy</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-8">
                    
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

                    <hr className="border-white/10" />

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

                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Search, Play, Video } from 'lucide-react';

export const YoutubeApp = ({ theme }) => {
    const [input, setInput] = useState('');
    const [videoId, setVideoId] = useState('jfKfPfyJRdk'); // Lofi girl default

    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        const id = extractVideoId(input);
        if (id) {
            setVideoId(id);
        } else {
            // Treat as raw ID if 11 chars
            if (input.trim().length === 11) {
                setVideoId(input.trim());
            }
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#0f0f0f] text-white">
            {/* Header / Navbar */}
            <div className="flex items-center p-3 space-x-4 border-b border-white/10">
                <div className="flex items-center space-x-1 text-red-500 font-semibold tracking-tighter text-xl">
                    <Video className="w-8 h-8" />
                    <span>YouTube</span>
                </div>

                <form 
                    onSubmit={handleSearch} 
                    className="flex-1 max-w-xl mx-auto flex items-center bg-[#121212] border border-[#303030] rounded-full overflow-hidden focus-within:border-blue-500 ml-4"
                >
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste YouTube URL or Video ID..." 
                        className="flex-1 bg-transparent border-none text-sm text-white px-4 py-2 focus:outline-none placeholder-gray-500"
                    />
                    <button type="submit" className="px-5 py-2 bg-[#222222] border-l border-[#303030] hover:bg-[#303030] transition-colors">
                        <Search className="w-5 h-5 text-gray-400" />
                    </button>
                </form>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                <div className="w-full max-w-5xl mx-auto flex flex-col flex-1">
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                        ></iframe>
                    </div>
                    
                    <div className="mt-4">
                        <h2 className="text-xl font-semibold">Video Player</h2>
                        <p className="text-gray-400 text-sm mt-1">Currently playing video ID: {videoId}</p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <h3 className="col-span-full font-semibold text-lg border-b border-white/10 pb-2 mb-2">Recommended</h3>
                        
                        {[
                            { id: 'jfKfPfyJRdk', title: 'Lofi Girl - beats to relax/study to' },
                            { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
                            { id: '5qap5aO4i9A', title: 'lofi hip hop radio - beats to sleep/chill to' }
                        ].map(rec => (
                            <button 
                                key={rec.id}
                                onClick={() => { setVideoId(rec.id); setInput(''); }}
                                className="flex space-x-3 text-left hover:bg-white/5 p-2 rounded-lg transition-colors group"
                            >
                                <div className="relative w-32 aspect-video bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                                    <img src={`https://img.youtube.com/vi/${rec.id}/mqdefault.jpg`} alt="thumbnail" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col py-1">
                                    <span className="text-sm font-medium line-clamp-2">{rec.title}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

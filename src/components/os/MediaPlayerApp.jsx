import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Radio } from 'lucide-react';

export const MediaPlayerApp = ({ theme }) => {
    // Lofi Girl 24/7 stream ID
    const VIDEO_ID = 'jfKfPfyJRdk';
    const [isPlaying, setIsPlaying] = useState(false);

    // Using Lofi Girl's persistent channel live stream URL so it never breaks
    const I_FRAME_SRC = "https://www.youtube.com/embed/live_stream?channel=UCSJ4gkVC6NrvII8umztf0Ow&autoplay=1&mute=0&controls=1&showinfo=0&rel=0";

    // Note: Due to browser autoplay policies and YouTube iframe API limitations, 
    // a pure custom UI overlaying a YouTube iframe requires the YouTube IFrame API.
    // To keep this lightweight and reliable, we will embed the iframe directly 
    // and style the container around it to look like a native media player.

    return (
        <div className="flex flex-col h-full w-full bg-gray-950 text-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center px-4 py-3 bg-gray-900 border-b border-white/5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                    <Music className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Lofi Radio</h3>
                    <p className="text-xs text-gray-400">beats to relax/study to</p>
                </div>
                <div className="ml-auto">
                    <Radio className="w-5 h-5 text-red-500 opacity-80" />
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 bg-black relative">
                <iframe
                    width="100%"
                    height="100%"
                    src={I_FRAME_SRC}
                    title="Lofi Radio"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                ></iframe>
            </div>
            
            {/* Fake bottom controls for aesthetic (actual controls are in iframe) */}
            <div className="h-2 w-full bg-gray-800">
                <div className="h-full bg-indigo-500 w-1/3 animate-pulse" />
            </div>
        </div>
    );
};

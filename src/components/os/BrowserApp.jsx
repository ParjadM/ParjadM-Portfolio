import React, { useState } from 'react';
import { Search, RotateCw, ChevronLeft, ChevronRight, Home, ShieldAlert } from 'lucide-react';

export const BrowserApp = ({ theme }) => {
    const [urlInput, setUrlInput] = useState('https://example.com');
    const [currentUrl, setCurrentUrl] = useState('https://example.com');
    const [iframeError, setIframeError] = useState(false);

    const handleNavigate = (e) => {
        e.preventDefault();
        let finalUrl = urlInput.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        setUrlInput(finalUrl);
        setCurrentUrl(finalUrl);
        setIframeError(false);
    };

    const handleHome = () => {
        setUrlInput('https://example.com');
        setCurrentUrl('https://example.com');
        setIframeError(false);
    };

    return (
        <div className="flex flex-col h-full w-full bg-white text-gray-900">
            {/* Browser Top Bar */}
            <div className="flex flex-col bg-gray-100 border-b border-gray-300">
                {/* Tabs Area */}
                <div className="flex items-center pt-2 px-2 space-x-1">
                    <div className="bg-white rounded-t-lg px-4 py-1.5 text-xs font-medium text-gray-700 flex items-center shadow-sm border border-b-0 border-gray-300 max-w-[200px] truncate">
                        <GlobeIcon className="w-3.5 h-3.5 mr-2 text-blue-500" />
                        New Tab
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="flex items-center px-3 py-2 space-x-3 bg-white border-b border-gray-300">
                    <div className="flex items-center space-x-2 text-gray-500">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronRight className="w-5 h-5" /></button>
                        <button onClick={handleNavigate} className="p-1 hover:bg-gray-100 rounded transition-colors"><RotateCw className="w-4 h-4" /></button>
                        <button onClick={handleHome} className="p-1 hover:bg-gray-100 rounded transition-colors"><Home className="w-4 h-4" /></button>
                    </div>

                    <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-1.5 border border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800"
                            placeholder="Search or enter web address"
                        />
                    </form>
                </div>
            </div>

            {/* Browser Content */}
            <div className="flex-1 relative bg-gray-50">
                {iframeError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
                        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Refused</h2>
                        <p className="text-gray-600 max-w-md">
                            The website at <strong>{currentUrl}</strong> has blocked embedding for security reasons (X-Frame-Options). 
                            Most major websites (like Google, YouTube, and Wikipedia) do not allow themselves to be loaded inside other websites.
                        </p>
                        <p className="mt-4 text-sm text-gray-500">Try loading a simple site like <em>example.com</em></p>
                    </div>
                ) : (
                    <iframe
                        src={currentUrl}
                        className="w-full h-full border-0"
                        title="Web Browser"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                        onError={() => setIframeError(true)}
                        onLoad={(e) => {
                            // Some basic error checking if possible, though iframe onload fires even on 404/X-Frame-Options.
                            // We can't reliably catch X-Frame-Options due to CORS, but we can set the UI up to look nice.
                        }}
                    />
                )}
            </div>
        </div>
    );
};

function GlobeIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
    );
}

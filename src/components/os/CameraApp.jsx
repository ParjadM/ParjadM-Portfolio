import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Video, Trash2, Download } from 'lucide-react';

export const CameraApp = ({ theme }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState('');
    const [view, setView] = useState('camera'); // 'camera' or 'gallery'

    // Load saved photos on mount
    useEffect(() => {
        const saved = localStorage.getItem('os_camera_photos');
        if (saved) {
            try {
                setPhotos(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load photos", e);
            }
        }
    }, []);

    // Save photos whenever they change
    useEffect(() => {
        localStorage.setItem('os_camera_photos', JSON.stringify(photos));
    }, [photos]);

    const startCamera = async () => {
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Camera access denied or unavailable.');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        if (view === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [view]);

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        const newPhoto = {
            id: Date.now().toString(),
            url: dataUrl,
            date: new Date().toLocaleString()
        };
        
        setPhotos(prev => [newPhoto, ...prev]);
        
        // Flash effect could be added here
    };

    const deletePhoto = (id) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="flex h-full w-full bg-gray-900 text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 flex flex-col items-center py-4 bg-gray-950 border-r border-white/5 space-y-4">
                <button 
                    onClick={() => setView('camera')}
                    className={`p-3 rounded-xl transition-colors ${view === 'camera' ? 'bg-white/10 text-emerald-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    title="Camera"
                >
                    <Video className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => setView('gallery')}
                    className={`p-3 rounded-xl transition-colors ${view === 'gallery' ? 'bg-white/10 text-emerald-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    title="Gallery"
                >
                    <div className="relative">
                        <ImageIcon className="w-6 h-6" />
                        {photos.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                                {photos.length}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative bg-black">
                {view === 'camera' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        {error ? (
                            <div className="text-center space-y-4">
                                <Camera className="w-16 h-16 text-red-500 mx-auto opacity-50" />
                                <p className="text-red-400">{error}</p>
                                <button onClick={startCamera} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors">
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                <video 
                                    ref={videoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                                
                                {/* Controls Overlay */}
                                <div className="absolute bottom-6 inset-x-0 flex justify-center">
                                    <button 
                                        onClick={takePhoto}
                                        disabled={!stream}
                                        className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-full group-hover:bg-gray-200 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                {view === 'gallery' && (
                    <div className="absolute inset-0 p-8 overflow-y-auto bg-gray-900">
                        <h2 className="text-2xl font-light mb-6 flex items-center space-x-3">
                            <ImageIcon className="w-6 h-6 text-emerald-400" />
                            <span>Camera Roll</span>
                        </h2>
                        
                        {photos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
                                <ImageIcon className="w-16 h-16 opacity-20" />
                                <p>No photos yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {photos.map(photo => (
                                    <div key={photo.id} className="relative group aspect-square bg-black rounded-lg overflow-hidden border border-white/10">
                                        <img 
                                            src={photo.url} 
                                            alt="Snapshot" 
                                            className="w-full h-full object-cover transform scale-x-[-1]"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                            <span className="text-[10px] text-white/70">{photo.date}</span>
                                            <div className="flex justify-end space-x-2">
                                                <a 
                                                    href={photo.url} 
                                                    download={`snapshot-${photo.id}.jpg`}
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4 text-white" />
                                                </a>
                                                <button 
                                                    onClick={() => deletePhoto(photo.id)}
                                                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg backdrop-blur-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

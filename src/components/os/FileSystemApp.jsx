import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, Image as ImageIcon, ChevronRight, ChevronLeft, Search, HardDrive } from 'lucide-react';

export const FileSystemApp = ({ theme }) => {
    const [currentPath, setCurrentPath] = useState(['C:', 'Users', 'Guest']);
    const [photos, setPhotos] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Fetch photos on mount to populate the Pictures folder
    useEffect(() => {
        const saved = localStorage.getItem('os_camera_photos');
        if (saved) {
            try {
                setPhotos(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const rootRef = useRef(null);
    const [fileSystem, setFileSystem] = useState({
        name: 'C:',
        type: 'drive',
        children: [
            {
                name: 'Users',
                type: 'folder',
                children: [
                    {
                        name: 'Guest',
                        type: 'folder',
                        children: [
                            {
                                name: 'Documents',
                                type: 'folder',
                                children: [
                                    { name: 'Welcome.txt', type: 'file', content: 'Welcome to Parjad WebOS! Feel free to explore.' },
                                    { name: 'Secret.txt', type: 'file', content: 'You found the secret file. 42 is the answer.' }
                                ]
                            },
                            {
                                name: 'Pictures',
                                type: 'folder',
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    });

    useEffect(() => {
        setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev));
            const users = newFs.children.find(c => c.name === 'Users');
            const guest = users?.children.find(c => c.name === 'Guest');
            const pictures = guest?.children.find(c => c.name === 'Pictures');
            if (pictures) {
                pictures.children = photos.map(p => ({
                    name: `Snapshot-${p.id}.jpg`,
                    type: 'image',
                    url: p.url
                }));
            }
            return newFs;
        });
    }, [photos]);

    const handleContextMenu = (e) => {
        e.preventDefault();
        if (rootRef.current) {
            const rect = rootRef.current.getBoundingClientRect();
            setContextMenu({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const closeContextMenu = () => setContextMenu({ ...contextMenu, visible: false });

    const createItem = (type) => {
        setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev));
            let current = newFs;
            for (let i = 1; i < currentPath.length; i++) {
                current = current.children?.find(c => c.name === currentPath[i]);
            }
            if (current && current.children) {
                const baseName = type === 'folder' ? 'New Folder' : 'New Text Document.txt';
                let name = baseName;
                let counter = 1;
                while (current.children.find(c => c.name === name)) {
                    name = type === 'folder' ? `New Folder (${counter})` : `New Text Document (${counter}).txt`;
                    counter++;
                }
                current.children.push({
                    name,
                    type,
                    ...(type === 'file' ? { content: 'Empty file' } : { children: [] })
                });
            }
            return newFs;
        });
        closeContextMenu();
    };

    // Traverse to current path
    const getCurrentFolder = () => {
        let current = fileSystem;
        for (let i = 1; i < currentPath.length; i++) { // Skip 'C:'
            const found = current.children?.find(c => c.name === currentPath[i]);
            if (found) {
                current = found;
            } else {
                break;
            }
        }
        return current;
    };

    const currentFolder = getCurrentFolder();

    const navigateTo = (name) => {
        setCurrentPath([...currentPath, name]);
        setSelectedFile(null);
        closeContextMenu();
    };

    const navigateUp = () => {
        if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
            setSelectedFile(null);
        }
    };

    const openFile = (file) => {
        if (file.type === 'file' || file.type === 'image') {
            setSelectedFile(file);
        }
    };

    return (
        <div ref={rootRef} className="relative flex flex-col h-full w-full bg-[#1e1e1e] text-gray-200 font-sans select-none" onClick={closeContextMenu}>
            {/* Top Navigation Bar */}
            <div className="flex items-center space-x-2 p-2 bg-[#252526] border-b border-black/20 shadow-sm">
                <button 
                    onClick={navigateUp}
                    disabled={currentPath.length <= 1}
                    className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-1.5 rounded opacity-30 cursor-not-allowed">
                    <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Breadcrumbs */}
                <div className="flex-1 flex items-center bg-[#3c3c3c] px-3 py-1.5 rounded shadow-inner text-sm border border-black/20 overflow-hidden">
                    {currentPath.map((part, idx) => (
                        <React.Fragment key={idx}>
                            <span className="text-gray-300 hover:text-white cursor-pointer px-1">
                                {part}
                            </span>
                            {idx < currentPath.length - 1 && <ChevronRight className="w-3 h-3 text-gray-500 mx-1" />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="w-48 bg-[#3c3c3c] px-3 py-1.5 rounded flex items-center shadow-inner border border-black/20">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-[#252526] border-r border-black/20 p-2 overflow-y-auto">
                    <ul className="space-y-1 text-sm text-gray-300">
                        <li>
                            <button 
                                onClick={() => { setCurrentPath(['C:']); setSelectedFile(null); }}
                                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 ${currentPath.length === 1 ? 'bg-white/10 text-white' : ''}`}
                            >
                                <HardDrive className="w-4 h-4 text-gray-400" />
                                <span>Local Disk (C:)</span>
                            </button>
                        </li>
                        <li>
                            <button 
                                onClick={() => { setCurrentPath(['C:', 'Users', 'Guest']); setSelectedFile(null); }}
                                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-white/10 pl-6 ${currentPath.join('/') === 'C:/Users/Guest' ? 'bg-white/10 text-white' : ''}`}
                            >
                                <Folder className="w-4 h-4 text-[#dcb67a]" />
                                <span>Guest Home</span>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* File Viewer / Grid */}
                <div 
                    className="flex-1 bg-[#1e1e1e] overflow-y-auto relative"
                    onContextMenu={handleContextMenu}
                >
                    {selectedFile ? (
                        <div className="absolute inset-0 bg-white text-black flex flex-col z-10">
                            <div className="flex items-center justify-between p-2 bg-gray-200 border-b border-gray-300">
                                <span className="text-sm font-semibold text-gray-700">{selectedFile.name} - Notepad Viewer</span>
                                <button onClick={() => setSelectedFile(null)} className="px-3 py-1 hover:bg-gray-300 text-sm rounded">Close</button>
                            </div>
                            <div className="flex-1 p-4 overflow-auto bg-white">
                                {selectedFile.type === 'file' && (
                                    <textarea 
                                        className="w-full h-full resize-none border-none focus:outline-none font-mono text-sm bg-transparent"
                                        readOnly
                                        value={selectedFile.content}
                                    />
                                )}
                                {selectedFile.type === 'image' && (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded border border-dashed border-gray-300">
                                        <img src={selectedFile.url} alt={selectedFile.name} className="max-w-full max-h-full object-contain shadow-md" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {currentFolder?.children?.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-10">
                                    This folder is empty.
                                </div>
                            )}
                            {currentFolder?.children?.map((item, idx) => (
                                <button
                                    key={idx}
                                    onDoubleClick={() => item.type === 'folder' ? navigateTo(item.name) : openFile(item)}
                                    className="flex flex-col items-center p-2 hover:bg-white/10 rounded group transition-colors focus:bg-white/10 focus:outline-none"
                                >
                                    {item.type === 'folder' && <Folder className="w-12 h-12 text-[#dcb67a] drop-shadow-md mb-2 group-hover:scale-105 transition-transform" fill="#dcb67a" />}
                                    {item.type === 'file' && <FileText className="w-12 h-12 text-white drop-shadow-md mb-2 group-hover:scale-105 transition-transform" />}
                                    {item.type === 'image' && (
                                        <div className="w-12 h-12 mb-2 relative rounded overflow-hidden shadow-md group-hover:scale-105 transition-transform border border-white/20 bg-black">
                                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <span className="text-xs text-center break-all w-full line-clamp-2">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Status Bar */}
            <div className="bg-[#007acc] text-white text-xs px-3 py-1 flex justify-between">
                <span>{currentFolder?.children?.length || 0} items</span>
                <span>OS File Explorer</span>
            </div>
            {/* Context Menu */}
            {contextMenu.visible && (
                <div 
                    className="absolute z-[9999] w-48 bg-[#252526] border border-black/40 rounded shadow-2xl py-1 text-sm text-gray-300"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <button onClick={(e) => { e.stopPropagation(); createItem('folder'); }} className="w-full text-left px-4 py-1.5 hover:bg-[#094771] hover:text-white flex items-center space-x-2">
                        <Folder className="w-4 h-4 text-[#dcb67a]" fill="#dcb67a" />
                        <span>New Folder</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); createItem('file'); }} className="w-full text-left px-4 py-1.5 hover:bg-[#094771] hover:text-white flex items-center space-x-2 mt-1">
                        <FileText className="w-4 h-4 text-white" />
                        <span>New Text Document</span>
                    </button>
                </div>
            )}
        </div>
    );
};

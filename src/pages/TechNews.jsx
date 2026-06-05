import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { ExternalLink, User, ArrowUp } from 'lucide-react';

export const TechNews = ({ theme }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch top story IDs
                const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
                const storyIds = await res.json();
                
                // Get the top 15 stories
                const top15 = storyIds.slice(0, 15);
                
                // Fetch details for each story
                const storyPromises = top15.map(id => 
                    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
                );
                
                const fetchedStories = await Promise.all(storyPromises);
                setStories(fetchedStories.filter(s => s !== null));
            } catch (err) {
                setError('Failed to load the latest tech news. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 20 }
        }
    };

    return (
        <PageTransition>
            <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
                <div className="mb-12 text-center md:text-left pt-8">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4"
                    >
                        Tech <span className={theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}>Hub</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-gray-400 text-lg md:text-xl max-w-2xl"
                    >
                        The top 15 trending stories right now from Hacker News. Stay sharp, stay informed.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${theme === 'pink' ? 'border-pink-500' : 'border-emerald-500'}`}></div>
                        <p className="text-gray-400 font-medium animate-pulse">Pulling live data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400 text-lg bg-red-400/10 inline-block px-6 py-3 rounded-2xl border border-red-400/20">{error}</p>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {stories.map((story, idx) => {
                            const storyUrl = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
                            const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : 'news.ycombinator.com';
                            
                            return (
                                <motion.div key={story.id} variants={cardVariants}>
                                    <a href={storyUrl} target="_blank" rel="noopener noreferrer" className="block h-full outline-none group">
                                        <GlassCard 
                                            theme={theme} 
                                            className="h-full flex flex-col p-6 transition-all duration-300 group-hover:scale-[1.02] group-focus:scale-[1.02] group-hover:border-white/30"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`flex items-center space-x-1 text-sm font-bold ${theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}`}>
                                                    <ArrowUp className="w-4 h-4" />
                                                    <span>{story.score}</span>
                                                </div>
                                                <div className="p-2 rounded-full bg-white/5 text-gray-400 group-hover:text-white transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </div>
                                            </div>
                                            
                                            <h2 className="text-lg font-bold text-gray-200 group-hover:text-white transition-colors mb-4 line-clamp-3 leading-snug">
                                                {story.title}
                                            </h2>
                                            
                                            <div className="mt-auto flex items-center justify-between text-xs text-gray-500 font-medium pt-4 border-t border-white/5">
                                                <div className="flex items-center space-x-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[100px]">{story.by}</span>
                                                </div>
                                                <span className="truncate max-w-[120px] text-right">{domain}</span>
                                            </div>
                                        </GlassCard>
                                    </a>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
};

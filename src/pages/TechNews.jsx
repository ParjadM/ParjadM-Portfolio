import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { ExternalLink, Heart, Clock, User } from 'lucide-react';
import { SEO } from '../components/SEO.jsx';

export const TechNews = ({ theme }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch the top daily articles from Dev.to
                const res = await fetch('https://dev.to/api/articles?top=1&per_page=12');
                const data = await res.json();
                setStories(data);
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
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 20 }
        }
    };

    return (
        <PageTransition>
            <SEO
                titleKey="seo.techNewsTitle"
                descriptionKey="seo.techNewsDesc"
            />
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl pb-24">
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
                        The top software engineering articles of the day, sourced directly from the global developer community.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${theme === 'pink' ? 'border-pink-500' : 'border-emerald-500'}`}></div>
                        <p className="text-gray-400 font-medium animate-pulse">Pulling latest articles...</p>
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {stories.map((story) => {
                            const tags = story.tag_list || [];
                            const imageUrl = story.cover_image || story.social_image;
                            
                            return (
                                <motion.div key={story.id} variants={cardVariants} className="h-full">
                                    <a href={story.url} target="_blank" rel="noopener noreferrer" className="block h-full outline-none group">
                                        <GlassCard 
                                            theme={theme} 
                                            className="h-full flex flex-col overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-focus:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group-hover:border-white/30 p-0"
                                        >
                                            {/* Image Header */}
                                            <div className="relative w-full h-48 bg-gray-900/50 overflow-hidden">
                                                {imageUrl ? (
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={story.title} 
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${theme === 'pink' ? 'from-pink-500/20 to-purple-500/20' : 'from-emerald-500/20 to-teal-500/20'}`}>
                                                        <span className="text-4xl">💻</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="w-4 h-4" />
                                                </div>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className={`text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${theme === 'pink' ? 'text-pink-300' : 'text-emerald-300'}`}>
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <h2 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors mb-3 line-clamp-3 leading-snug">
                                                    {story.title}
                                                </h2>
                                                
                                                <p className="text-sm text-gray-400 line-clamp-2 mb-6">
                                                    {story.description}
                                                </p>
                                                
                                                {/* Footer */}
                                                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        {story.user.profile_image ? (
                                                            <img src={story.user.profile_image} alt={story.user.name} className="w-8 h-8 rounded-full" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-300 truncate max-w-[100px]">{story.user.name}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4 text-xs font-medium text-gray-400">
                                                        <div className="flex items-center space-x-1">
                                                            <Heart className={`w-3.5 h-3.5 ${theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'}`} />
                                                            <span>{story.public_reactions_count}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>{story.reading_time_minutes}m</span>
                                                        </div>
                                                    </div>
                                                </div>
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

export default TechNews;

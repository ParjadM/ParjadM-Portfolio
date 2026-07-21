import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { useTranslation } from 'react-i18next';
import { BlogCardSkeleton } from '../components/ui/Skeleton.jsx';
import { formatDate } from '../utils/formatDate.js';
// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.

export const BlogSection = ({ theme }) => {
    const { t, i18n } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const categories = {
        'all': t('blog.categories.all'),
        'technology': t('blog.categories.technology'),
        'tutorial': t('blog.categories.tutorial'),
        'personal': t('blog.categories.personal')
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blog');
                const data = await res.json();
                setPosts(Array.isArray(data.posts) ? data.posts : []);
            } catch (e) {
                setError(t('blog.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = selectedCategory === 'all' 
        ? posts 
        : posts.filter(post => post.category === selectedCategory);
    const featuredPost = selectedCategory === 'all' ? posts.find(p => p.featured) || null : null;

    const iconColor = theme === 'pink' ? "text-pink-400" : "text-emerald-400";
    const categoryBgColor = theme === 'pink' ? "bg-pink-500/20" : "bg-emerald-500/20";
    const tagColor = theme === 'pink' ? "bg-pink-500/20 text-pink-300" : "bg-emerald-500/20 text-emerald-300";

    return (
        <section id="blog" className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <Reveal>
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('blog.title')}</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        {t('blog.subtitle')}
                    </p>
                </div>
                </Reveal>

                {i18n.language?.startsWith('fr') && (
                <Reveal>
                <div className="mb-8 max-w-2xl mx-auto text-center px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 text-sm">
                    {t('blog.englishOnly')}
                </div>
                </Reveal>
                )}

                {/* Category Filter */}
                <Reveal>
                <div className="flex flex-wrap justify-center gap-2.5 md:gap-3 mb-10 md:mb-12">
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-4 py-2.5 text-sm md:px-6 md:py-3 md:text-base rounded-full font-medium transition-all duration-300 ${
                                selectedCategory === key
                                    ? `${categoryBgColor} text-white border-2 border-white/30`
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border-2 border-transparent'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                </Reveal>

                {/* Featured (Blog Section) */}
                {selectedCategory === 'all' && featuredPost && (
                    <Reveal className="mb-12">
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">{t('blog.featured')}</h3>
                        <Link to={`/blog/${featuredPost.id}`} className="block">
                            <GlassCard className="p-0 md:p-0 group cursor-pointer hover:scale-[1.01] transition-transform duration-300 overflow-hidden">
                                {featuredPost.image && (
                                  <div className="w-full h-48 md:h-60 overflow-hidden">
                                    <img src={featuredPost.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tagColor}`}>
                                        {categories[featuredPost.category] || 'Post'}
                                    </span>
                                    <span className="text-gray-400 text-xs">{featuredPost.readTime} • {formatDate(featuredPost.date, i18n.language)}</span>
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-200 transition-colors duration-300">
                                    {featuredPost.title}
                                </h4>
                                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(featuredPost.tags || []).slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                </div>
                            </GlassCard>
                        </Link>
                    </Reveal>
                )}

                {/* Posts */}
                <div>
                    <Reveal>
                    <h3 className="text-2xl font-bold text-white mb-8 text-center">
                        {selectedCategory === 'all' ? t('blog.blogLabel') : `${categories[selectedCategory]} ${t('blog.articlesLabel')}`}
                    </h3>
                    </Reveal>
                    {error && <div className="text-center text-red-300">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading && Array.from({ length: 6 }, (_, i) => <BlogCardSkeleton key={`skeleton-${i}`} />)}
                        {filteredPosts.map(post => (
                            <Reveal key={post.id}>
                            <Link to={`/blog/${post.id}`} className="block">
                            <GlassCard className="p-0 group cursor-pointer hover:scale-105 transition-transform duration-300 overflow-hidden">
                                {post.image && (
                                  <div className="w-full h-40 overflow-hidden">
                                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tagColor}`}>
                                        {categories[post.category]}
                                    </span>
                                    <span className="text-gray-400 text-xs">{post.readTime}</span>
                                </div>
                                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-gray-200 transition-colors duration-300">
                                    {post.title}
                                </h4>
                                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {post.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">{formatDate(post.date, i18n.language)}</span>
                                    <span className={`text-xs font-medium ${iconColor} group-hover:translate-x-1 transition-transform duration-300`}>
                                        {t('blog.read')}
                                    </span>
                                </div>
                                </div>
                            </GlassCard>
                            </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
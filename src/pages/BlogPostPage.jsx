import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { MarkdownContent } from '../components/ui/MarkdownContent.jsx';
import { ArticleSkeleton } from '../components/ui/Skeleton.jsx';
import { SEO } from '../components/SEO.jsx';
import { useTranslation } from 'react-i18next';
import { setActivePageContext, clearActivePageContext, buildBlogPageContext } from '../utils/chatbotEvents.js';
import { BlogAiExplain } from '../components/BlogAiExplain.jsx';
import { readingTimeMinutes } from '../utils/readingTime.js';
import { LocalizedLink } from '../components/ui/LocalizedLink.jsx';
import { SITE_URL } from '../config/site.js';

// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.

export const BlogPostPage = ({ theme }) => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [related, setRelated] = useState([]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/blog/${id}`);
                if (!res.ok) {
                    throw new Error('Not found');
                }
                const data = await res.json();
                setPost(data.post);
            } catch (e) {
                setError('Post not found');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    // Rank other posts by shared tags (2 pts each) and same category (1 pt)
    useEffect(() => {
        if (!post) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/blog');
                const data = await res.json();
                const posts = Array.isArray(data.posts) ? data.posts : [];
                const myTags = new Set(post.tags || []);
                const scored = posts
                    .filter((p) => p.id !== (post.id || id))
                    .map((p) => {
                        const sharedTags = (p.tags || []).filter((tag) => myTags.has(tag)).length;
                        const sameCategory = p.category && p.category === post.category ? 1 : 0;
                        return { post: p, score: sharedTags * 2 + sameCategory };
                    })
                    .sort((a, b) => b.score - a.score);
                if (!cancelled) setRelated(scored.slice(0, 3).map((s) => s.post));
            } catch {
                // related posts are optional
            }
        })();
        return () => { cancelled = true; };
    }, [post, id]);

    useEffect(() => {
        if (!post) return undefined;
        setActivePageContext(buildBlogPageContext(post, `/blog/${id}`));
        return () => clearActivePageContext();
    }, [post, id]);

    const ogImage = post ? `${SITE_URL}/api/og/${post.id || id}` : undefined;

    if (loading) {
        return (
            <section className="min-h-screen py-32 px-4">
                <ArticleSkeleton />
            </section>
        );
    }

    if (error || !post) {
        return (
            <section className="min-h-screen flex items-center justify-center py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <GlassCard className="p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('blog.notFound')}</h2>
                        <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-emerald-400 hover:underline">{t('blog.backToBlog').replace('← ', '')}</button>
                    </GlassCard>
                </div>
            </section>
        );
    }

    const tagColor = theme === 'pink' ? "bg-pink-500/20 text-pink-300" : "bg-emerald-500/20 text-emerald-300";

    return (
        <section className="min-h-screen flex items-center justify-center py-20 px-4">
            <SEO
                title={`${post.title} — Parjad Minooei`}
                description={post.excerpt || (post.content || '').substring(0, 150)}
                image={ogImage}
                type="article"
            />
            <div className="container mx-auto max-w-3xl">
                <div className="mb-6">
                    <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-gray-300 hover:text-white">{t('blog.backToBlog')}</button>
                </div>
                <GlassCard className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tagColor}`}>{post.category || 'personal'}</span>
                        <span className="text-gray-400 text-xs">{post.readTime || t('blog.minRead', { count: readingTimeMinutes(post.content) })} • {post.date}</span>
                    </div>
                    {post.image && (
                      <div className="w-full h-60 md:h-80 overflow-hidden rounded mb-6">
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h1 className="text-3xl font-bold text-white mb-6">{post.title}</h1>
                    <BlogAiExplain postId={post.id || id} theme={theme} />
                    <MarkdownContent content={post.content} />
                </GlassCard>

                {related.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white mb-6">{t('blog.related')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {related.map((p) => (
                                <LocalizedLink key={p.id} to={`/blog/${p.id}`} className="block">
                                    <GlassCard className="p-5 h-full group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-3 ${tagColor}`}>
                                            {p.category || 'personal'}
                                        </span>
                                        <h3 className="text-sm font-bold text-white mb-2 group-hover:text-gray-200 transition-colors line-clamp-2">
                                            {p.title}
                                        </h3>
                                        <p className="text-gray-400 text-xs line-clamp-3">{p.excerpt}</p>
                                    </GlassCard>
                                </LocalizedLink>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
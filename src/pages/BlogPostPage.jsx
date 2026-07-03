import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route, useParams } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../components/ui/Icons.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { Toast } from '../components/ui/Toast.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Reveal } from '../components/Reveal.jsx';
import { MarkdownContent } from '../components/ui/MarkdownContent.jsx';
import { getAuthToken } from '../utils/auth.jsx';
import { ArticleSkeleton } from '../components/ui/Skeleton.jsx';
import { useTranslation } from 'react-i18next';
import { setActivePageContext, clearActivePageContext, buildBlogPageContext } from '../utils/chatbotEvents.js';
import { BlogAiExplain } from '../components/BlogAiExplain.jsx';

// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.
import ParjadImage from '../Images/Parjad.webp';
import GitHubStats from '../components/GitHubStats.tsx';
import LeetCodeStats from '../components/LeetCodeStats.tsx';
import ParjadM from '../Images/ParjadM.webp';
import Logo from '../Images/Logo.webp';
import CodeQuestImage from '../Images/CodeQuest.webp';
import BinaryGeneratorImage from '../Images/Binary 1010 Generator.webp';
import SpaceShooterImage from '../Images/SpaceShooter.webp';

export const BlogPostPage = ({ theme }) => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        if (post) {
            document.title = `${post.title} — Parjad Minooei`;
            const ogImageUrl = `https://og-image.vercel.app/${encodeURIComponent(post.title)}.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-white.svg`;
            
            const ensureMeta = (property, content) => {
                let el = document.head.querySelector(`meta[property="${property}"]`);
                if (!el) {
                    el = document.createElement('meta');
                    el.setAttribute('property', property);
                    document.head.appendChild(el);
                }
                el.setAttribute('content', content);
            };

            ensureMeta('og:title', post.title);
            ensureMeta('og:description', (post.content || '').substring(0, 150) + '...');
            ensureMeta('og:image', ogImageUrl);
            ensureMeta('twitter:card', 'summary_large_image');
            ensureMeta('twitter:image', ogImageUrl);
        }
    }, [post]);

    useEffect(() => {
        if (!post) return undefined;
        setActivePageContext(buildBlogPageContext(post, `/blog/${id}`));
        return () => clearActivePageContext();
    }, [post, id]);

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
            <div className="container mx-auto max-w-3xl">
                <div className="mb-6">
                    <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-gray-300 hover:text-white">{t('blog.backToBlog')}</button>
                </div>
                <GlassCard className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tagColor}`}>{post.category || 'personal'}</span>
                        <span className="text-gray-400 text-xs">{post.readTime} • {post.date}</span>
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
            </div>
        </section>
    );
};
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
import { formatDate } from '../utils/formatDate.js';
import { extractHeadings } from '../utils/extractHeadings.js';
import { LocalizedLink } from '../components/ui/LocalizedLink.jsx';
import { BlogTableOfContents } from '../components/blog/BlogTableOfContents.jsx';
import { BlogComments } from '../components/blog/BlogComments.jsx';
import { SITE_URL, SITE_NAME } from '../config/site.js';
import { fetchApi } from '../utils/apiClient.js';

export const BlogPostPage = ({ theme }) => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [related, setRelated] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchPost = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchApi(`/api/blog/${id}`, { signal: controller.signal, ttlMs: 30_000 });
                setPost(data.post);
            } catch (err) {
                if (err?.name === 'AbortError') return;
                setError('Post not found');
                setPost(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (!post) return undefined;
        let cancelled = false;
        const controller = new AbortController();
        (async () => {
            try {
                const data = await fetchApi(`/api/blog/${id}/related?limit=3`, {
                    signal: controller.signal,
                });
                if (!cancelled) setRelated(Array.isArray(data.posts) ? data.posts : []);
            } catch {
                if (!cancelled) setRelated([]);
            }
        })();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [post, id]);

    useEffect(() => {
        if (!post) return undefined;
        setActivePageContext(buildBlogPageContext(post, `/blog/${id}`));
        return () => clearActivePageContext();
    }, [post, id]);

    if (loading) {
        return (
            <section className="min-h-screen py-32 px-4">
                <SEO titleKey="blog.seoTitle" descriptionKey="blog.seoDesc" noindex canonicalPath={`/blog/${id}`} englishOnly />
                <ArticleSkeleton />
            </section>
        );
    }

    if (error || !post) {
        return (
            <section className="min-h-screen flex items-center justify-center py-20 px-4">
                <SEO titleKey="seo.notFoundTitle" descriptionKey="seo.notFoundDesc" noindex canonicalPath={`/blog/${id}`} englishOnly />
                <div className="container mx-auto max-w-3xl text-center">
                    <GlassCard className="p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('blog.notFound')}</h2>
                        <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-emerald-400 hover:underline">{t('blog.backToBlog').replace('← ', '')}</button>
                    </GlassCard>
                </div>
            </section>
        );
    }

    const tagColor = theme === 'pink' ? 'bg-pink-500/20 text-pink-300' : 'bg-emerald-500/20 text-emerald-300';
    const ogImage = `${SITE_URL}/api/og/${post.id || id}`;
    const headings = extractHeadings(post.content);
    const readMins = readingTimeMinutes(post.content);

    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt || post.content?.slice(0, 160),
            image: ogImage,
            datePublished: post.date,
            dateModified: post.updatedAt || post.date,
            author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
            publisher: { '@type': 'Person', name: SITE_NAME },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.id || id}` },
            keywords: (post.tags || []).join(', '),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
                { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}/blog/${post.id || id}` },
            ],
        },
    ];

    return (
        <section className="min-h-screen flex items-center justify-center py-20 px-4">
            <SEO
                title={`${post.title} — Parjad Minooei`}
                description={post.excerpt || post.content?.substring(0, 150)}
                image={ogImage}
                type="article"
                jsonLd={jsonLd}
                englishOnly
                canonicalPath={`/blog/${id}`}
            />
            <div className="container mx-auto max-w-5xl">
                <div className="mb-6">
                    <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-gray-300 hover:text-white">{t('blog.backToBlog')}</button>
                </div>

                <div className="lg:grid lg:grid-cols-[minmax(0,200px)_1fr] lg:gap-10">
                    <aside className="hidden lg:block">
                        <BlogTableOfContents headings={headings} theme={theme} mode="sidebar" />
                    </aside>

                    <div>
                        <GlassCard className="p-8">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tagColor}`}>{post.category || 'personal'}</span>
                                <span className="text-gray-400 text-xs">{post.readTime || t('blog.minRead', { count: readMins })} • {formatDate(post.date, i18n.language)}</span>
                            </div>
                            {post.image && (
                                <div className="w-full rounded mb-6 bg-black/20 overflow-hidden flex items-center justify-center">
                                    <img
                                      src={post.image}
                                      alt=""
                                      className="w-full h-auto max-h-[32rem] object-contain"
                                    />
                                </div>
                            )}
                            <h1 className="text-3xl font-bold text-white mb-6">{post.title}</h1>
                            <BlogTableOfContents headings={headings} theme={theme} mode="mobile" />
                            <BlogAiExplain postId={post.id || id} theme={theme} />
                            <MarkdownContent content={post.content} withHeadingIds />
                        </GlassCard>

                        <BlogComments postId={post.id || id} />

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
                </div>
            </div>
        </section>
    );
};

export default BlogPostPage;

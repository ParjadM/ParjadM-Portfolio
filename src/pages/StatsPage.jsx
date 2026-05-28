import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Routes, Route, useParams } from 'react-router-dom';
import { Mail, Github, Linkedin, Code, BrainCircuit, Palette, Menu, Sun, Moon } from '../components/ui/Icons.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { MarkdownContent } from '../components/ui/MarkdownContent.jsx';
import GitHubStats from '../components/GitHubStats.tsx';
import LeetCodeStats from '../components/LeetCodeStats.tsx';
import { ClickUpSection } from '../components/ClickUpSection.jsx';
import { getAuthToken } from '../utils/auth.jsx';

export const StatsPage = ({ theme }) => {
  return (
    <section id="stats" className="min-h-screen flex items-center justify-center py-24 px-4">
      <div className="container mx-auto max-w-6xl w-full">
        {/* Header */}
        <Reveal>
        <div className="mb-10">
          <GlassCard className="p-8 md:p-10" theme={theme}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Developer Stats</h1>
                <p className="mt-2 text-gray-300 max-w-2xl">A quick snapshot of my open‑source presence and coding practice, updated automatically with caching for fast loads.</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${theme === 'pink' ? 'bg-pink-500/20 text-pink-200' : 'bg-emerald-500/20 text-emerald-200'}`}>Auto‑refreshed</div>
            </div>
          </GlassCard>
        </div>
        </Reveal>

        {/* Stats Grid */}
        <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <GitHubStats theme={theme} />
          <LeetCodeStats theme={theme} />
        </div>
        </Reveal>

        {/* ClickUp - fun interactive game */}
        <Reveal>
        <div className="mt-8">
          <ClickUpSection theme={theme} />
        </div>
        </Reveal>

        {/* Footer note */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          Data via GitHub API & LeetCode GraphQL • Cached to improve performance
        </div>
      </div>
    </section>
  );
};

export const SkillsSection = ({ theme }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [hoveredSkill, setHoveredSkill] = useState(null);

    const skillCategories = {
        'all': 'All Skills',
        'frontend': 'Frontend',
        'backend': 'Backend',
        'tools': 'Tools & Others'
    };

    const skills = [
        { 
            name: "JavaScript (ES6+)", 
            icon: <Code/>, 
            category: 'frontend',
            level: 90,
            description: "Modern JavaScript with ES6+ features, async programming, and DOM manipulation",
            years: "3+ years"
        },
        { 
            name: "React", 
            icon: <Code/>, 
            category: 'frontend',
            level: 85,
            description: "Building dynamic user interfaces with hooks, context, and component architecture",
            years: "2+ years"
        },
        { 
            name: "Node.js", 
            icon: <Code/>, 
            category: 'backend',
            level: 80,
            description: "Server-side JavaScript development with Express and RESTful APIs",
            years: "2+ years"
        },
        { 
            name: "Python", 
            icon: <Code/>, 
            category: 'backend',
            level: 75,
            description: "Data analysis, automation scripts, and backend development",
            years: "2+ years"
        },
        { 
            name: "HTML & CSS", 
            icon: <Code/>, 
            category: 'frontend',
            level: 95,
            description: "Semantic markup, responsive design, and modern CSS techniques",
            years: "3+ years"
        },
        { 
            name: "Tailwind CSS", 
            icon: <Code/>, 
            category: 'frontend',
            level: 90,
            description: "Utility-first CSS framework for rapid UI development",
            years: "2+ years"
        },
        { 
            name: "SQL & NoSQL", 
            icon: <Code/>, 
            category: 'backend',
            level: 70,
            description: "Database design, queries, and data modeling with MySQL and MongoDB",
            years: "1+ years"
        },
        { 
            name: "Git & GitHub", 
            icon: <Github/>, 
            category: 'tools',
            level: 85,
            description: "Version control, collaborative development, and project management",
            years: "3+ years"
        },
        { 
            name: "Problem Solving", 
            icon: <BrainCircuit/>, 
            category: 'tools',
            level: 95,
            description: "Algorithm design, debugging, and systematic approach to complex challenges",
            years: "5+ years"
        },
    ];

    const filteredSkills = selectedCategory === 'all' 
        ? skills 
        : skills.filter(skill => skill.category === selectedCategory);

    const iconColor = theme === 'pink' ? "text-pink-400" : "text-emerald-400";
    const progressColor = theme === 'pink' ? "bg-pink-500" : "bg-emerald-500";
    const categoryBgColor = theme === 'pink' ? "bg-pink-500/20" : "bg-emerald-500/20";

    return(
        <section id="skills" className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <Reveal>
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Technical Skills</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        A comprehensive overview of my technical expertise and proficiency levels
                    </p>
                </div>
                </Reveal>

                {/* Category Filter */}
                <Reveal>
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {Object.entries(skillCategories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
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

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSkills.map((skill, index) => (
                        <Reveal key={skill.name}>
                        <GlassCard 
                            className="p-6 relative overflow-hidden group cursor-pointer"
                            onMouseEnter={() => setHoveredSkill(skill.name)}
                            onMouseLeave={() => setHoveredSkill(null)}
                        >
                            {/* Skill Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 ${iconColor}`}>
                                        {React.cloneElement(skill.icon, { size: 24 })}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{skill.name}</h3>
                                        <p className="text-gray-400 text-sm">{skill.years}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-300">Proficiency</span>
                                    <span className="text-sm font-medium text-white">{skill.level}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-1000 ${progressColor}`}
                                        style={{ width: `${skill.level}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {skill.description}
                            </p>

                            {/* Hover Effect Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme === 'pink' ? 'from-pink-500/10' : 'from-emerald-500/10'}`}></div>
                        </GlassCard>
                        </Reveal>
                    ))}
                </div>

                {/* Skills Summary */}
                <Reveal className="mt-8">
                <div>
                    <GlassCard className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                            <div>
                                <div className={`text-4xl font-bold mb-2 ${iconColor}`}>
                                    {skills.length}+
                                </div>
                                <div className="text-gray-300">Technologies</div>
                            </div>
                            <div>
                                <div className={`text-4xl font-bold mb-2 ${iconColor}`}>
                                    3+
                                </div>
                                <div className="text-gray-300">Years Experience</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
                </Reveal>
            </div>
        </section>
    );
};

export const BlogSection = ({ theme }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const categories = {
        'all': 'All Posts',
        'technology': 'Technology',
        'tutorial': 'Tutorials',
        'personal': 'Personal'
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blog');
                const data = await res.json();
                setPosts(Array.isArray(data.posts) ? data.posts : []);
            } catch (e) {
                setError('Failed to load posts');
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
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog & Articles</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                        Thoughts, tutorials, and insights about technology, development, and my journey in tech
                    </p>
                </div>
                </Reveal>

                {/* Category Filter */}
                <Reveal>
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
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
                        <h3 className="text-2xl font-bold text-white mb-6 text-center">Featured</h3>
                        <Link to={`/blog/${featuredPost.id}`} className="block">
                            <GlassCard className="p-0 md:p-0 group cursor-pointer hover:scale-[1.01] transition-transform duration-300 overflow-hidden">
                                {featuredPost.image && (
                                  <div className="w-full h-56 md:h-72 overflow-hidden">
                                    <img src={featuredPost.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tagColor}`}>
                                        {categories[featuredPost.category] || 'Post'}
                                    </span>
                                    <span className="text-gray-400 text-xs">{featuredPost.readTime} • {featuredPost.date}</span>
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
                        {selectedCategory === 'all' ? 'Blog' : `${categories[selectedCategory]} Articles`}
                    </h3>
                    </Reveal>
                    {loading && <div className="text-center text-gray-300">Loading...</div>}
                    {error && <div className="text-center text-red-300">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    <span className="text-gray-400 text-xs">{post.date}</span>
                                    <span className={`text-xs font-medium ${iconColor} group-hover:translate-x-1 transition-transform duration-300`}>
                                        Read →
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

export const BlogPostPage = ({ theme }) => {
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

    if (loading) {
        return (
            <section className="min-h-screen flex items-center justify-center py-20 px-4">
                <div className="text-gray-300">Loading...</div>
            </section>
        );
    }

    if (error || !post) {
        return (
            <section className="min-h-screen flex items-center justify-center py-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <GlassCard className="p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
                        <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-emerald-400 hover:underline">Back to Blog</button>
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
                    <button type="button" onClick={() => navigate('/blog', { replace: true })} className="text-gray-300 hover:text-white">← Back to Blog</button>
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
                    <MarkdownContent content={post.content} />
                </GlassCard>
            </div>
        </section>
    );
};


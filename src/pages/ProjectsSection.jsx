import React from 'react';
import { Github } from '../components/ui/Icons.jsx';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { Reveal } from '../components/Reveal.jsx';
import { useTranslation } from 'react-i18next';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { useFetchWithCache } from '../utils/useFetchWithCache.js';
import { ProjectAskAi } from '../components/ProjectAskAi.jsx';
import { ProjectCardSkeleton } from '../components/ui/Skeleton.jsx';
import { BlurImage } from '../components/ui/BlurImage.jsx';
import placeholders from '../data/imagePlaceholders.json';
// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.
import CodeQuestImage from '../Images/CodeQuest.webp';
import BinaryGeneratorImage from '../Images/Binary 1010 Generator.webp';
import SpaceShooterImage from '../Images/SpaceShooter.webp';
import CodeQuestImageSm from '../Images/CodeQuest-sm.webp';
import BinaryGeneratorImageSm from '../Images/Binary 1010 Generator-sm.webp';
import SpaceShooterImageSm from '../Images/SpaceShooter-sm.webp';

export const ProjectsSection = ({ theme }) => {
    const { t } = useTranslation();
    const { data, isLoading: loading, error: fetchError } = useFetchWithCache('/api/projects');
    const projects = Array.isArray(data?.projects) ? data.projects : [];
    const error = fetchError ? t('projects.error') : '';

    // Map known titles to local images to keep visuals after API switch
    const imageMap = {
        'CodeQuest': CodeQuestImage,
        'Binary 1010 Generator': BinaryGeneratorImage,
        'SpaceShooter': SpaceShooterImage,
    };
    // Phone-sized variants served via srcset so mobile doesn't download 1280px images
    const imageMapSm = {
        'CodeQuest': CodeQuestImageSm,
        'Binary 1010 Generator': BinaryGeneratorImageSm,
        'SpaceShooter': SpaceShooterImageSm,
    };

    const tagClasses = theme === 'pink'
        ? "bg-pink-500/20 text-pink-300"
        : "bg-emerald-500/20 text-emerald-300";

    return (
        <PageTransition className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <SEO 
                title="Projects — Parjad Minooei"
                description="Selected projects with code and live demos."
            />
            <Reveal>
            <h2 className="text-4xl font-bold text-white mb-12 text-center">{t('projects.title')}</h2>
            </Reveal>
            {error && <div className="text-red-300 mb-4">{error}</div>}
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && Array.from({ length: 6 }, (_, i) => <ProjectCardSkeleton key={`skeleton-${i}`} />)}
                {projects.map((project) => (
                    <Reveal key={project.id || project.title}>
                    <GlassCard className="p-0 flex flex-col overflow-hidden">
                        {/* Project Image */}
                        <div className="w-full h-48 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden">
                            <BlurImage
                                src={project.image || imageMap[project.title] || `https://placehold.co/600x400/${theme === 'pink' ? 'E94560' : '10B981'}/FFFFFF?text=${encodeURIComponent(project.title)}`}
                                srcSet={!project.image && imageMapSm[project.title]
                                    ? `${imageMapSm[project.title]} 640w, ${imageMap[project.title]} 1280w`
                                    : undefined}
                                sizes={!project.image && imageMapSm[project.title]
                                    ? '(max-width: 768px) 100vw, 33vw'
                                    : undefined}
                                alt={project.title}
                                placeholder={placeholders[project.title]}
                                wrapperClassName="w-full h-full"
                                className="opacity-100 md:opacity-80 md:hover:opacity-100 hover:scale-105 transition-all duration-300"
                            />
                        </div>
                        
                        <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(project.tags || []).map(tag => <span key={tag} className={`${tagClasses} text-xs font-semibold px-2.5 py-1 rounded-full`}>{tag}</span>)}
                        </div>
                        <p className="text-gray-300 mb-6 flex-grow">{project.description}</p>
                        <div className="flex items-center justify-between mt-auto gap-3">
                          <ProjectAskAi project={project} theme={theme} />
                          <div className="flex space-x-4">
                           {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110"><Github size={24} /></a>}
                           {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                           </a>}
                          </div>
                            </div>
                        </div>
                    </GlassCard>
                    </Reveal>
                ))}
                {!loading && projects.length === 0 && (
                    <div className="col-span-full text-center text-gray-400">{t('projects.empty')}</div>
                )}
                </div>
            </div>
        </PageTransition>
    );
};
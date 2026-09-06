import React, { useState } from 'react';
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
import { LocalizedLink } from '../components/ui/LocalizedLink.jsx';
import { GRID_PAGE_SIZE, Pagination } from '../components/ui/Pagination.jsx';
import { getAccent } from '../utils/themeTokens.js';
import placeholders from '../data/imagePlaceholders.json';
import CodeQuestImage from '../Images/CodeQuest.webp';
import BinaryGeneratorImage from '../Images/Binary 1010 Generator.webp';
import SpaceShooterImage from '../Images/SpaceShooter.webp';
import CodeQuestImageSm from '../Images/CodeQuest-sm.webp';
import BinaryGeneratorImageSm from '../Images/Binary 1010 Generator-sm.webp';
import SpaceShooterImageSm from '../Images/SpaceShooter-sm.webp';

function isInternalAppPath(url) {
    return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
}

export const ProjectsSection = ({ theme }) => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const listUrl = `/api/projects?page=${page}&limit=${GRID_PAGE_SIZE}`;
    const { data, isLoading: loading, error: fetchError } = useFetchWithCache(listUrl);
    const projects = Array.isArray(data?.projects) ? data.projects : [];
    const totalItems = data?.pagination?.totalItems ?? projects.length;
    const error = fetchError ? t('projects.error') : '';
    const pageProjects = projects;

    const imageMap = {
        'CodeQuest': CodeQuestImage,
        'Binary 1010 Generator': BinaryGeneratorImage,
        'SpaceShooter': SpaceShooterImage,
    };
    const imageMapSm = {
        'CodeQuest': CodeQuestImageSm,
        'Binary 1010 Generator': BinaryGeneratorImageSm,
        'SpaceShooter': SpaceShooterImageSm,
    };

    const accent = getAccent(theme);
    const tagClasses = accent.tag;

    return (
        <PageTransition className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
            <SEO 
                titleKey="seo.projectsTitle"
                descriptionKey="seo.projectsDesc"
            />
            <Reveal>
            <h2 className="text-4xl font-bold text-white mb-8 md:mb-12 text-center">{t('projects.title')}</h2>
            </Reveal>
            {error && <div className="text-red-300 mb-4">{error}</div>}
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && Array.from({ length: 6 }, (_, i) => <ProjectCardSkeleton key={`skeleton-${i}`} />)}
                {pageProjects.map((project) => (
                    <Reveal key={project.id || project.title} className="h-full">
                    <GlassCard className="p-0 flex flex-col overflow-hidden h-full">
                        <div className="w-full aspect-video bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden relative">
                            <BlurImage
                                src={project.image || imageMap[project.title] || `https://placehold.co/600x400/${accent.hexPlaceholder}/FFFFFF?text=${encodeURIComponent(project.title)}`}
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
                            <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        
                        <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[1.75rem]">
                            {(project.tags || []).map(tag => <span key={tag} className={`${tagClasses} text-xs font-semibold px-2.5 py-1 rounded-full`}>{tag}</span>)}
                        </div>
                        <p className="text-gray-300 mb-6 flex-grow line-clamp-4" title={project.description}>{project.description}</p>
                        <div className="project-actions flex flex-wrap items-center justify-between mt-auto gap-3">
                          <ProjectAskAi project={project} theme={theme} />
                          <div className="flex space-x-4">
                           {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110" aria-label={`${project.title} on GitHub`}><Github size={24} /></a>}
                           {project.liveUrl && (
                             isInternalAppPath(project.liveUrl) ? (
                               <LocalizedLink
                                 to={project.liveUrl}
                                 className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110"
                                 aria-label={`Open ${project.title}`}
                               >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                               </LocalizedLink>
                             ) : (
                               <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-transform duration-300 hover:scale-110" aria-label={`${project.title} live demo`}>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                               </a>
                             )
                           )}
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
                {!loading && totalItems > 0 && (
                  <Pagination
                    page={page}
                    totalItems={totalItems}
                    pageSize={GRID_PAGE_SIZE}
                    onChange={setPage}
                    theme={theme}
                    prevLabel={t('pagination.prev')}
                    nextLabel={t('pagination.next')}
                    pageLabel={t('pagination.status')}
                  />
                )}
            </div>
        </PageTransition>
    );
};

export default ProjectsSection;

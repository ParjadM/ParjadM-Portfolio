import React from 'react';

/** Base shimmer block. Size it with className (w-*, h-*). */
export const Skeleton = ({ className = '' }) => (
    <div aria-hidden="true" className={`animate-pulse rounded-md bg-white/10 ${className}`} />
);

/** Card-shaped placeholder matching blog post cards (image, tag, title, excerpt). */
export const BlogCardSkeleton = () => (
    <div aria-hidden="true" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <Skeleton className="w-full h-40 !rounded-none" />
        <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 !rounded-full" />
                <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-5 w-16" />
            </div>
        </div>
    </div>
);

/** Card-shaped placeholder matching project cards (tall image, title, text, chips). */
export const ProjectCardSkeleton = () => (
    <div aria-hidden="true" className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <Skeleton className="w-full h-48 !rounded-none" />
        <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 !rounded-full" />
                <Skeleton className="h-6 w-20 !rounded-full" />
                <Skeleton className="h-6 w-14 !rounded-full" />
            </div>
        </div>
    </div>
);

/** Placeholder for the GitHub/LeetCode stat panels (header row + stat tiles). */
export const StatsPanelSkeleton = () => (
    <div aria-hidden="true" className="w-full space-y-4">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 !rounded-full" />
            <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full !rounded-xl" />
            <Skeleton className="h-16 w-full !rounded-xl" />
            <Skeleton className="h-16 w-full !rounded-xl" />
            <Skeleton className="h-16 w-full !rounded-xl" />
        </div>
        <Skeleton className="h-3 w-2/3" />
    </div>
);

/** Full-width article placeholder for the blog post page. */
export const ArticleSkeleton = () => (
    <div aria-hidden="true" className="w-full max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <div className="flex gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="w-full h-64 !rounded-2xl" />
        <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    </div>
);

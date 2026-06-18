import React from 'react';

export const BackgroundBlobs = ({ theme, darkMode = true, customBlobClasses, reducedMotion = false }) => {
    const pinkThemeClasses = darkMode
        ? { blob1: "bg-pink-500/30", blob2: "bg-red-500/30", blob3: "bg-purple-500/20" }
        : { blob1: "bg-pink-400/20", blob2: "bg-red-400/20", blob3: "bg-purple-400/15" };
    const greenThemeClasses = darkMode
        ? { blob1: "bg-emerald-500/30", blob2: "bg-teal-500/30", blob3: "bg-cyan-500/20" }
        : { blob1: "bg-emerald-400/25", blob2: "bg-teal-400/25", blob3: "bg-cyan-400/20" };
    const themeClasses = customBlobClasses || (theme === 'green' || theme === 'emerald' ? greenThemeClasses : pinkThemeClasses);
    const animClass = reducedMotion ? '' : 'animate-blob';

    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full filter blur-3xl opacity-50 ${animClass} ${themeClasses.blob1}`}></div>
            <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full filter blur-3xl opacity-50 ${animClass} ${reducedMotion ? '' : 'animation-delay-2000'} ${themeClasses.blob2}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full filter blur-3xl opacity-50 ${animClass} ${reducedMotion ? '' : 'animation-delay-4000'} ${themeClasses.blob3}`}></div>
        </div>
    );
};

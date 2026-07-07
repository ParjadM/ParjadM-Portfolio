import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const REPO = import.meta.env.VITE_GISCUS_REPO;
const REPO_ID = import.meta.env.VITE_GISCUS_REPO_ID;
const CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID;

export const BlogComments = ({ postId }) => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);

  const configured = REPO && REPO_ID && CATEGORY_ID;

  useEffect(() => {
    if (!configured || !containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.setAttribute('data-repo', REPO);
    script.setAttribute('data-repo-id', REPO_ID);
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', CATEGORY_ID);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'dark_dimmed');
    script.setAttribute('data-lang', i18n.language?.startsWith('fr') ? 'fr' : 'en');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('crossorigin', 'anonymous');

    containerRef.current.appendChild(script);
  }, [configured, postId, i18n.language]);

  if (!configured) return null;

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <h2 className="text-xl font-bold text-white mb-6">{t('blog.comments')}</h2>
      <div ref={containerRef} className="giscus min-h-[200px]" />
    </section>
  );
};

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL, SITE_NAME } from '../config/site.js';

export const SEO = ({ 
    title = `${SITE_NAME} — Software Engineer Portfolio`, 
    description = 'Software Engineer building beautiful, fast, user-centric web apps.', 
    name = SITE_NAME, 
    type = 'website',
    image = `${SITE_URL}/og-image.jpg`,
    url,
}) => {
    const location = useLocation();
    const pathname = location?.pathname || '/';
    const canonical = url ?? `${SITE_URL}${pathname === '/' ? '' : pathname}`;
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            <link rel="canonical" href={canonical} />
            <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} Blog RSS`} href={`${SITE_URL}/feed.xml`} />
            {/* End standard metadata tags */}
            
            {/* Facebook / OpenGraph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonical} />
            <meta property="og:site_name" content={name} />
            {/* End Facebook tags */}
            
            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            {/* End Twitter tags */}
        </Helmet>
    );
};

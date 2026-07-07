import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SITE_URL, SITE_NAME } from '../config/site.js';
import { getLocaleFromPath, localizePath, stripLocalePrefix } from '../utils/i18nRouting.js';

export const SEO = ({
    title,
    description,
    name = SITE_NAME,
    type = 'website',
    image = `${SITE_URL}/og-image.jpg`,
    url,
    jsonLd,
}) => {
    const location = useLocation();
    const { t } = useTranslation();
    const locale = getLocaleFromPath(location.pathname);
    const strippedPath = stripLocalePrefix(location.pathname);
    const pathname = strippedPath || '/';
    const canonical = url ?? `${SITE_URL}${locale === 'fr' ? localizePath(pathname, 'fr') : pathname === '/' ? '' : pathname}`;
    const enUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
    const frUrl = `${SITE_URL}${localizePath(pathname, 'fr')}`;

    const resolvedTitle = title || t('seo.defaultTitle');
    const resolvedDescription = description || t('seo.defaultDesc');

    return (
        <Helmet>
            <html lang={locale === 'fr' ? 'fr-CA' : 'en'} />
            <title>{resolvedTitle}</title>
            <meta name='description' content={resolvedDescription} />
            <link rel="canonical" href={canonical} />
            <link rel="alternate" hrefLang="en" href={enUrl} />
            <link rel="alternate" hrefLang="fr-CA" href={frUrl} />
            <link rel="alternate" hrefLang="x-default" href={enUrl} />
            <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} Blog RSS`} href={`${SITE_URL}/feed.xml`} />

            <meta property="og:type" content={type} />
            <meta property="og:locale" content={locale === 'fr' ? 'fr_CA' : 'en_US'} />
            <meta property="og:title" content={resolvedTitle} />
            <meta property="og:description" content={resolvedDescription} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonical} />
            <meta property="og:site_name" content={name} />

            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={resolvedTitle} />
            <meta name="twitter:description" content={resolvedDescription} />
            <meta name="twitter:image" content={image} />
            {jsonLd && (
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            )}
        </Helmet>
    );
};

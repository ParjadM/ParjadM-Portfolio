import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SITE_URL, SITE_NAME } from '../config/site.js'
import { getLocaleFromPath, localizePath, stripLocalePrefix } from '../utils/i18nRouting.js'
import { getRouteMeta } from '../config/publicRoutes.js'

function normalizeCanonical(url) {
  if (!url) return `${SITE_URL}/`
  // Prefer trailing slash only for the site root.
  if (url === SITE_URL || url === `${SITE_URL}/`) return `${SITE_URL}/`
  return url.replace(/\/$/, '')
}

export const SEO = ({
  title,
  description,
  titleKey,
  descriptionKey,
  name = SITE_NAME,
  type = 'website',
  image = `${SITE_URL}/og-image.jpg`,
  /** Locale-agnostic path like `/about`. Prefer this over hardcoded absolute English URLs. */
  canonicalPath,
  url,
  jsonLd,
  noindex = false,
  /** When true, do not advertise a French alternate (English-only content). */
  englishOnly = false,
}) => {
  const location = useLocation()
  const { t } = useTranslation()
  const locale = getLocaleFromPath(location.pathname)
  const strippedPath = stripLocalePrefix(location.pathname)
  const pathname = strippedPath || '/'
  const routeMeta = getRouteMeta(pathname)

  const resolvedTitle =
    title
    || (titleKey && t(titleKey))
    || (routeMeta?.titleKey && t(routeMeta.titleKey))
    || t('seo.defaultTitle')
  const resolvedDescription =
    description
    || (descriptionKey && t(descriptionKey))
    || (routeMeta?.descriptionKey && t(routeMeta.descriptionKey))
    || t('seo.defaultDesc')

  const pathForCanonical = canonicalPath || pathname
  const enUrl = normalizeCanonical(`${SITE_URL}${pathForCanonical === '/' ? '/' : pathForCanonical}`)
  const frUrl = normalizeCanonical(`${SITE_URL}${localizePath(pathForCanonical, 'fr')}`)
  const canonical = url
    ? normalizeCanonical(url)
    : normalizeCanonical(locale === 'fr' && !englishOnly ? frUrl : enUrl)

  return (
    <Helmet>
      <html lang={locale === 'fr' ? 'fr-CA' : 'en'} />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {(noindex || routeMeta?.indexable === false) && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      {!englishOnly && <link rel="alternate" hrefLang="fr-CA" href={frUrl} />}
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${SITE_NAME} Blog RSS`}
        href={`${SITE_URL}/feed.xml`}
      />

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
  )
}

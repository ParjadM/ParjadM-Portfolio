import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizePath } from '../../utils/i18nRouting.js';

export function LocalizedLink({ to, children, ...props }) {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith('fr') ? 'fr' : 'en';
  const href = localizePath(to, locale);

  return (
    // viewTransition enables the browser View Transitions API cross-fade on
    // supporting browsers (progressive enhancement, no-op elsewhere).
    <Link to={href} viewTransition {...props}>
      {children}
    </Link>
  );
}

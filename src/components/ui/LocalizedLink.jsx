import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localizePath } from '../../utils/i18nRouting.js';

export function LocalizedLink({ to, children, ...props }) {
  const { i18n } = useTranslation();
  const locale = i18n.language?.startsWith('fr') ? 'fr' : 'en';
  const href = localizePath(to, locale);

  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  );
}

import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEO = ({ 
    title = 'Parjad Minooei — Software Engineer Portfolio', 
    description = 'Software Engineer building beautiful, fast, user-centric web apps.', 
    name = 'Parjad Minooei', 
    type = 'website',
    image = 'https://parjadm.ca/og-image.jpg',
    url = 'https://parjadm.ca'
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            {/* End standard metadata tags */}
            
            {/* Facebook / OpenGraph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
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

import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
    url?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = 'ComMarília - Notícias de Marília e Região em formato de Stories.',
    image = '/logo-commarilia.png', // Fallback image if not provided
    type = 'website',
    url = typeof window !== 'undefined' ? window.location.href : '',
}) => {
    const siteTitle = 'ComMarília';
    const finalTitle = title === siteTitle ? title : `${title} - ${siteTitle}`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{finalTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;

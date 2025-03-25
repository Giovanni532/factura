type Props = {
    type: string;
    data: Record<string, any>;
};

export default function JsonLd({ type, data }: Props) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

// Example usage for organization:
export function OrganizationJsonLd() {
    return (
        <JsonLd
            type="Organization"
            data={{
                name: 'Your Company Name',
                url: 'https://yourdomain.com',
                logo: 'https://yourdomain.com/logo.png',
                sameAs: [
                    'https://www.facebook.com/yourcompany',
                    'https://www.twitter.com/yourcompany',
                    'https://www.linkedin.com/company/yourcompany',
                ],
            }}
        />
    );
}

// Example usage for website:
export function WebsiteJsonLd() {
    return (
        <JsonLd
            type="WebSite"
            data={{
                name: 'Your Website Name',
                url: 'https://yourdomain.com',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://yourdomain.com/search?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                },
            }}
        />
    );
}

// Example usage for local business:
export function LocalBusinessJsonLd() {
    return (
        <JsonLd
            type="LocalBusiness"
            data={{
                name: 'Your Business Name',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: '123 Main St',
                    addressLocality: 'City',
                    addressRegion: 'State',
                    postalCode: '12345',
                    addressCountry: 'Country',
                },
                telephone: '+1-123-456-7890',
                openingHours: ['Mo-Fr 09:00-17:00', 'Sa 09:00-13:00'],
            }}
        />
    );
} 
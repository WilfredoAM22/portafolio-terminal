import {socialLinks} from '../data/socialLinks.js';

const icons = {
    github: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="6" cy="5" r="2.5"/>
            <circle cx="6" cy="19" r="2.5"/>
            <circle cx="18" cy="8" r="2.5"/>
            <path d="M6 7.5v9"/>
            <path d="M18 10.5c0 3.2-2.4 5-6 5H6"/>
        </svg>
    ),
    linkedin: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <path d="M8 10.5V16"/>
            <path d="M8 7.8v.01"/>
            <path d="M12 16v-5.5"/>
            <path d="M12 13c0-1.7 1.2-2.7 2.7-2.7S17.4 11.3 17.4 13V16"/>
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2.5" y="5.5" width="19" height="13" rx="4"/>
            <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>
        </svg>
    ),
    instagram: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <path d="M17.3 6.7h.01"/>
        </svg>
    ),
};

export default function SocialLinks() {
    return (
        <nav className="Portfolio-channels" aria-label="Redes sociales">
            {socialLinks.map(({nombre, url, icon}) => (
                <a key={nombre} href={url} target="_blank" rel="noopener noreferrer">
                    {icons[icon]}
                    <span>{nombre}</span>
                </a>
            ))}
        </nav>
    );
}

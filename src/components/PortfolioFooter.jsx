import {useEffect, useRef} from 'react';
import SocialLinks from './SocialLinks.jsx';

const currentYear = new Date().getFullYear();

export default function PortfolioFooter({scrollRequest}) {
    const footerRef = useRef(null);

    useEffect(() => {
        if (scrollRequest === 0) {
            return;
        }

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        footerRef.current?.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
        });
    }, [scrollRequest]);

    return (
        <footer className="Portfolio-footer" id="portfolio-footer" ref={footerRef}>
            <h2>Contacto</h2>
            <p>Encuéntrame también en estas plataformas:</p>
            <SocialLinks/>
            <p className="Portfolio-attribution">
                Wilfredo Alexis Mariano · {currentYear} · MadebyWilfrd
                <span className="Portfolio-footer-mascot" aria-hidden="true">
            <svg
                width="24"
                height="24"
                viewBox="0 0 64 64"
                fill="none"
            >
                <g
                    className="Portfolio-footer-steam"
                    stroke="#7fa3b3"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M24 20c-3-3 3-5 0-9" />
                    <path d="M34 20c-3-3 3-5 0-9" />
                </g>

                <g
                    stroke="#F89820"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path
                        d="M12 26h32v14a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12z"
                        fill="#F89820"
                        fillOpacity=".14"
                    />
                    <path d="M44 30h4a6 6 0 0 1 0 12h-4" />
                    <path d="M8 57h40" />
                </g>

                <g fill="#F89820" fillOpacity=".35">
                    <circle cx="17.5" cy="40" r="2" />
                    <circle cx="38.5" cy="40" r="2" />
                </g>

                <g
                    stroke="#cfeaf5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 34v3" />
                    <path d="M34 34v3" />
                    <path strokeWidth="2.5" d="M25.5 42q2.5 2 5 0" />
                </g>
            </svg>
        </span>
                <span className="Portfolio-footer-cursor" aria-hidden="true" />
            </p>
        </footer>

    );
}

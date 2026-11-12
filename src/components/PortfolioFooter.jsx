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
                Wilfredo Alexis Mariano · {currentYear} · Hecho con React
                <span className="Portfolio-footer-cursor" aria-hidden="true"/>
            </p>
        </footer>
    );
}

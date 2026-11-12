import {useEffect, useState} from 'react';
import Terminal from "./components/Terminal/Terminal.jsx";
import {activarAudio} from './components/Terminal/sonido.js';
import './components/styles/terminal.css';

const canales = [
    {
        nombre: 'GitHub',
        url: 'https://github.com/WilfredoAM22',
        Icono: () => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="6" cy="5" r="2.5"/>
                <circle cx="6" cy="19" r="2.5"/>
                <circle cx="18" cy="8" r="2.5"/>
                <path d="M6 7.5v9"/>
                <path d="M18 10.5c0 3.2-2.4 5-6 5H6"/>
            </svg>
        ),
    },
    {
        nombre: 'LinkedIn',
        url: 'https://www.linkedin.com/in/wilfredo-alexis-mariano-78567a418/',
        Icono: () => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M8 10.5V16"/>
                <path d="M8 7.8v.01"/>
                <path d="M12 16v-5.5"/>
                <path d="M12 13c0-1.7 1.2-2.7 2.7-2.7S17.4 11.3 17.4 13V16"/>
            </svg>
        ),
    },
    {
        nombre: 'YouTube',
        url: 'https://www.youtube.com/channel/UCsSp2du1ted-DqlXVn-tPOw',
        Icono: () => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="5.5" width="19" height="13" rx="4"/>
                <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>
            </svg>
        ),
    },
    {
        nombre: 'Instagram',
        url: 'https://www.instagram.com/madebywilfrd/?hl=es',
        Icono: () => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <path d="M17.3 6.7h.01"/>
            </svg>
        ),
    },
];

const App = () => {
    const soundEnabled = true;
    const [showFooter, setShowFooter] = useState(false);
    const [footerRequestCount, setFooterRequestCount] = useState(0);

    useEffect(() => {
        if (!soundEnabled) {
            return undefined;
        }

        const resumeAudio = async () => {
            await activarAudio();
            window.removeEventListener('pointerdown', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
        };

        window.addEventListener('pointerdown', resumeAudio);
        window.addEventListener('keydown', resumeAudio);

        return () => {
            window.removeEventListener('pointerdown', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
        };
    }, [soundEnabled]);

    useEffect(() => {
        if (footerRequestCount > 0) {
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            document.getElementById('portfolio-footer')?.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
            });
        }
    }, [footerRequestCount]);

    const showContactFooter = () => {
        setShowFooter(true);
        setFooterRequestCount((count) => count + 1);
    };

    return (
        <div className="App-container">
            <Terminal sonido={soundEnabled} onContact={showContactFooter}/>
            {showFooter && (
                <footer className="Portfolio-footer" id="portfolio-footer">
                    <h2>Contacto</h2>
                    <p>Encuéntrame también en estas plataformas:</p>
                    <nav className="Portfolio-channels" aria-label="Redes sociales">
                        {canales.map(({nombre, url, Icono}) => (
                            <a key={nombre} href={url} target="_blank" rel="noopener noreferrer">
                                <Icono/>
                                <span>{nombre}</span>
                            </a>
                        ))}
                    </nav>
                </footer>
            )}
        </div>
    );
};
export default App;
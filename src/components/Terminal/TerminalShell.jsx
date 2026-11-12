import {useEffect, useState} from 'react';

export default function TerminalShell({title, children, controls, mascot}) {
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = window.setTimeout(() => setHasEntered(true), reducedMotion ? 0 : 300);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <section className="Terminal-container" aria-label="Terminal interactiva">
            <div className="Terminal-header">
                <div className="Terminal-controls" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className="Terminal-title">
                    <svg className="Terminal-monogram" viewBox="0 0 34 22" aria-hidden="true">
                        <path className="Terminal-monogram-draw" d="M4 3 12 11 4 19"/>
                        <path className="Terminal-monogram-cursor" d="M17 19h12"/>
                    </svg>
                    <h2>{title}</h2>
                </div>
            </div>
            <div className="Terminal-output" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
                {hasEntered && children}
                {hasEntered && mascot}
            </div>
            {hasEntered && controls}
        </section>
    );
}

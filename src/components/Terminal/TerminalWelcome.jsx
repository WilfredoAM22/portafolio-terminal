import {memo, useCallback, useEffect, useRef, useState} from 'react';
import {sonidoEnter, sonidoError, sonidoTecla} from './sonido.js';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function prefersReducedMotion() {
    return window.matchMedia?.(reducedMotionQuery).matches ?? false;
}

export const LineaCompleta = memo(function LineaCompleta({linea}) {
    if (linea.tipo === 'comando') {
        return (
            <p className="Terminal-typed-line Terminal-typed-command">
                <span className="Terminal-prompt-symbol">$ </span>
                {linea.texto}
            </p>
        );
    }

    return (
        <p className={`Terminal-typed-line ${linea.error ? 'Terminal-error-line' : ''}`}>
            {linea.texto}
        </p>
    );
});

export function LineaEscribiendo({
                                     linea,
                                     sonido = false,
                                     sonidoFinal = 'enter',
                                     onComplete,
                                 }) {
    const [characterCount, setCharacterCount] = useState(0);

    useEffect(() => {
        if (characterCount >= linea.texto.length) {
            const timer = window.setTimeout(() => {
                if (linea.tipo === 'comando' && sonido && sonidoFinal) {
                    if (sonidoFinal === 'error') {
                        sonidoError();
                    } else {
                        sonidoEnter();
                    }
                }
                onComplete();
            }, 0);
            return () => window.clearTimeout(timer);
        }

        const reducedMotion = prefersReducedMotion();
        const delay = reducedMotion ? 0 : Math.floor(Math.random() * 71) + 35;
        const timer = window.setTimeout(() => {
            const nextCharacter = linea.texto[characterCount];
            setCharacterCount((count) => reducedMotion ? linea.texto.length : count + 1);
            if (sonido && !reducedMotion && nextCharacter !== ' ') {
                sonidoTecla();
            }
        }, delay);

        return () => window.clearTimeout(timer);
    }, [characterCount, linea, onComplete, sonido, sonidoFinal]);

    return (
        <p className={`Terminal-typed-line ${linea.tipo === 'comando' ? 'Terminal-typed-command' : ''} ${linea.error ? 'Terminal-error-line' : ''}`}>
            {linea.tipo === 'comando' && <span className="Terminal-prompt-symbol">$ </span>}
            {linea.texto.slice(0, characterCount)}
            <span className="Terminal-cursor" aria-hidden="true"/>
        </p>
    );
}

export function RespuestaApareciendo({linea, sonido = false, onComplete}) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const delay = prefersReducedMotion() ? 0 : (linea.error ? 420 : 300);
        const timer = window.setTimeout(() => setReady(true), delay);

        return () => window.clearTimeout(timer);
    }, [linea.error, onComplete]);

    return ready
        ? <LineaEscribiendo linea={linea} sonido={sonido} sonidoFinal={null} onComplete={onComplete}/>
        : <p className="Terminal-typed-line"><span className="Terminal-cursor" aria-hidden="true"/></p>;
}

export default function TerminalWelcome({
                                            lineas = [],
                                            sonido = false,
                                            titulo = 'wilfredo@portfolio — terminal',
                                            onComplete,
                                            controls,
                                            children,
                                        }) {
    const [indice, setIndice] = useState(0);
    const completionNotified = useRef(false);
    const complete = indice >= lineas.length;

    const avanzar = useCallback(() => {
        setIndice((currentIndex) => currentIndex + 1);
    }, []);

    const activeLine = lineas[indice];

    useEffect(() => {
        if (complete && !completionNotified.current) {
            completionNotified.current = true;
            onComplete?.();
        }
    }, [complete, onComplete]);

    return (
        <section className="Terminal-container" aria-label="Terminal interactiva">
            <div className="Terminal-header">
                <div className="Terminal-controls" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className="Terminal-title">
                    <h2>{titulo}</h2>
                </div>
            </div>

            <div className="Terminal-output" aria-live="polite">
                {lineas.slice(0, indice).map((linea, index) => (
                    <LineaCompleta key={index} linea={linea}/>
                ))}

                {!complete && activeLine && (
                    activeLine.tipo === 'respuesta'
                        ? <RespuestaApareciendo
                            key={indice}
                            linea={activeLine}
                            sonido={sonido}
                            onComplete={avanzar}
                        />
                        : <LineaEscribiendo
                            key={indice}
                            linea={activeLine}
                            sonido={sonido}
                            onComplete={avanzar}
                        />
                )}

                {complete && children}
            </div>
            {complete && controls}
        </section>
    );
}

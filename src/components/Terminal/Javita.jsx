import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {availableCommands} from '../../data/command.js';
import {sonidoJavita} from './sonido.js';

const SUGGESTION_ORDER = ['help', 'projects', 'contact'];
const IDLE_DELAY = 6000;
const EMOTIONS = [
    'tranquila',
    'feliz',
    'pensativa',
    'confiada',
    'sorprendida',
    'divertida',
    'confundida',
    'dormida',
];

function JavitaIllustration({emotion, reaction, reactionVersion}) {
    const svgRef = useRef(null);

    // Reinicia la animación de la reacción sin recrear el SVG,
    // para que las expresiones puedan hacer transiciones graduales.
    useLayoutEffect(() => {
        const svg = svgRef.current;
        if (!svg || reactionVersion === 0) {
            return;
        }

        svg.removeAttribute('data-reaction');
        void svg.getBoundingClientRect();
        svg.setAttribute('data-reaction', reaction);
    }, [reaction, reactionVersion]);

    return (
        <svg
            ref={svgRef}
            className="Javita-illustration"
            data-emotion={emotion}
            viewBox="0 0 64 64"
            aria-hidden="true"
            focusable="false"
        >
            <g className="Javita-steam" fill="none" stroke="#7fa3b3" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round">
                <path className="Javita-steam-line" d="M24 20c-3-3 3-5 0-9"/>
                <path className="Javita-steam-line Javita-steam-line-delayed" d="M34 20c-3-3 3-5 0-9"/>
            </g>
            <g fill="none" stroke="#F89820" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 26h32v14a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12z"
                      fill="#F89820" fillOpacity=".14"/>
                <path d="M44 30h4a6 6 0 0 1 0 12h-4"/>
                <path d="M8 57h40"/>
            </g>
            <g fill="#F89820" fillOpacity=".35">
                <circle cx="17.5" cy="40" r="2"/>
                <circle cx="38.5" cy="40" r="2"/>
            </g>
            <g fill="none" stroke="#cfeaf5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <g className="Javita-eyes-pose">
                    <g className="Javita-eyes">
                        <path d="M22 34v3"/>
                        <path d="M34 34v3"/>
                    </g>
                </g>
                <g className="Javita-eyes-happy" strokeWidth="2.5">
                    <path d="M19.5 37q2.5-4 5 0"/>
                    <path d="M31.5 37q2.5-4 5 0"/>
                </g>
                <g className="Javita-eyes-closed" strokeWidth="2.5">
                    <path d="M19.5 35q2.5 3 5 0"/>
                    <path d="M31.5 35q2.5 3 5 0"/>
                </g>
                <g className="Javita-mouths" strokeWidth="2.5">
                    <path className="Javita-mouth Javita-mouth-smile" d="M25.5 42q2.5 2 5 0"/>
                    <path className="Javita-mouth Javita-mouth-grin" d="M23.5 41.5q4.5 4.5 9 0"/>
                    <path className="Javita-mouth Javita-mouth-flat" d="M26 42.5h4"/>
                    <path className="Javita-mouth Javita-mouth-smirk" d="M25.5 43q3 0 5-2"/>
                    <path className="Javita-mouth Javita-mouth-wavy" d="M24.5 42.5q1.5-2 3 0t3 0"/>
                    <path className="Javita-mouth Javita-mouth-laugh" d="M23.5 41.5h9a4.5 4.5 0 0 1-9 0z"
                          fill="#cfeaf5" strokeWidth="1.5"/>
                    <ellipse className="Javita-mouth Javita-mouth-o" cx="28" cy="43" rx="1.8" ry="2.2"/>
                </g>
            </g>
        </svg>
    );
}

export default function Javita({
                                   active,
                                   activityVersion,
                                   emotion = 'tranquila',
                                   reaction,
                                   reactionVersion,
                                   sonido = true,
                               }) {
    const suggestions = useMemo(
        () => availableCommands
            .filter(({name}) => SUGGESTION_ORDER.includes(name))
            .sort((first, second) =>
                SUGGESTION_ORDER.indexOf(first.name) - SUGGESTION_ORDER.indexOf(second.name)
            ),
        [],
    );
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const [tipActivityVersion, setTipActivityVersion] = useState(null);
    const timerRef = useRef(null);
    const isTipVisible = active && tipActivityVersion === activityVersion;
    const currentEmotion = EMOTIONS.includes(emotion) ? emotion : 'tranquila';

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const showNextSuggestion = useCallback(() => {
        setSuggestionIndex((index) => (index + 1) % suggestions.length);
        setTipActivityVersion(activityVersion);
    }, [activityVersion, suggestions.length]);

    const scheduleSuggestion = useCallback(() => {
        clearTimer();
        if (!active) {
            return;
        }

        timerRef.current = window.setTimeout(() => {
            showNextSuggestion();
            timerRef.current = null;
        }, IDLE_DELAY);
    }, [active, clearTimer, showNextSuggestion]);

    useEffect(() => {
        if (!active) {
            clearTimer();
            return undefined;
        }

        scheduleSuggestion();
        return clearTimer;
    }, [active, activityVersion, clearTimer, scheduleSuggestion]);

    useEffect(() => clearTimer, [clearTimer]);

    const suggestion = suggestions[Math.max(suggestionIndex, 0)];
    const tip = suggestion?.name === 'help' && suggestionIndex === 0
        ? '¿Sin mapa? Escribe help y te muestro los atajos.'
        : `Prueba ${suggestion?.name ?? 'help'}`;
    const nextSuggestion = suggestions[(suggestionIndex + 1) % suggestions.length];

    const handleClick = () => {
        if (sonido) {
            sonidoJavita();
        }
        showNextSuggestion();
        scheduleSuggestion();
    };

    return (
        <div className="Javita">
            {isTipVisible && active && (
                <p className="Javita-tip" role="status" aria-live="polite">
                    {tip}
                </p>
            )}
            <button
                type="button"
                className="Javita-button"
                aria-label={`Javita, mostrar sugerencia: ${nextSuggestion?.name ?? 'help'}`}
                onClick={handleClick}
                disabled={!active}
            >
                <JavitaIllustration
                    emotion={currentEmotion}
                    reaction={reaction}
                    reactionVersion={reactionVersion}
                />
            </button>
        </div>
    );
}
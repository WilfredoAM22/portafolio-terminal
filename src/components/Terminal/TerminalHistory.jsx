import {useCallback, useEffect, useState} from 'react';
import {
    LineaCompleta,
    LineaEscribiendo,
    RespuestaApareciendo,
} from './TerminalWelcome.jsx';

export default function TerminalHistory({history, sonido, onTypingChange, onContactComplete}) {
    const [activeLineIndex, setActiveLineIndex] = useState(0);
    const lines = history;
    const complete = activeLineIndex >= lines.length;

    const advanceLine = useCallback(() => {
        setActiveLineIndex((index) => index + 1);
    }, []);

    const completeLine = useCallback(() => {
        if (
            activeLineIndex % 2 === 1
            && history[activeLineIndex - 1]?.texto === 'contact'
        ) {
            onContactComplete?.();
        }
        advanceLine();
    }, [activeLineIndex, advanceLine, history, onContactComplete]);

    useEffect(() => {
        onTypingChange(!complete);
    }, [complete, onTypingChange]);

    return (
        <>
            {lines.slice(0, activeLineIndex).map((line, index) => (
                <LineaCompleta key={index} linea={line}/>
            ))}
            {!complete && lines[activeLineIndex] && (
                lines[activeLineIndex].tipo === 'respuesta'
                    ? <RespuestaApareciendo
                        key={activeLineIndex}
                        linea={lines[activeLineIndex]}
                        sonido={sonido}
                        onComplete={completeLine}
                    />
                    : <LineaEscribiendo
                        key={activeLineIndex}
                        linea={lines[activeLineIndex]}
                        sonido={sonido}
                        sonidoFinal={lines[activeLineIndex].sonidoFinal}
                        onComplete={completeLine}
                    />
            )}
        </>
    );
}

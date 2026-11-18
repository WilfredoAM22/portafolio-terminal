
import React, {useEffect, useRef, useState} from 'react';
import {availableCommands} from '../../data/command.js';
import {portfolioContent} from '../../data/portfolioContent.js';
import {terminalLines} from '../../data/terminalLines.js';
import {sendContactMessage} from '../../services/contact.js';
import CommandSuggestions from './CommandSuggestions.jsx';
import Javita from './Javita.jsx';
import {
    activarAudio,
    sonidoApertura,
    sonidoAutocompletar,
    sonidoBorrar,
    sonidoCancelar,
    sonidoClear,
    sonidoEnviando,
    sonidoExito,
    sonidoFalloEnvio,
    sonidoListo,
    sonidoTecla,
} from './sonido.js';
import TerminalHistory from './TerminalHistory.jsx';
import TerminalShell from './TerminalShell.jsx';
import TerminalWelcome from './TerminalWelcome.jsx';

const TERMINAL_STATE = {
    NORMAL: 'NORMAL',
    WRITING: 'WRITING',
    SENDING: 'SENDING',
    RESULT: 'RESULT',
    SELECTING_CV: 'SELECTING_CV',
};

const CONTACT_FIELDS = [
    {key: 'name', label: 'Nombre'},
    {key: 'email', label: 'Correo electrónico'},
    {key: 'subject', label: 'Asunto'},
    {key: 'message', label: 'Mensaje'},
];

const CV_FILES = {
    en: {
        url: '/documents/Wilfredo_Alexis_Mariano_CV_EN.pdf',
        filename: 'Wilfredo_Alexis_Mariano_CV_EN.pdf',
    },
    es: {
        url: '/documents/Wilfredo_Alexis_Mariano_CV_ES.pdf',
        filename: 'Wilfredo_Alexis_Mariano_CV_ES.pdf',
    },
};

const EMPTY_CONTACT = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

const JAVITA_EMOTION_BY_COMMAND = {
    help: 'pensativa',
    about: 'tranquila',
    skills: 'confiada',
    projects: 'feliz',
    contact: 'feliz',
    'download-cv': 'pensativa',
    escribeme: 'feliz',
    cancelar: 'tranquila',
    clear: 'sorprendida',
};

const JAVITA_DEFAULT_EMOTION = 'tranquila';
const JAVITA_UNKNOWN_EMOTION = 'confundida';
const JAVITA_EMOTION_RECOVERY_DELAY = 4000;

const commandDescriptions = availableCommands
    .map(({name, description}) => `${name.padEnd(10)} ${description}`)
    .join('\n');

const knownCommands = new Set(availableCommands.map(({name}) => name));

function Terminal({
                      onContact,
                      lineas = terminalLines,
                      sonido = true,
                      titulo = 'wilfredo@portfolio — terminal',
                  }) {
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState([]);
    const [historyEpoch, setHistoryEpoch] = useState(0);
    const [isOutputTyping, setIsOutputTyping] = useState(false);
    const [bootComplete, setBootComplete] = useState(false);
    const [showBootLines, setShowBootLines] = useState(true);
    const [activityVersion, setActivityVersion] = useState(0);
    const [javitaReaction, setJavitaReaction] = useState('rest');
    const [javitaReactionVersion, setJavitaReactionVersion] = useState(0);
    const [javitaEmotion, setJavitaEmotion] = useState(JAVITA_DEFAULT_EMOTION);
    const [terminalState, setTerminalState] = useState(TERMINAL_STATE.NORMAL);
    const [writingStep, setWritingStep] = useState(0);
    const [contactDraft, setContactDraft] = useState(EMPTY_CONTACT);
    const [contactStatus, setContactStatus] = useState('');
    const [result, setResult] = useState(null);

    const inputRef = useRef(null);
    const isSendingRef = useRef(false);

    useEffect(() => {
        if (sonido) {
            sonidoApertura();
        }

        const unlockAudio = () => {
            void activarAudio();
        };

        window.addEventListener('pointerdown', unlockAudio, {once: true});
        window.addEventListener('keydown', unlockAudio, {once: true});

        return () => {
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
    }, [sonido]);

    useEffect(() => {
        if (bootComplete && !isOutputTyping) {
            inputRef.current?.focus();
        }
    }, [bootComplete, isOutputTyping]);

    useEffect(() => {
        if (
            javitaEmotion === JAVITA_DEFAULT_EMOTION ||
            terminalState !== TERMINAL_STATE.NORMAL
        ) {
            return undefined;
        }

        const timer = window.setTimeout(
            () => setJavitaEmotion(JAVITA_DEFAULT_EMOTION),
            JAVITA_EMOTION_RECOVERY_DELAY,
        );

        return () => window.clearTimeout(timer);
    }, [javitaEmotion, javitaReactionVersion, terminalState]);

    const appendHistory = (command, response, error = false) => {
        setHistory((previousHistory) => [
            ...previousHistory,
            {tipo: 'comando', texto: command, sonidoFinal: 'enter'},
            {tipo: 'respuesta', texto: response, error},
        ]);
    };

    const reactToCommand = (command) => {
        const reaction = {
            help: 'help',
            about: 'about',
            'download-cv': 'about',
            skills: 'skills',
            projects: 'projects',
            contact: 'contact',
            escribeme: 'escribeme',
            cancelar: 'cancelar',
            clear: 'clear',
        }[command] ?? 'unknown';

        setJavitaReaction(reaction);
        setJavitaReactionVersion((version) => version + 1);
        setJavitaEmotion(
            JAVITA_EMOTION_BY_COMMAND[command] ?? JAVITA_UNKNOWN_EMOTION,
        );
    };

    const reproducir = (efecto) => {
        if (!sonido) {
            return;
        }

        void activarAudio()
            .then(() => {
                efecto();
            })
            .catch((error) => {
                console.warn('No se pudo reproducir el sonido:', error);
            });
    };

    const triggerDownload = ({url, filename}) => {
        const link = document.createElement('a');

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const cancelFlow = () => {
        reactToCommand('cancelar');
        reproducir(sonidoCancelar);
    };

    const resetContact = () => {
        setTerminalState(TERMINAL_STATE.NORMAL);
        setWritingStep(0);
        setContactDraft(EMPTY_CONTACT);
        setContactStatus('');
        setResult(null);
    };

    const sendContact = async () => {
        if (isSendingRef.current) {
            return;
        }

        isSendingRef.current = true;
        setTerminalState(TERMINAL_STATE.SENDING);
        setContactStatus('Enviando tu mensaje…');
        reproducir(sonidoEnviando);

        try {
            await sendContactMessage(contactDraft);

            setResult({
                success: true,
                message: 'Mensaje enviado correctamente. ¡Gracias por escribirme!',
            });

            reproducir(sonidoExito);
        } catch (error) {
            setResult({
                success: false,
                message: `No se pudo enviar el mensaje. ${error.message}`,
            });

            reproducir(sonidoFalloEnvio);
        } finally {
            isSendingRef.current = false;
            setContactStatus('');
            setTerminalState(TERMINAL_STATE.RESULT);
        }
    };

    const executeCommand = (command) => {
        const normalizedCommand = command.trim().toLowerCase();

        if (!normalizedCommand) {
            return;
        }

        reactToCommand(normalizedCommand);

        let response;
        let error = false;

        const sound = knownCommands.has(normalizedCommand)
            ? 'enter'
            : 'error';

        switch (normalizedCommand) {
            case 'help':
                response = [
                    'Explora mi perfil, habilidades y proyectos, o escríbeme directamente.',
                    '',
                    'Comandos disponibles:',
                    commandDescriptions,
                ].join('\n');
                break;

            case 'about':
                response = portfolioContent.about.join('\n');
                break;

            case 'contact':
                response = 'Desplazando hasta el pie de página para mostrar mis canales de contacto.';
                break;

            case 'skills':
                response = portfolioContent.skills.join('\n');
                break;

            case 'projects':
                response = portfolioContent.projects.join('\n');
                break;

            case 'download-cv':
                setTerminalState(TERMINAL_STATE.SELECTING_CV);

                response = [
                    'Currículum disponible',
                    '- 1 — English version.',
                    '- 2 — Versión en español.',
                    '- 3 — Descargar ambas versiones.',
                    'Escribe cancelar para salir.',
                ].join('\n');
                break;

            case 'escribeme':
                setContactDraft(EMPTY_CONTACT);
                setWritingStep(0);
                setContactStatus('Modo escritura. Escribe cancelar en cualquier momento. Nombre:');
                setTerminalState(TERMINAL_STATE.WRITING);

                response = 'Iniciando modo escritura. Completa los datos solicitados en la terminal.';
                break;

            case 'clear':
                if (sonido) {
                    sonidoClear();
                }

                setHistory([
                    {
                        tipo: 'comando',
                        texto: normalizedCommand,
                        sonidoFinal: null,
                    },
                    {
                        tipo: 'respuesta',
                        texto: `Comandos disponibles:\n${commandDescriptions}`,
                    },
                ]);

                setHistoryEpoch((epoch) => epoch + 1);
                setShowBootLines(false);
                return;

            case 'cancelar':
                response = 'No hay ninguna redacción activa para cancelar.';
                break;

            default:
                response = `comando no reconocido: ${normalizedCommand}`;
                error = true;
                break;
        }

        setHistory((previousHistory) => [
            ...previousHistory,
            {tipo: 'comando', texto: normalizedCommand, sonidoFinal: sound},
            {tipo: 'respuesta', texto: response, error},
        ]);
    };

    const handleWritingInput = (value) => {
        const normalizedValue = value.trim();

        if (normalizedValue.toLowerCase() === 'cancelar') {
            cancelFlow();

            appendHistory(
                'cancelar',
                'Redacción cancelada. La terminal está en modo normal.',
            );

            resetContact();
            return;
        }

        if (writingStep === CONTACT_FIELDS.length) {
            if (['enviar', 'si', 'sí'].includes(normalizedValue.toLowerCase())) {
                void sendContact();
            } else if (
                ['no', 'cancelar'].includes(normalizedValue.toLowerCase())
            ) {
                cancelFlow();

                appendHistory(
                    'cancelar',
                    'Redacción cancelada. La terminal está en modo normal.',
                );

                resetContact();
            } else {
                setContactStatus(
                    'Escribe enviar para confirmar o cancelar para descartar el mensaje.',
                );
            }

            return;
        }

        const field = CONTACT_FIELDS[writingStep];

        if (!normalizedValue) {
            setContactStatus(
                `${field.label} es obligatorio. Inténtalo de nuevo o escribe cancelar.`,
            );
            return;
        }

        if (
            field.key === 'email' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)
        ) {
            setContactStatus(
                'El correo no parece válido. Escríbelo de nuevo o escribe cancelar.',
            );
            return;
        }

        setContactDraft((previousDraft) => ({
            ...previousDraft,
            [field.key]: normalizedValue,
        }));

        if (writingStep === CONTACT_FIELDS.length - 1) {
            setWritingStep(CONTACT_FIELDS.length);

            setContactStatus(
                'Datos completos. Escribe enviar para confirmar o cancelar para descartar el mensaje.',
            );

            return;
        }

        const nextField = CONTACT_FIELDS[writingStep + 1];

        setWritingStep((step) => step + 1);
        setContactStatus(`${nextField.label}:`);
    };

    const handleCvSelection = (value) => {
        const normalizedValue = value.trim().toLowerCase();

        if (normalizedValue === 'cancelar') {
            cancelFlow();
            setTerminalState(TERMINAL_STATE.NORMAL);
            appendHistory('cancelar', 'Selección de currículum cancelada.');
            return;
        }

        let response;

        switch (normalizedValue) {
            case '1':
                triggerDownload(CV_FILES.en);
                response = 'Has seleccionado la versión en inglés.';
                break;

            case '2':
                triggerDownload(CV_FILES.es);
                response = 'Has seleccionado la versión en español.';
                break;

            case '3':
                triggerDownload(CV_FILES.en);
                triggerDownload(CV_FILES.es);
                response = 'Has seleccionado ambas versiones.';
                break;

            default:
                appendHistory(
                    value,
                    'Opción no válida. Selecciona 1, 2, 3 o escribe cancelar.',
                    true,
                );
                return;
        }

        void reproducir(sonidoExito);
        appendHistory(value, response);
        setTerminalState(TERMINAL_STATE.NORMAL);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (
            terminalState === TERMINAL_STATE.SENDING ||
            isOutputTyping
        ) {
            return;
        }

        setActivityVersion((version) => version + 1);

        const value = prompt;
        setPrompt('');

        if (terminalState === TERMINAL_STATE.SELECTING_CV) {
            handleCvSelection(value);
            return;
        }

        if (terminalState === TERMINAL_STATE.WRITING) {
            handleWritingInput(value);
            return;
        }

        if (terminalState === TERMINAL_STATE.RESULT) {
            if (result?.success) {
                resetContact();
            } else if (value.trim().toLowerCase() === 'reintentar') {
                void sendContact();
            } else if (value.trim().toLowerCase() === 'cancelar') {
                cancelFlow();
                resetContact();
            } else {
                setContactStatus(
                    'Escribe reintentar para volver a enviar o cancelar para regresar.',
                );
            }

            return;
        }

        executeCommand(value);
    };

    const filteredCommands = terminalState === TERMINAL_STATE.NORMAL
        ? availableCommands.filter(({name}) =>
            name.startsWith(prompt.trim().toLowerCase()),
        )
        : [];

    const showCommandSuggestions = Boolean(
        prompt.trim() && filteredCommands.length,
    );

    const selectCommand = (commandName) => {
        reproducir(sonidoAutocompletar);
        setPrompt(commandName);
        setActivityVersion((version) => version + 1);
        inputRef.current?.focus();
    };

    const canShowJavitaSuggestions = bootComplete
        && terminalState === TERMINAL_STATE.NORMAL
        && !isOutputTyping;

    const inputPlaceholder = {
        [TERMINAL_STATE.NORMAL]: '',
        [TERMINAL_STATE.WRITING]: writingStep < CONTACT_FIELDS.length
            ? `Escribe: ${CONTACT_FIELDS[writingStep].label.toLowerCase()}`
            : 'Escribe enviar o cancelar…',
        [TERMINAL_STATE.SELECTING_CV]: 'Selecciona 1, 2, 3 o cancelar…',
        [TERMINAL_STATE.SENDING]: 'Enviando…',
        [TERMINAL_STATE.RESULT]: result?.success
            ? 'Escribe Enter para volver…'
            : 'Escribe reintentar o cancelar…',
    }[terminalState];

    return (
        <TerminalShell
            title={titulo}
            controls={bootComplete && (
                <form
                    onSubmit={handleSubmit}
                    className={`Terminal-input ${terminalState === TERMINAL_STATE.SENDING ? 'is-disabled' : ''} ${isOutputTyping ? 'is-typing' : ''}`}
                >
                    <span aria-hidden="true">
                        wilfredo@portfolio:~$
                    </span>

                    <label htmlFor="Terminal-command">
                        {terminalState === TERMINAL_STATE.NORMAL
                            ? 'Escribe un comando'
                            : 'Entrada de terminal'}
                    </label>

                    <span
                        className="Terminal-input-value"
                        aria-hidden="true"
                    >
                        {prompt || inputPlaceholder}
                        <span className="Terminal-cursor Terminal-input-cursor"/>
                    </span>

                    <input
                        id="Terminal-command"
                        type="text"
                        value={prompt}
                        ref={inputRef}
                        placeholder={inputPlaceholder}
                        className="Terminal-input-field"
                        onChange={(event) => {
                            setPrompt(event.target.value);
                            setActivityVersion((version) => version + 1);
                        }}
                        onFocus={() => setActivityVersion((version) => version + 1)}
                        onKeyDown={(event) => {
                            if (
                                event.key === 'Backspace' ||
                                event.key === 'Delete'
                            ) {
                                void reproducir(sonidoBorrar);
                            } else if (
                                event.key.length === 1 &&
                                !event.ctrlKey &&
                                !event.metaKey
                            ) {
                                void reproducir(sonidoTecla);
                            }
                        }}
                        autoComplete="off"
                        disabled={
                            terminalState === TERMINAL_STATE.SENDING ||
                            isOutputTyping
                        }
                        aria-label={
                            terminalState === TERMINAL_STATE.NORMAL
                                ? 'Escribe un comando'
                                : 'Entrada de terminal'
                        }
                        aria-autocomplete="list"
                        aria-expanded={showCommandSuggestions}
                        aria-controls={
                            showCommandSuggestions
                                ? 'Terminal-command-suggestions'
                                : undefined
                        }
                    />

                    {showCommandSuggestions && (
                        <CommandSuggestions
                            commands={filteredCommands}
                            onSelect={selectCommand}
                        />
                    )}
                </form>
            )}
            mascot={bootComplete && (
                <Javita
                    active={canShowJavitaSuggestions}
                    activityVersion={activityVersion}
                    sonido={sonido}
                    emotion={javitaEmotion}
                    reaction={javitaReaction}
                    reactionVersion={javitaReactionVersion}
                />
            )}
        >
            <TerminalWelcome
                lineas={showBootLines ? lineas : []}
                sonido={sonido}
                onComplete={() => {
                    setBootComplete(true);
                    reproducir(sonidoListo);
                }}
            >
                {bootComplete && (
                    <>
                        <TerminalHistory
                            key={historyEpoch}
                            history={history}
                            sonido={sonido}
                            onTypingChange={setIsOutputTyping}
                            onContactComplete={onContact}
                        />

                        {(
                            terminalState === TERMINAL_STATE.WRITING ||
                            terminalState === TERMINAL_STATE.SENDING
                        ) && (
                            <p
                                className="Terminal-contact-status"
                                role="status"
                                aria-live="polite"
                            >
                                {contactStatus}
                            </p>
                        )}

                        {terminalState === TERMINAL_STATE.RESULT && (
                            <p
                                className={`Terminal-contact-result ${result?.success ? 'is-success' : 'is-error'}`}
                                role={result?.success ? 'status' : 'alert'}
                                aria-live={result?.success ? 'polite' : 'assertive'}
                            >
                                {result?.message}
                                {contactStatus && (
                                    <>
                                        <br/>
                                        {contactStatus}</>
                                )}</p>
                        )}
                    </>
                )}
            </TerminalWelcome>
        </TerminalShell>
    );
}

export default Terminal;

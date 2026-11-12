import React, {useEffect, useRef, useState} from 'react';
import {availableCommands} from '../../data/command.js';
import {terminalLines} from '../../data/terminalLines.js';
import {sendContactMessage} from '../../services/contact.js';
import {sonidoClear} from './sonido.js';
import TerminalHistory from './TerminalHistory.jsx';
import TerminalWelcome from './TerminalWelcome.jsx';

const TERMINAL_STATE = {
    NORMAL: 'NORMAL',
    WRITING: 'WRITING',
    SENDING: 'SENDING',
    RESULT: 'RESULT',
};

const CONTACT_FIELDS = [
    {key: 'name', label: 'Nombre'},
    {key: 'email', label: 'Correo electrónico'},
    {key: 'subject', label: 'Asunto'},
    {key: 'message', label: 'Mensaje'},
];

const EMPTY_CONTACT = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

const commandDescriptions = availableCommands
    .map(({name, description}) => `${name.padEnd(10)} ${description}`)
    .join('\n');

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
    const [terminalState, setTerminalState] = useState(TERMINAL_STATE.NORMAL);
    const [writingStep, setWritingStep] = useState(0);
    const [contactDraft, setContactDraft] = useState(EMPTY_CONTACT);
    const [contactStatus, setContactStatus] = useState('');
    const [result, setResult] = useState(null);
    const inputRef = useRef(null);
    const isSendingRef = useRef(false);

    useEffect(() => {
        if (bootComplete && !isOutputTyping) {
            inputRef.current?.focus();
        }
    }, [bootComplete, isOutputTyping]);

    const appendHistory = (command, response) => {
        setHistory((previousHistory) => [...previousHistory, {command, response}]);
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

        try {
            await sendContactMessage(contactDraft);
            setResult({
                success: true,
                message: 'Mensaje enviado correctamente. ¡Gracias por escribirme!',
            });
        } catch (error) {
            setResult({
                success: false,
                message: `No se pudo enviar el mensaje. ${error.message}`,
            });
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

        const knownCommands = new Set(availableCommands.map(({name}) => name));

        let response;
        let error = false;
        const sound = knownCommands.has(normalizedCommand) ? 'enter' : 'error';

        switch (normalizedCommand) {
            case 'help':
                response = [
                    'Hola, soy Wilfredo Alexis Mariano. Bienvenido a mi terminal interactiva.',
                    'Explora mi perfil, habilidades y proyectos, o escríbeme directamente.',
                    '',
                    'Comandos disponibles:',
                    commandDescriptions,
                ].join('\n');
                break;
            case 'about':
                response = [
                    'Soy Wilfredo Alexis Mariano, desarrollador de software enfocado en escribir código limpio, resolver problemas complejos y crear soluciones tecnológicas funcionales y bien estructuradas.',
                    'Siempre estoy en busca de nuevos desafíos que me permitan seguir aprendiendo y creciendo profesionalmente.',
                ].join('\n');
                break;
            case 'contact':
                response = 'Desplazando hasta el pie de página para mostrar mis canales de contacto.';
                break;
            case 'skills':
                response = [
                    'Mi stack tecnológico y herramientas principales:',
                    '• Lenguajes: Java, JavaScript, TypeScript, Python, SQL',
                    '• Frontend: HTML5, CSS3, React, Vite',
                    '• Backend: APIs REST, bases de datos',
                    '• Control de versiones: Git, GitHub',
                    'Actualmente continúo profundizando mis conocimientos rumbo a Full Stack Developer.',
                ].join('\n');
                break;
            case 'projects':
                response = [
                    'Bienvenido a mi espacio de proyectos. Aquí encontrarás aplicaciones web, interfaces interactivas y soluciones desarrolladas durante mi formación como ingeniero de software.',
                    'Cada proyecto es una oportunidad para aplicar buenas prácticas y resolver problemas reales.',
                    '¡Más proyectos próximamente!',
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
                setHistory([]);
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

        setHistory((previousHistory) => [...previousHistory, {
            command: normalizedCommand,
            response,
            error,
            sound,
        }]);
    };

    const handleWritingInput = (value) => {
        const normalizedValue = value.trim();

        if (normalizedValue.toLowerCase() === 'cancelar') {
            appendHistory('cancelar', 'Redacción cancelada. La terminal está en modo normal.');
            resetContact();
            return;
        }

        if (writingStep === CONTACT_FIELDS.length) {
            if (['enviar', 'si', 'sí'].includes(normalizedValue.toLowerCase())) {
                void sendContact();
            } else if (['no', 'cancelar'].includes(normalizedValue.toLowerCase())) {
                appendHistory('cancelar', 'Redacción cancelada. La terminal está en modo normal.');
                resetContact();
            } else {
                setContactStatus('Escribe enviar para confirmar o cancelar para descartar el mensaje.');
            }
            return;
        }

        const field = CONTACT_FIELDS[writingStep];
        if (!normalizedValue) {
            setContactStatus(`${field.label} es obligatorio. Inténtalo de nuevo o escribe cancelar.`);
            return;
        }

        if (field.key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
            setContactStatus('El correo no parece válido. Escríbelo de nuevo o escribe cancelar.');
            return;
        }

        setContactDraft((previousDraft) => ({
            ...previousDraft,
            [field.key]: normalizedValue,
        }));

        if (writingStep === CONTACT_FIELDS.length - 1) {
            setWritingStep(CONTACT_FIELDS.length);
            setContactStatus('Datos completos. Escribe enviar para confirmar o cancelar para descartar el mensaje.');
            return;
        }

        const nextField = CONTACT_FIELDS[writingStep + 1];
        setWritingStep((step) => step + 1);
        setContactStatus(`${nextField.label}:`);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (terminalState === TERMINAL_STATE.SENDING || isOutputTyping) {
            return;
        }

        const value = prompt;
        setPrompt('');

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
                resetContact();
            } else {
                setContactStatus('Escribe reintentar para volver a enviar o cancelar para regresar.');
            }
            return;
        }

        executeCommand(value);
    };

    const filteredCommands = terminalState === TERMINAL_STATE.NORMAL
        ? availableCommands.filter(({name}) =>
            name.startsWith(prompt.trim().toLowerCase())
        )
        : [];

    const selectCommand = (commandName) => {
        setPrompt(commandName);
        inputRef.current?.focus();
    };

    const inputPlaceholder = {
        [TERMINAL_STATE.NORMAL]: '',
        [TERMINAL_STATE.WRITING]: writingStep < CONTACT_FIELDS.length
            ? `Escribe: ${CONTACT_FIELDS[writingStep].label.toLowerCase()}`
            : 'Escribe enviar o cancelar…',
        [TERMINAL_STATE.SENDING]: 'Enviando…',
        [TERMINAL_STATE.RESULT]: result?.success
            ? 'Presiona Enter para volver…'
            : 'Escribe reintentar o cancelar…',
    }[terminalState];

    return (
        <TerminalWelcome
            lineas={showBootLines ? lineas : []}
            sonido={sonido}
            titulo={titulo}
            onComplete={() => setBootComplete(true)}
            controls={bootComplete && (
                <form
                    onSubmit={handleSubmit}
                    className={`Terminal-input ${terminalState === TERMINAL_STATE.SENDING ? 'is-disabled' : ''} ${isOutputTyping ? 'is-typing' : ''}`}
                >
                    <span aria-hidden="true">wilfredo@portfolio:~$</span>
                    <label htmlFor="Terminal-command">
                        {terminalState === TERMINAL_STATE.NORMAL ? 'Escribe un comando' : 'Entrada de terminal'}
                    </label>
                    <span className="Terminal-input-value" aria-hidden="true">
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
                        onChange={(event) => setPrompt(event.target.value)}
                        autoComplete="off"
                        disabled={terminalState === TERMINAL_STATE.SENDING || isOutputTyping}
                        aria-label={terminalState === TERMINAL_STATE.NORMAL ? 'Escribe un comando' : 'Entrada de terminal'}
                    />
                    {prompt.trim() && filteredCommands.length > 0 && (
                        <div className="Terminal-suggestions">
                            {filteredCommands.map(({name}) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => selectCommand(name)}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}
                </form>
            )}
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

                    {terminalState === TERMINAL_STATE.WRITING && (
                        <p className="Terminal-contact-status">{contactStatus}</p>
                    )}
                    {terminalState === TERMINAL_STATE.SENDING && (
                        <p className="Terminal-contact-status" role="status">{contactStatus}</p>
                    )}
                    {terminalState === TERMINAL_STATE.RESULT && (
                        <p
                            className={`Terminal-contact-result ${result?.success ? 'is-success' : 'is-error'}`}
                            role={result?.success ? 'status' : 'alert'}
                        >
                            {result?.message}
                            {contactStatus && <><br/>{contactStatus}</>}
                        </p>
                    )}
                </>
            )}
        </TerminalWelcome>
    );
}

export default Terminal;

import {useEffect} from 'react';
import {activarAudio} from '../components/Terminal/sonido.js';

export default function useAudioUnlock() {
    useEffect(() => {
        const resumeAudio = async () => {
            try {
                await activarAudio();
                window.removeEventListener('pointerdown', resumeAudio);
                window.removeEventListener('keydown', resumeAudio);
            } catch (error) {
                console.error('No se pudo activar el audio de la terminal.', error);
            }
        };

        window.addEventListener('pointerdown', resumeAudio);
        window.addEventListener('keydown', resumeAudio);

        return () => {
            window.removeEventListener('pointerdown', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
        };
    }, []);
}

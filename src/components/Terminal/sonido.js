let audioContext;
const noiseBuffers = new Map();

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            return null;
        }
        audioContext = new AudioContextClass();
    }
    return audioContext;
}

function getNoiseBuffer(context, duration) {
    if (!noiseBuffers.has(duration)) {
        const buffer = context.createBuffer(
            1,
            Math.ceil(context.sampleRate * duration),
            context.sampleRate,
        );
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index += 1) {
            samples[index] = Math.random() * 2 - 1;
        }
        noiseBuffers.set(duration, buffer);
    }
    return noiseBuffers.get(duration);
}

function contextoActivo() {
    return audioContext && audioContext.state === 'running' ? audioContext : null;
}

function tono(context, {type = 'sine', from, to = from, start = 0, duration, volume}) {
    const begin = context.currentTime + start;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, begin);
    if (to !== from) {
        oscillator.frequency.exponentialRampToValueAtTime(to, begin + duration);
    }

    gain.gain.setValueAtTime(volume, begin);
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(begin);
    oscillator.stop(begin + duration);
}

function ruido(
    context,
    {duration, frequency, endFrequency = frequency, q = 1, volume, start = 0},
) {
    const begin = context.currentTime + start;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = getNoiseBuffer(context, duration);
    filter.type = 'bandpass';
    filter.Q.value = q;
    filter.frequency.setValueAtTime(frequency, begin);
    if (endFrequency !== frequency) {
        filter.frequency.linearRampToValueAtTime(endFrequency, begin + duration);
    }

    gain.gain.setValueAtTime(volume, begin);
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + duration);

    source.connect(filter).connect(gain).connect(context.destination);
    source.start(begin);
    source.stop(begin + duration);
}

export async function activarAudio() {
    const context = getAudioContext();
    if (context?.state === 'suspended') {
        await context.resume();
    }
}

export function sonidoTecla() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    ruido(context, {
        duration: 0.05,
        frequency: 2600 + Math.random() * 800,
        volume: 0.055,
    });
    tono(context, {
        type: 'triangle',
        from: 3200,
        duration: 0.02,
        volume: 0.012,
    });
}

export function sonidoBorrar() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    ruido(context, {
        duration: 0.04,
        frequency: 1400 + Math.random() * 300,
        volume: 0.05,
    });
    tono(context, {
        type: 'triangle',
        from: 900,
        to: 450,
        duration: 0.03,
        volume: 0.015,
    });
}

export function sonidoEnter() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    ruido(context, {duration: 0.04, frequency: 900, volume: 0.16});

    [
        {frequency: 2093, volume: 0.045},
        {frequency: 3136, volume: 0.022},
    ].forEach(({frequency, volume}, index) => {
        tono(context, {
            from: frequency,
            start: index * 0.035,
            duration: 0.9,
            volume,
        });
    });
}

export function sonidoClear() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    ruido(context, {
        duration: 0.4,
        frequency: 3500,
        endFrequency: 500,
        q: 2,
        volume: 0.12,
    });
    tono(context, {
        from: 150,
        to: 60,
        start: 0.4,
        duration: 0.12,
        volume: 0.12,
    });
    tono(context, {
        from: 700,
        start: 0.52,
        duration: 0.025,
        volume: 0.12,
    });
}

export function sonidoError() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    [
        {frequency: 220, start: 0, duration: 0.14},
        {frequency: 165, start: 0.15, duration: 0.24},
    ].forEach(({frequency, start, duration}) => {
        tono(context, {
            type: 'square',
            from: frequency,
            start,
            duration,
            volume: 0.05,
        });
    });

    tono(context, {
        from: 500,
        start: 0.39,
        duration: 0.025,
        volume: 0.05,
    });
}

export function sonidoFalloEnvio() {
    sonidoError();
}

export function sonidoAutocompletar() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    ruido(context, {duration: 0.03, frequency: 2200, volume: 0.04});
    tono(context, {from: 950, to: 1650, duration: 0.08, volume: 0.04});
}

export function sonidoCancelar() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    tono(context, {
        type: 'triangle',
        from: 720,
        to: 360,
        duration: 0.14,
        volume: 0.045,
    });
}

export function sonidoEnviando() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    tono(context, {from: 520, to: 880, start: 0, duration: 0.1, volume: 0.035});
    tono(context, {from: 780, to: 1320, start: 0.11, duration: 0.12, volume: 0.035});
}

export function sonidoExito() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    [523.25, 659.25, 783.99].forEach((frequency, index) => {
        tono(context, {
            from: frequency,
            start: index * 0.09,
            duration: 0.35,
            volume: 0.045,
        });
    });
}

export function sonidoListo() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    tono(context, {from: 1046.5, start: 0, duration: 0.1, volume: 0.04});
    tono(context, {from: 1567.98, start: 0.1, duration: 0.22, volume: 0.035});
}

export function sonidoJavita() {
    const context = contextoActivo();
    if (!context) {
        return;
    }

    tono(context, {from: 900, to: 1500, duration: 0.09, volume: 0.04});
    tono(context, {from: 1500, to: 1100, start: 0.08, duration: 0.1, volume: 0.035});
}

let aperturaReproducida = false;
let aperturaEsperandoGesto = false;

function efectoApertura(context) {
    tono(context, {from: 330, to: 495, start: 0, duration: 0.22, volume: 0.04});
    tono(context, {from: 495, to: 740, start: 0.16, duration: 0.32, volume: 0.035});
}

export function sonidoApertura() {
    if (aperturaReproducida) {
        return;
    }

    const context = getAudioContext();
    if (context?.state === 'running') {
        aperturaReproducida = true;
        efectoApertura(context);
        return;
    }

    if (!context || aperturaEsperandoGesto || typeof window === 'undefined') {
        return;
    }

    aperturaEsperandoGesto = true;
    const reintentar = async () => {
        window.removeEventListener('pointerdown', reintentar);
        window.removeEventListener('keydown', reintentar);
        aperturaEsperandoGesto = false;
        await activarAudio();
        sonidoApertura();
    };

    window.addEventListener('pointerdown', reintentar);
    window.addEventListener('keydown', reintentar);
}

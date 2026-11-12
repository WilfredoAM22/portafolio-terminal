let audioContext;

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

export async function activarAudio() {
    const context = getAudioContext();
    if (context?.state === 'suspended') {
        await context.resume();
    }
}

export function sonidoTecla() {
    const context = audioContext;
    if (!context || context.state !== 'running') {
        return;
    }

    const now = context.currentTime;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.05), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
        samples[index] = Math.random() * 2 - 1;
    }

    const noise = context.createBufferSource();
    const bandPass = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    bandPass.type = 'bandpass';
    bandPass.frequency.value = 2600 + Math.random() * 800;
    noiseGain.gain.setValueAtTime(0.055, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    noise.connect(bandPass).connect(noiseGain).connect(context.destination);
    noise.start(now);
    noise.stop(now + 0.05);

    const tone = context.createOscillator();
    const toneGain = context.createGain();
    tone.type = 'triangle';
    tone.frequency.value = 3200;
    toneGain.gain.setValueAtTime(0.012, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    tone.connect(toneGain).connect(context.destination);
    tone.start(now);
    tone.stop(now + 0.02);
}

export function sonidoEnter() {
    const context = audioContext;
    if (!context || context.state !== 'running') {
        return;
    }

    const now = context.currentTime;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.04), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
        samples[index] = Math.random() * 2 - 1;
    }

    const click = context.createBufferSource();
    const clickFilter = context.createBiquadFilter();
    const clickGain = context.createGain();
    click.buffer = buffer;
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 900;
    clickGain.gain.setValueAtTime(0.16, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    click.connect(clickFilter).connect(clickGain).connect(context.destination);
    click.start(now);
    click.stop(now + 0.04);

    [
        {frequency: 2093, volume: 0.045},
        {frequency: 3136, volume: 0.022},
    ].forEach(({frequency, volume}, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const startTime = now + index * 0.035;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.9);
    });
}

export function sonidoClear() {
    const context = audioContext;
    if (!context || context.state !== 'running') {
        return;
    }

    const now = context.currentTime;
    const noiseDuration = 0.4;
    const buffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * noiseDuration),
        context.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
        samples[index] = Math.random() * 2 - 1;
    }

    const noise = context.createBufferSource();
    const bandPass = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    bandPass.type = 'bandpass';
    bandPass.Q.value = 2;
    bandPass.frequency.setValueAtTime(3500, now);
    bandPass.frequency.linearRampToValueAtTime(500, now + 0.35);
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);
    noise.connect(bandPass).connect(noiseGain).connect(context.destination);
    noise.start(now);
    noise.stop(now + noiseDuration);

    const toneStart = now + noiseDuration;
    const tone = context.createOscillator();
    const toneGain = context.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(150, toneStart);
    tone.frequency.exponentialRampToValueAtTime(60, toneStart + 0.12);
    toneGain.gain.setValueAtTime(0.12, toneStart);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, toneStart + 0.12);
    tone.connect(toneGain).connect(context.destination);
    tone.start(toneStart);
    tone.stop(toneStart + 0.12);

    const clickStart = toneStart + 0.12;
    const click = context.createOscillator();
    const clickGain = context.createGain();
    click.type = 'sine';
    click.frequency.value = 700;
    clickGain.gain.setValueAtTime(0.12, clickStart);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, clickStart + 0.025);
    click.connect(clickGain).connect(context.destination);
    click.start(clickStart);
    click.stop(clickStart + 0.025);
}

export function sonidoError() {
    const context = audioContext;
    if (!context || context.state !== 'running') {
        return;
    }

    const now = context.currentTime;
    [
        {frequency: 220, start: now, duration: 0.14},
        {frequency: 165, start: now + 0.15, duration: 0.24},
    ].forEach(({frequency, start, duration}) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.05, start);
        gain.gain.setValueAtTime(0.05, start + duration - 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + duration);
    });

    const clickStart = now + 0.39;
    const click = context.createOscillator();
    const clickGain = context.createGain();
    click.type = 'sine';
    click.frequency.value = 500;
    clickGain.gain.setValueAtTime(0.05, clickStart);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, clickStart + 0.025);
    click.connect(clickGain).connect(context.destination);
    click.start(clickStart);
    click.stop(clickStart + 0.025);
}

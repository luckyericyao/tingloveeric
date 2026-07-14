"""Generate the original ambient loop used by the 3D love story."""

from array import array
import math
from pathlib import Path
import random
import wave

RATE = 22050
DURATION = 64
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "audio" / "our-night.wav"

CHORDS = [
    (130.81, 164.81, 196.00, 246.94),
    (110.00, 130.81, 164.81, 196.00),
    (87.31, 130.81, 174.61, 220.00),
    (98.00, 146.83, 196.00, 220.00),
]

BELLS = [
    (4.0, 392.00, -0.45),
    (8.0, 493.88, 0.35),
    (13.5, 659.25, 0.55),
    (20.0, 523.25, -0.35),
    (25.0, 392.00, 0.45),
    (30.5, 329.63, -0.55),
    (36.0, 493.88, 0.25),
    (41.0, 659.25, -0.25),
    (48.0, 587.33, 0.55),
    (53.0, 493.88, -0.45),
    (58.0, 392.00, 0.2),
]


def soft_edge(local_time: float, length: float = 16.0) -> float:
    attack = min(1.0, local_time / 2.8)
    release = min(1.0, (length - local_time) / 3.4)
    return max(0.0, min(attack, release))


def render() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    random.seed(520)
    samples = array("h")
    noise_state = 0.0

    for index in range(RATE * DURATION):
        time = index / RATE
        chord_index = min(len(CHORDS) - 1, int(time // 16))
        local_time = time - chord_index * 16
        chord = CHORDS[chord_index]
        chord_env = soft_edge(local_time)

        pad = 0.0
        for note_index, frequency in enumerate(chord):
            detune = 1.0 + (note_index - 1.5) * 0.0017
            phase = note_index * 0.63
            pad += math.sin(math.tau * frequency * detune * time + phase)
            pad += 0.34 * math.sin(math.tau * frequency * 0.5 * time + phase * 0.6)
        pad *= 0.038 * chord_env

        low = 0.055 * math.sin(math.tau * chord[0] * 0.5 * time) * chord_env
        breath = 0.018 * math.sin(math.tau * 0.075 * time) + 0.012 * math.sin(math.tau * 0.11 * time + 1.7)

        noise_state = noise_state * 0.994 + (random.random() * 2 - 1) * 0.006
        air = noise_state * 0.032

        bell_left = 0.0
        bell_right = 0.0
        for start, frequency, pan in BELLS:
            delta = time - start
            if 0 <= delta < 5.5:
                envelope = math.exp(-delta * 1.15) * min(1.0, delta * 8)
                bell = (
                    math.sin(math.tau * frequency * delta)
                    + 0.42 * math.sin(math.tau * frequency * 2.01 * delta)
                    + 0.16 * math.sin(math.tau * frequency * 3.98 * delta)
                ) * 0.052 * envelope
                bell_left += bell * (1 - pan) * 0.5
                bell_right += bell * (1 + pan) * 0.5

        master = min(1.0, time / 4.0, (DURATION - time) / 5.0)
        shimmer = 0.012 * math.sin(math.tau * (740 + 8 * math.sin(time * 0.17)) * time)
        left = (pad + low + breath + air + shimmer + bell_left) * master
        right = (pad * 0.97 + low + breath * 0.94 - air + shimmer * 0.8 + bell_right) * master

        samples.append(max(-32767, min(32767, int(left * 32767))))
        samples.append(max(-32767, min(32767, int(right * 32767))))

    with wave.open(str(OUTPUT), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(samples.tobytes())

    print(OUTPUT)


if __name__ == "__main__":
    render()

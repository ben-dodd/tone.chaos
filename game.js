let keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

let modes = [
  { name: 'Ionian (Natural Major)', notes: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Dorian', notes: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Phyrgian', notes: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Lydian', notes: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Mixolydian', notes: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Aeolian (Natural Minor)', notes: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Locrian', notes: [0, 1, 3, 5, 6, 8, 10] },
]

let scaleKey = ''
let notes = []

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

function createRandomScale() {
  let mode = modes[random(0, modes.length)]
  let keyIndex = random(0, keys.length)
  scaleKey = keys[keyIndex]
  let modeNotes = mode.notes.map((index) => (index + keyIndex) % 12)
  notes = []
  modeNotes.forEach((modeNote) => notes.push(`${keys[modeNote]}`))
  console.log(notes)
  randomiseNotes()
  document.getElementById('scale-name').innerText = `${scaleKey} ${mode.name}`
}

function randomiseNotes() {
  notes.sort(() => Math.random() - 0.5)
}

function createRandomVoice(synth) {
  // Change oscillator.type
  synth.oscillator.type = `${
    ['sine', 'square', 'sawtooth', 'triangle'][random(0, 4)]
  }${random(0, 8)}`
  // Change harmonicity
  synth.harmonicity = random(5, 40) / 10
  // Change detune
  synth.detune = random(-100, 100)
  // Change modulation index
  synth.modulation = random(0, 100)
  // Change envelope.attack
  synth.envelope.attack = random(1, 200) / 100
  // Change envelope.decay
  synth.envelope.decay = random(1, 300) / 100
  // Change envelope.sustain
  synth.envelope.sustain = random(1, 100) / 100
  // Change envelope.release
  synth.envelope.release = random(1, 1000) / 100
  // Change modulation.type
  synth.modulation.type = `${
    ['sine', 'square', 'sawtooth', 'triangle'][random(0, 4)]
  }`
  // Change modulation.attack
  synth.modulation.attack = random(1, 200) / 100
  // Change modulation.decay
  synth.modulation.decay = random(1, 300) / 100
  // Change modulation.sustain
  synth.modulation.sustain = random(1, 100) / 100
  // Change modulation.release
  synth.modulation.release = random(1, 300) / 100
}

document.querySelectorAll('.key').forEach((key, i) => {
  const height = key.clientHeight
  const width = key.clientWidth
  const synth = new Tone.FMSynth({ volume: -6 - i }).toDestination()
  createRandomVoice(synth)
  const panner = new Tone.Panner(0).toDestination()
  const crusher = new Tone.BitCrusher(4).toDestination()
  const reverb = new Tone.Reverb(i + 2).toDestination()
  synth.connect(crusher)
  synth.connect(panner)
  synth.connect(reverb)

  let note = ''

  key.addEventListener('mouseover', () => {
    note =
      i === 0
        ? `${scaleKey}1`
        : `${notes[i % notes.length]}${Math.ceil(i / 3) + 1}`
    const now = Tone.now()
    synth.triggerAttack(note, now)
  })
  key.addEventListener('mouseout', () => {
    const now = Tone.now()
    i === 0 ? synth.triggerRelease(now + 3) : synth.triggerRelease(now)
  })
  key.addEventListener('mousemove', (e) => {
    // if (i === 0) filter.frequency.value = Math.abs(16000 * (e.offsetY / height))
    let bits = Math.round(15 * (e.offsetY / height) + 1)
    if (bits < 1) bits = 1
    if (bits > 16) bits = 16
    crusher.bits.value = bits
    let pan = 2 * (e.offsetX / width) - 1
    if (pan < -1) pan = -1
    if (pan > 1) pan = 1
    panner.pan.value = pan
    e.target.innerHTML = `[${note}] Bit Depth: ${bits} / Pan: ${pan.toFixed(2)}`
    // e.target.innerHTML = `Bit Depth: ${bits} / Low Pass Filter: ${filter.frequency.value.toFixed(
    //   0
    // )} Hz / Pan: ${pan.toFixed(2)}`
  })
  key.addEventListener('dblclick', createRandomScale)
  key.addEventListener('click', () => createRandomVoice(synth))
})

createRandomScale()

// Tone.BufferSource.prototype.start = function (time, offset, duration, gain) {
//   // Prevent buffer playback if we have exceeded max # buffers playing
//   // (or if there's no volume... what's the point?
//   if (_playingBuffers.length >= MAX_BUFFERS || gain <= 0) return this

//   // // shut down the samples FIFO-style
//   // while (_playingBuffers.length >= MAX_POLYPHONY){
//   // 	let oldestSampleSource = _playingBuffers.shift(); // pulls it off early - onended won't find it
//   // 	oldestSampleSource.stop(Tone.now());
//   // 	//console.log("stopping", oldestSampleSource);
//   // }

//   _playingBuffers.push(this)
//   _numPlayedNotesThisInterval++

//   this.onended = function (buffer) {
//     buffer.dispose()
//     let index = _playingBuffers.indexOf(buffer)
//     if (index > -1) {
//       _playingBuffers.splice(index, 1)
//     }
//   }

//   return bufferSourceStart.bind(this)(time, offset, duration, gain)
// }

//                                         //
//    tone.chaos by ben dodd               //
//    a noise thingy built with Tone.js    //
//                                         //

// setup modes and keys
const keys = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const modes = [
  { name: 'Ionian (Natural Major)', notes: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Dorian', notes: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Phyrgian', notes: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Lydian', notes: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Mixolydian', notes: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Aeolian (Natural Minor)', notes: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Locrian', notes: [0, 1, 3, 5, 6, 8, 10] },
]

// set game variables
let scaleKey = '' // current key
let notes = [] // list of notes in scale
let playing = false // enable/disable playing

// randomiser function
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

// create a random scale
function createRandomScale() {
  let mode = modes[random(0, modes.length)] // get a random mode
  let keyIndex = random(0, keys.length) // get a random key
  scaleKey = keys[keyIndex] // set the key
  let modeNotes = mode.notes.map((index) => (index + keyIndex) % 12) // set the indexes for the mode
  notes = [] // initialise the notes array
  modeNotes.forEach((modeNote) => notes.push(`${keys[modeNote]}`)) // add the notes
  randomiseNotes() // put the notes in a random order
  document.getElementById('scale-name').innerText = `${scaleKey} ${mode.name}` // set the label to the current key and mode
}

// this function randomises the notes
function randomiseNotes() {
  notes.sort(() => Math.random() - 0.5)
}

// this function creates a random FM synth
function createRandomVoice(synth) {
  // Change oscillator.type
  synth.oscillator.type = `${
    ['sine', 'square', 'sawtooth', 'triangle'][random(0, 4)]
  }`
  // Change harmonicity (ratio between the two FM voices)
  synth.harmonicity = random(5, 40) / 10
  // Change detune (in cents)
  synth.detune = random(-100, 100)
  // Change modulation index (depth/amount of modulation)
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

// Setup Tones for each key
document.querySelectorAll('.key').forEach((key, i) => {
  // Get height and width for moving around key
  const height = key.clientHeight
  const width = key.clientWidth
  // Create a new FM synth. Higher keys are quieter.
  const synth = new Tone.FMSynth({ volume: -6 - i }).toDestination()
  createRandomVoice(synth)
  // Add filters and connect to the synth
  const panner = new Tone.Panner(0).toDestination()
  const crusher = new Tone.BitCrusher(4).toDestination()
  const reverb = new Tone.Reverb(i + 2).toDestination()
  synth.connect(crusher)
  synth.connect(panner)
  synth.connect(reverb)
  tones.push(synth)

  let note = ''

  key.addEventListener('mouseover', () => {
    if (playing) {
      // Get the note to play
      note =
        i === 0
          ? `${scaleKey}1`
          : `${notes[i % notes.length]}${Math.ceil(i / 3) + 1}`
      const now = Tone.now()
      // Play note
      synth.triggerAttack(note, now)
    }
  })

  // End note when you leave the key
  key.addEventListener('mouseout', () => {
    const now = Tone.now()
    i === 0 ? synth.triggerRelease(now + 3) : synth.triggerRelease(now)
  })

  // Change filters when you move within the key
  key.addEventListener('mousemove', (e) => {
    let bits = Math.round(15 * (e.offsetY / height) + 1)
    if (bits < 1) bits = 1
    if (bits > 16) bits = 16
    crusher.bits.value = bits
    let pan = 2 * (e.offsetX / width) - 1
    if (pan < -1) pan = -1
    if (pan > 1) pan = 1
    panner.pan.value = pan
    // Show variables in the key
    e.target.innerHTML = `[${note}] Bit Depth: ${bits} / Pan: ${pan.toFixed(2)}`
  })

  // Double click to get a new random key and mode
  key.addEventListener('dblclick', (e) => {
    e.preventDefault()
    createRandomScale()
  })

  // Click to get a new FM synth voice
  key.addEventListener('click', (e) => {
    e.preventDefault()
    createRandomVoice(synth)
  })
})

// Click button to start. Browsers won't allow audio to start on hover.
document.getElementById('button').addEventListener('click', async (e) => {
  const playBar = document.getElementById('play-bar')
  if (playing) {
    // Stop noise and disable keys
    playing = false
    tones.forEach((tone, i) => {
      tone.oscillator.stop()
    })
    e.target.innerHTML = 'BEGIN NOISE'
    playBar.classList.remove('playing')
  } else {
    // Start noise and enable keys
    await Tone.start()
    tones.forEach((tone, i) => tone.oscillator.start())
    playing = true
    e.target.innerHTML = 'NOISE OFF'
    playBar.classList.add('playing')
  }
})

// Get a random scale to start
createRandomScale()

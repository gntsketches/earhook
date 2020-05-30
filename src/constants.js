export const scales = {
  c_major: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C8'],
  c_minor: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb', 'C8'],
  c_chromatic: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C8'],
};

export const keyToNote = {
  c_major: {
    'a': 'C', 's': 'D', 'd': 'E', 'f': 'F', 'g': 'G', 'h': 'A', 'j': 'B', 'k': 'C8', 'l': 'A', ';': 'B', "'": 'C8',
    'w': 'C#', 'e': 'D#', 't': 'F#', 'y': 'G#', 'u': 'A#', 'o': 'G#', 'p': 'A#',
  },
  c_minor: {
    'a': 'C', 's': 'D', 'd': 'E', 'f': 'F', 'g': 'G', 'h': 'A', 'j': 'B', 'k': 'C8', 'l': 'A', ';': 'B', "'": 'C8',
    'w': 'Db', 'e': 'Eb', 't': 'Gb', 'y': 'Ab', 'u': 'Bb', 'o': 'Ab', 'p': 'Bb',
  },
  c_chromatic: {
    'a': 'C', 's': 'D', 'd': 'E', 'f': 'F', 'g': 'G', 'h': 'A', 'j': 'B', 'k': 'C8', 'l': 'A', ';': 'B', "'": 'C8',
    'w': 'C#', 'e': 'D#', 't': 'F#', 'y': 'G#', 'u': 'A#', 'o': 'G#', 'p': 'A#',
  },

}

export const keyButtonLayouts = {
  // 'none' means that for this root, the note is not used in that scale (eg: C# in c_major)
  // 'null' means that the note should not have a rendering position for that root (eg: E# in c_major)
  c_major: {
    accidentals: ['off', 'off', 'none', 'off', 'off', 'off', ],
    naturals: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C8']
  },
  c_minor: {
    accidentals: ['off', 'Eb', 'none', 'off', 'Ab', 'Bb'],
    naturals: ['C', 'D', 'off', 'F', 'G', 'off', 'off', 'C8']
  },
  c_chromatic: {
    accidentals: ['C#', 'D#', 'none', 'F#', 'G#', 'A#'],
    naturals: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C8']
  }
}


// export const limits = {
//   noteCallWait: 4000,
//   callCountLimit: 3,
//   sameCallLimit: 2,
//   newLevelNoteMatchesToNextLevel: 8,
// }
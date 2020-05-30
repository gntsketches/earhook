export const scales = {
  c_major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  c_minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
};

export const keyToNote = {
  'a': 'C4',
  's': 'D4',
  'd': 'E4',
  'f': 'F4',
  'g': 'G4',
  'h': 'A4',
  'j': 'B4',
  'k': 'C5',
  'l': 'A4',
  ';': 'B4',
  "'": 'C5',
}

export const keyButtonLayouts = {
  // 'off' means that for this root, the note is not used in that scale (eg: C# in c_major)
  // 'null' means that the note should not have a rendering position for that root (eg: E# in c_major)
  c_major: {
    accidentals: ['off', 'off', null, 'off', 'off', 'off', ],
    naturals: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
  },
  c_minor: {
    accidentals: ['off', 'Eb', null, 'off', 'Ab', 'Bb'],
    naturals: ['C', 'D', 'off', 'F', 'G', 'off', 'off', 'C']
  }
}


// export const limits = {
//   noteCallWait: 4000,
//   callCountLimit: 3,
//   sameCallLimit: 2,
//   newLevelNoteMatchesToNextLevel: 8,
// }
import { keyToNote } from "./constants"

let spacebarDown = false  // note use of file scope

export function addListeners(scope) {
  document.addEventListener('keydown', function(e) {
      const keyToNoteByScale = keyToNote[scope.state.currentScale]
      if (e.key === ' ' && !spacebarDown) {
        spacebarDown = true
        scope.startStop()
      }
      else if (e.key in keyToNoteByScale) {
        scope.checkPressed(keyToNoteByScale[e.key], 'down')
      }
  })

  document.addEventListener('keyup', function(e) {
    const keyToNoteByScale = keyToNote[scope.state.currentScale]
    if (e.key === ' ' && spacebarDown) {
      spacebarDown = false
    }
    else if (e.key in keyToNoteByScale) {
      scope.checkPressed(keyToNoteByScale[e.key], 'up')
    }
  })
}



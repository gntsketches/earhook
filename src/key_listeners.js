import { keyToNote } from "./constants"

let spacebarDown = false  // note use of file scope

export function addListeners(scope) {
  document.addEventListener('keydown', function(e) {
      if (e.key === ' ' && !spacebarDown) {
        spacebarDown = true
        scope.startStop()
      }
      else if (e.key in keyToNote) {
        scope.checkPressed(keyToNote[e.key], 'down')
      }
  })

  document.addEventListener('keyup', function(e) {
    if (e.key === ' ' && spacebarDown) {
      spacebarDown = false
    }
    else if (e.key in keyToNote) {
      scope.checkPressed(keyToNote[e.key], 'up')
    }
  })
}



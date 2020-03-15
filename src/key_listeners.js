import { keyToNote } from "./constants"

export function addListeners(scope) {
  console.log('scope', scope)
  document.addEventListener('keydown', function(e) {
    console.log(e.key)
    if (e.key === ' ') {
      scope.startStop()
    }
    else if (e.key in keyToNote) {
      scope.sendResponse(keyToNote[e.key])
    }
  })
}


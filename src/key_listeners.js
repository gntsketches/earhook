import { keyToNote } from "./constants"

let down = []
// use of file scope, but cleaner than another call to setState

export function addListeners(scope) {
  document.addEventListener('keydown', function(e) {
    // console.log('down', down)
    if (down.indexOf(e.key) === -1) {
      down.push(e.key)
      if (e.key === ' ') {
        scope.startStop()
      }
      else if (e.key in keyToNote) {
        scope.sendResponse(keyToNote[e.key])
      }
    }
  })

  document.addEventListener('keyup', function(e) {
      // console.log('down', down)
    if (down.indexOf(e.key) > -1) {
      down = down.filter(k => k !== e.key)
    }
  })
}


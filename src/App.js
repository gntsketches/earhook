import React from 'react'
import Tone from "tone"
import ReactTimeout from 'react-timeout'

import './reset.css'
import './global.css'
import './App.css'

import { scales, keyButtonLayouts} from "./constants"
import { addListeners } from "./key_listeners"

class App extends React.Component {

  // LIFECYCLE
  // ---------------------------------------------------------------------------------
  constructor() {
    super();

    this.caller = new Tone.Synth().toMaster()
    this.responder = new Tone.Synth().toMaster()

    this.state = {
      appStarted: false,
      noteCallWait: 4000,
      acceptMatchesUpdate: false,
      pickNewCallNote: false,
      callNote: 'C',
      octave: 3,
      callCount: 0,
      callCountLimit: 3,
      sameCallCount: 0,
      sameCallLimit: 2,
      newLevelNoteMatches: 0,
      newLevelNoteMatchesToNextLevel: 8,  // REALLY? That's what you're calling it?
      noteCalledTime: null,
      callerTimeout: null,
      responseNote: null,
      matchStyle: false,  // matchSplash
      missStyle: false,  // missSplash
      pressed: [],
      centerpieceSplash: false,
      showCalledNoteSplashes: false,  // for "training wheels"
      calledNoteSplash: false,
      // showTutorialModal: false,

      currentScale: 'c_major',
      // currentScale: 'c_minor',
      // currentScale: 'c_chromatic',
      levelTracking: {
        c_major: {
          level: 3,
          matchCounts: [
            { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 },
            { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 },
          ],
        },
        c_minor: {
          level: 3,
          matchCounts: [
            null,
            null,
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
          ],
        },
        c_chromatic: {
          level: 3,
          matchCounts: [
            null, null, { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 },
            { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 },
            { miss: 0, match: 0 }, { miss: 0, match: 0 }, { miss: 0, match: 0 },
            { miss: 0, match: 0 },
          ],
        },
      },
    }
  }

  componentDidMount() {
    addListeners(this)
  }


  // RENDER
  // ---------------------------------------------------------------------------------

  renderNoteDisplay(zone) {
    const { pressed, callNote, calledNoteSplash, currentScale  } = this.state
    const notes = keyButtonLayouts[currentScale][zone]

    // console.log('render pressed', pressed)
    // console.log('activeNotes', this.activeNotes)
    const noteDisplay = notes.map((note, index) => {
      // console.log('note', note)
      const noteDisplay = note.includes('8') ? note.slice(0,-1) : note
      const downStyle = pressed.includes(note) ? 'down' : ''
      const splashStyle = calledNoteSplash && note === callNote ? 'splash' : ''
      if (note === 'none') return <div className="note none" key={`${zone}${index}`} />
      if (this.activeNotes.includes(note)) {
        return (
          <div
            className={`note ${downStyle} ${splashStyle}`}
            key={`${zone}${index}`}
            onMouseDown={() => this.checkPressed(note, 'down')}
            onMouseUp={() => this.checkPressed(note, 'up')}
          >
            <h2>{noteDisplay === 'off' ? '' : noteDisplay}</h2>
          </div>
        )
      } else {
        return <div className="note inactive" key={`${zone}${index}`} />
      }
    })

    return noteDisplay
  }

  render() {
    const {
      appStarted, sameCallLimit, levelTracking, currentScale,
      matchStyle, missStyle, centerpieceSplash, showCalledNoteSplashes
    } = this.state
    // console.log('matchStyle', matchStyle, 'missStyle', missStyle)
    // console.log('currentScaleMatchCounts', this.currentScaleMatchCounts)
    // console.log('currentLevel', this.currentLevel)
    const matchSplash = matchStyle  && !showCalledNoteSplashes ? 'splash' : ''
    const missSplash = missStyle && !showCalledNoteSplashes ? 'splash' : ''
    const greyMatches = showCalledNoteSplashes ? 'grey-matches' : ''

    return (
      <div className="app">

        <header className="app-header">
          <div className="header-left">
            <h4>{currentScale} scale, {levelTracking[currentScale].level} notes</h4>
          </div>
          <div className="header-right">
            <h4>same call limit: {sameCallLimit}</h4>
            <h4
              className="toggle-note-splash"
              onClick={this.toggleCalledNoteSplashes}
            >{showCalledNoteSplashes ? 'Hide called notes' : 'Show called notes'}</h4>
          </div>
        </header>

        <div
          className={appStarted ? 'start-n-splash pulse' : 'start-n-splash'}
        >
          <div className={`match-count ${matchSplash} ${greyMatches}`}>
            Match: {this.currentMatchCount.match}
          </div>
          <div
              className={centerpieceSplash ? 'start-stop centerpiece-splash' : 'start-stop'}
              onClick={this.startStop} >
            <h2>{ appStarted ? 'Stop' : 'Start' }</h2>
          </div>
          <div className={`miss-count ${missSplash} ${greyMatches}`}>
            Miss: {this.currentMatchCount.miss}
          </div>
        </div>

        <div className="note-zone">
          <div className="accidentals">
            {this.renderNoteDisplay('accidentals')}
          </div>
          <div className="naturals">
            {this.renderNoteDisplay('naturals')}
          </div>
        </div>
      </div>
    )
  }


  // GETTERS & HELPERS
  // ---------------------------------------------------------------------------------
  get activeNotes() {
    const { currentScale, levelTracking } = this.state
    const currentScaleNotes = scales[currentScale]
    const currentScaleLevel = levelTracking[currentScale].level
    return currentScaleNotes.filter((note, index) => index < currentScaleLevel)
  }

  get currentLevel() {
    const { currentScale, levelTracking } = this.state
    // console.log('levelTracking[currentScale.level]', levelTracking[currentScale].level)
    return levelTracking[currentScale].level
  }

  get currentMatchCount() {
    const { currentScale, levelTracking } = this.state
    // const currentLevel = levelTracking[currentScale].level
    // return levelTracking[currentScale].matchCounts[currentLevel-1]
    return levelTracking[currentScale].matchCounts[this.currentLevel-1]
  }

  pickCallNote() {
    const { callNote, sameCallCount, sameCallLimit } = this.state
    const notes = this.activeNotes
    let pick
    do {
      pick = notes[Math.floor(Math.random()*notes.length)]
    } while (sameCallCount >= sameCallLimit-1 && pick === callNote)
    if (sameCallCount >= sameCallLimit-1) {
      this.setState({sameCallCount: 0})
    } else {
      this.setState({sameCallCount: sameCallCount+1})
    }
    // console.log('pick', pick)
    return pick
  }

  toggleCalledNoteSplashes = () => {
    const { showCalledNoteSplashes } = this.state
    if (showCalledNoteSplashes) {
      this.setState({ showCalledNoteSplashes: false })
    } else {
      this.setState({ showCalledNoteSplashes: true })
      window.alert('Called-note highlighting is a "training wheels" feature. ' +
        'It disables match/miss tally and level advancement.')
    }
  }

  // PLAY
  // ---------------------------------------------------------------------------------

  startStop = () => {
    const { appStarted } = this.state

    if (appStarted) {
      this.setState({
        appStarted: false,
        callCount: 0,
      })
    } else {
      this.setState({ appStarted: true }, () => { this.sendCall() })
    }
  }

  checkPressed = (note, downOrUp) => {
    const { pressed } = this.state
    // console.log('checkPressed', pressed)
    if (pressed.indexOf(note) === -1 && downOrUp === 'down') {
      const newPressed = [ ...pressed, note]
      this.setState({ pressed: newPressed}, () => this.sendResponse(note))
    } else if (downOrUp === 'up') {
      const newPressed = pressed.filter(n => n !== note)
      this.setState({ pressed: newPressed })
    }
  }

  sendCall = () => {
    // console.log('sendCall')
    const { setTimeout, clearTimeout } = this.props
    const {
      appStarted, pickNewCallNote, noteCallWait, callCount, callCountLimit,
      callerTimeout, showCalledNoteSplashes, octave,
    } = this.state
    let { callNote } = this.state

    clearTimeout(callerTimeout)

    if (callCount >= callCountLimit) {
      this.startStop()
      return
    }

    if (pickNewCallNote) { callNote = this.pickCallNote() }

    const playableCallNote = callNote.includes('8') ? callNote.slice(0,-1) + (octave+1) : callNote + octave

    if (appStarted) {
      this.setState({
        appStarted: true,
        callNote: callNote,
        callCount: callCount+1,
        acceptMatchesUpdate: true,
        noteCalledTime: Date.now(),
        centerpieceSplash: true,
        calledNoteSplash: showCalledNoteSplashes,
        callerTimeout: setTimeout(this.sendCall, noteCallWait)
      }, () => {
        // console.log('timeout', this.state.callerTimeout)
        this.caller.triggerAttackRelease(playableCallNote, '8n')
        setTimeout(() => {
          this.setState({ centerpieceSplash: false, calledNoteSplash: false })
        }, 300)
      })
    }
  }

  sendResponse = (note) => {
    // console.log('sendResponse', note)
    const {
      acceptMatchesUpdate, callNote, noteCalledTime, callerTimeout, octave,
      currentScale, levelTracking, newLevelNoteMatches, showCalledNoteSplashes,
    } = this.state
    const { setTimeout } = this.props;

    // play back your note
    clearTimeout(callerTimeout)

    const playableNote = note.includes('8') ? note.slice(0,-1) + (octave+1) : note + octave

    this.responder.triggerAttackRelease(playableNote, '8n')

    if (this.state.appStarted) {

      // set up identifiers
      const newMatchCount = { ...this.currentMatchCount }
      let setPickNewCallNote
      let matchSplash = false
      let missSplash = false
      let newLevelNoteIncrement = 0

      // test match and update identifiers
      if (note === callNote) {
        newMatchCount.match = this.currentMatchCount.match + 1
        setPickNewCallNote = true
        matchSplash = true
        if (note === this.activeNotes[this.activeNotes.length-1]) {
          newLevelNoteIncrement = 1
          // console.log('newLevelNoteMatch', note)
        }
      } else {
        newMatchCount.miss = this.currentMatchCount.miss + 1
        setPickNewCallNote = false
        missSplash = true
      }
      const responseInterval = Date.now() - noteCalledTime

      //  update the current match status
      const newLevelTracking = { ...levelTracking }
      // console.log('acceptMatchesUpdate', acceptMatchesUpdate)
      if (acceptMatchesUpdate && !showCalledNoteSplashes) {
        newLevelTracking[currentScale].matchCounts[this.currentLevel-1] = newMatchCount
      }

      this.setState({
        responseNote: note,  // is this being used...?
        pickNewCallNote: setPickNewCallNote,
        acceptMatchesUpdate: false,
        callCount: 0,
        matchStyle: matchSplash,
        missStyle: missSplash,
        newLevelNoteMatches: newLevelNoteMatches + newLevelNoteIncrement,
        responseReceivedTime: Date.now(),
        callerTimeout: setTimeout(this.sendCall, responseInterval),
        matchCounts: newLevelTracking,
      }, () => {
        setTimeout(() => { this.setState({ matchStyle: false, missStyle: false }) }, 300)
        this.checkForAdvance()
      })
    }
  }

  checkForAdvance() {
    const {
      currentScale, levelTracking, newLevelNoteMatches, newLevelNoteMatchesToNextLevel
    } = this.state
    const { level, matchCounts } = levelTracking[currentScale]
    const counts = matchCounts[level-1]
    const { match, miss } = counts
    const matchToMissRatio = match/miss
    // console.log('match/miss', matchToMissRatio)
    if (match > 10
      && (miss === 0 || matchToMissRatio > 10)
      && newLevelNoteMatches >= newLevelNoteMatchesToNextLevel
    ) {
      // console.log('leveling up')
      const newLevelTracking = { ...levelTracking }
      newLevelTracking[currentScale].level += 1
      this.setState({
        levelTracking: newLevelTracking,
        newLevelNoteMatches: 0,
      })
    }
  }

}



export default ReactTimeout(App);

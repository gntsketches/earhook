import React from 'react'
import Tone from "tone"
import ReactTimeout from 'react-timeout'

import './reset.css'
import './global.css'
import './App.css'

import { scales } from "./constants"
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
      callNote: 'C4',
      callCount: 0,
      callCountLimit: 3,
      sameCallCount: 0,
      sameCallLimit: 2,
      newLevelNoteMatches: 0,
      newLevelNoteMatchesToNextLevel: 8,  // REALLY? That's what you're calling it?
      noteCalledTime: null,
      callerTimeout: null,
      responseNote: null,
      matchStyle: false,
      missStyle: false,
      pressed: [],
      showCalled: false,  // for "training wheels"
      // showTutorialModal: false,

      currentScale: 'major',
      levelTracking: {
        major: {
          level: 2,
          matchCounts: [
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
          ],
        },
        minor: {
          level: 3,
          matchCounts: [
            null,
            null,
            { miss: 0, match: 0 },
            { miss: 0, match: 0 },
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
  renderNoteDisplay() {
    const { pressed } = this.state
    // console.log('render pressed', pressed)
    const notes = this.activeNotes
    const noteDisplay = notes.map((note, index) => {
      return (
        <div
          className={pressed.includes(note) ? 'note down' : 'note'}
          key={note}
          // onClick={() => this.sendResponse(note)}
          onMouseDown={() => this.checkPressed(note, 'down')}
          onMouseUp={() => this.checkPressed(note, 'up')}
        >
          <h1>{note}</h1>
        </div>
      )
    })
    return noteDisplay
  }

  render() {
    const { appStarted, sameCallLimit, levelTracking, currentScale, matchStyle, missStyle } = this.state
    // console.log('matchStyle', matchStyle, 'missStyle', missStyle)
    // console.log('currentScaleMatchCounts', this.currentScaleMatchCounts)
    // console.log('currentLevel', this.currentLevel)
    return (
      <div className="app">

        <header className="app-header">
          <div className="header-left">
            <h4>{currentScale} scale, {levelTracking[currentScale].level} notes</h4>
          </div>
          <div className="header-right">
            <h4>same call limit: {sameCallLimit}</h4>
          </div>
        </header>

        <div
          className={appStarted ? 'start-n-splash pulse' : 'start-n-splash'}
        >
          <div className={matchStyle ? 'match-count splash' : 'match-count'}>
            Match: {this.currentMatchCount.match}
          </div>
          <div
              className="start-stop"
              onClick={this.startStop} >
            <h2>{ appStarted ? 'Stop' : 'Start' }</h2>
          </div>
          <div className={missStyle ? 'miss-count splash' : 'miss-count'}>
            Miss: {this.currentMatchCount.miss}
          </div>
        </div>

        <div className="note-zone">
          {this.renderNoteDisplay()}
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
    const {
      appStarted, pickNewCallNote, noteCallWait, callCount, callCountLimit, callerTimeout
    } = this.state
    let { callNote } = this.state
    const { setTimeout, clearTimeout } = this.props

    clearTimeout(callerTimeout)

    if (callCount >= callCountLimit) {
      this.startStop()
      return
    }

    if (pickNewCallNote) {
      callNote = this.pickCallNote()
    }

    if (appStarted) {
      this.setState({
        appStarted: true,
        callNote: callNote,
        callCount: callCount+1,
        acceptMatchesUpdate: true,
        noteCalledTime: Date.now(),
        callerTimeout: setTimeout(this.sendCall, noteCallWait)
      }, () => {
        // console.log('timeout', this.state.callerTimeout)
        this.caller.triggerAttackRelease(callNote, '8n')
      })
    }
  }

  sendResponse = (note) => {
    // console.log('sendResponse', note)
    const {
      acceptMatchesUpdate, callNote, noteCalledTime, callerTimeout,
      currentScale, levelTracking, newLevelNoteMatches
    } = this.state
    const { setTimeout } = this.props;

    // play back your note
    clearTimeout(callerTimeout)
    this.responder.triggerAttackRelease(note, '8n')

    if (this.state.appStarted) {

      // set up identifiers
      const newMatchCount = { ...this.currentMatchCount }
      let setPickNewCallNote = false
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
          console.log('newLevelNoteMatch', note)
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
      if (acceptMatchesUpdate) {
        newLevelTracking[currentScale].matchCounts[this.currentLevel-1] = newMatchCount
      }

      this.setState({
        responseNote: note,
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

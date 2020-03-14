import React from 'react'
import Tone from "tone"
import ReactTimeout from 'react-timeout'

import './reset.css'
import './global.css'
import './App.css'

import { scales } from "./constants"

class App extends React.Component {
  constructor() {
    super();

    this.caller = new Tone.Synth().toMaster()
    this.responder = new Tone.Synth().toMaster()

    this.state = {
      appStarted: false,
      noteCallWait: 4000,
      calledNote: 'C4',
      // showCalled: false,  // for "training wheels"
      noteCalledTime: null,
      callerTimeout: null,
      responseNote: null,
      matchStyle: false,
      missStyle: false,
      // responseReceivedTime: null,
      // maxNoteCallWait: 5000,

      currentScale: 'major',
      levelTracking: {
        major: {
          level: 2,
          matchCounts: [
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


  // GETTERS
  // _________________________________________________________________________________
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

  get currentScaleMatchCounts() {
    const { currentScale, levelTracking } = this.state
    return levelTracking[currentScale].matchCounts
  }


  // UI
  // _________________________________________________________________________________
  pickCallNote() {
    const notes = this.activeNotes
    const pick = notes[Math.floor(Math.random()*notes.length)]
    // console.log('pick', pick)
    return pick
  }

  startStop = () => {
    const { appStarted } = this.state

    if (appStarted) {
      this.setState({ appStarted: false })
    } else {
      this.setState({ appStarted: true }, () => { this.sendCall() })
    }
  }

  sendCall = () => {
    const { appStarted, calledNote, noteCallWait, callerTimeout } = this.state
    const { setTimeout, clearTimeout } = this.props

    if (appStarted) {
      clearTimeout(callerTimeout)
      this.setState({
        appStarted: true,
        noteCalledTime: Date.now(),
        callerTimeout: setTimeout(this.sendCall, noteCallWait)
      }, () => {
        // console.log('timeout', this.state.callerTimeout)
        this.caller.triggerAttackRelease(calledNote, '8n')
      })
    }
  }

  sendResponse = (note) => {
    const { calledNote, noteCalledTime, callerTimeout, currentScale, levelTracking, playerLevel } = this.state
    const { setTimeout } = this.props;

    // play back your note
    clearTimeout(callerTimeout)
    this.responder.triggerAttackRelease(note, '8n')

    if (this.state.appStarted) {

      // test match and update level data
      const currentMatchCount = this.currentScaleMatchCounts[this.currentLevel]
      console.log('currentMatchCount', currentMatchCount)
      const newMatchCount = { ...currentMatchCount }
      let newCalledNote
      let matchSplash = false
      let missSplash = false
      if (note === calledNote) {
        newMatchCount.match = currentMatchCount.match + 1
        newCalledNote = this.pickCallNote()
        matchSplash = true
      } else {
        newMatchCount.miss = currentMatchCount.miss + 1
        newCalledNote = calledNote
        missSplash = true
      }
      // const newMatchCounts = [ ...matchCounts ]
      const newLevelTracking = { ...levelTracking }
      newLevelTracking[currentScale].matchCounts[this.currentLevel] = newMatchCount

      //  set response timing
      const responseInterval = Date.now() - noteCalledTime

      this.setState({
        responseNote: note,
        calledNote: newCalledNote,
        matchStyle: matchSplash,
        missStyle: missSplash,
        responseReceivedTime: Date.now(),
        callerTimeout: setTimeout(this.sendCall, responseInterval),
        matchCounts: newLevelTracking,
      }, () => { setTimeout(() => { this.setState({ matchStyle: false, missStyle: false }) }, 300)
      })
    }
  }


  // RENDER
  // _________________________________________________________________________________
  renderNoteDisplay() {
    const notes = this.activeNotes
    const noteDisplay = notes.map((note, index) => {
      return (
        <div
          key={note}
          style={{
            width: '100px', height: '100px',
            background: 'blue',
            color: 'white',
            margin: '10px',
            borderRadius: '5px',
            cursor: 'pointer', userSelect: 'none',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
          onClick={() => this.sendResponse(note)}
        >
          <h1>{note}</h1>
        </div>
      )
    })
    return noteDisplay
  }

  render() {
    const { appStarted, matchCounts, matchStyle, missStyle } = this.state
    // console.log('matchStyle', matchStyle, 'missStyle', missStyle)
    console.log('currentScaleMatchCounts', this.currentScaleMatchCounts)
    console.log('currentLevel', this.currentLevel)
    const currentMatchCount = this.currentScaleMatchCounts[this.currentLevel]
    return (
      <div className="app">

        <header className="app-header">
          <div className={matchStyle ? 'match-count splash' : 'match-count'}>
            Match: {currentMatchCount.match}
          </div>
          <div
            style={{
              width: '200px', height: '75px',
              background: 'green', color: 'white',
              borderRadius: '5px',
              cursor: 'pointer', userSelect: 'none',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            onClick={this.startStop}
          >
            <h2>{ appStarted ? 'Stop' : 'Start' }</h2>
          </div>
          <div className={missStyle ? 'miss-count splash' : 'miss-count'}>
            Miss: {currentMatchCount.miss}
          </div>
        </header>

        <div className="note-row">
          {this.renderNoteDisplay()}
        </div>
      </div>
    )
  }
}

export default ReactTimeout(App);

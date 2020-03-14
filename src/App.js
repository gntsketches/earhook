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
      showAdvanceModal: false,
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


  // RENDER
  // ---------------------------------------------------------------------------------
  renderNoteDisplay() {
    const notes = this.activeNotes
    const noteDisplay = notes.map((note, index) => {
      return (
        <div className="note"
          key={note}
          onClick={() => this.sendResponse(note)}
        >
          <h1>{note}</h1>
        </div>
      )
    })
    return noteDisplay
  }

  render() {
    const { appStarted, levelTracking, currentScale, matchStyle, missStyle } = this.state
    // console.log('matchStyle', matchStyle, 'missStyle', missStyle)
    // console.log('currentScaleMatchCounts', this.currentScaleMatchCounts)
    // console.log('currentLevel', this.currentLevel)
    return (
      <div className="app">

        <header className="app-header">
          <div className="scale-level">
            <h4>{currentScale} scale, {levelTracking[currentScale].level} notes</h4>
          </div>
        </header>

        <div className="start-n-splash">
          <div className={matchStyle ? 'match-count splash' : 'match-count'}>
            Match: {this.currentMatchCount.match}
          </div>
          <div className="start-stop" onClick={this.startStop} >
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


  // GETTERS
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


  // GENERAL
  // ---------------------------------------------------------------------------------
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
      console.log('currentMatchCount', this.currentMatchCount)
      const newMatchCount = { ...this.currentMatchCount }
      let newCalledNote
      let matchSplash = false
      let missSplash = false
      if (note === calledNote) {
        newMatchCount.match = this.currentMatchCount.match + 1
        newCalledNote = this.pickCallNote()
        matchSplash = true
      } else {
        newMatchCount.miss = this.currentMatchCount.miss + 1
        newCalledNote = calledNote
        missSplash = true
      }
      const newLevelTracking = { ...levelTracking }
      newLevelTracking[currentScale].matchCounts[this.currentLevel-1] = newMatchCount

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
      }, () => {
        setTimeout(() => { this.setState({ matchStyle: false, missStyle: false }) }, 300)
        this.checkForAdvance()
      })
    }
  }

  checkForAdvance() {
    const { currentScale, levelTracking } = this.state
    const { level, matchCounts } = levelTracking[currentScale]
    const counts = matchCounts[level-1]
    const { match, miss } = counts
    const matchToMissRatio = match/miss
    // console.log('match/miss', matchToMissRatio)
    if (match > 10 && (miss === 0 || matchToMissRatio > 10)) {
      // console.log('leveling up')
      const newLevelTracking = { ...levelTracking }
      newLevelTracking[currentScale].level += 1
      this.setState({ levelTracking: newLevelTracking })
    }
  }

}



export default ReactTimeout(App);

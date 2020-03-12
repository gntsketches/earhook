import React from 'react'
import Tone from "tone"
import ReactTimeout from 'react-timeout'

import './reset.css'
import './global.css'
import './App.css'


class App extends React.Component {
  constructor() {
    super();

    this.caller = new Tone.Synth().toMaster()
    this.responder = new Tone.Synth().toMaster()

    this.state = {
      appStarted: false,
      noteCallWait: 4000,
      // maxNoteCallWait: 5000,
      calledNote: 'C3',
      noteCalledTime: null,
      callerTimeout: null,
      responseNote: null,
      // responseReceivedTime: null,
      matchCounts: [
        { miss: 0, hit: 0 },
        { miss: 0, hit: 0 },
        { miss: 0, hit: 0 },
      ],
      playerLevel: 2,
      levelStaging: [
        ['C3'], ['C3','D3'], ['C3','D3','E3'], ['C3','D3','E3','F3'], ['C3','D3','E3','F3','G3'], 'cdefga', 'cdefgab', 'cdefgabc'
      ],
      showCalled: false,  // for "training wheels"
    }
  }

  pickCallNote() {
    const notes = this.state.levelStaging[this.state.playerLevel-1]
    const pick = notes[Math.floor(Math.random()*notes.length)]
    console.log('pick', pick)
    return pick
  }

  startApp = () => {
    const { calledNote, noteCallWait, callerTimeout } = this.state
    const { setTimeout, clearTimeout } = this.props
    console.log('starting app')
    clearTimeout(callerTimeout)
    this.setState({
      appStarted: true,
      noteCalledTime: Date.now(),
      callerTimeout: setTimeout(this.startApp, noteCallWait)
    }, () => {
      console.log('timeout', this.state.callerTimeout)
      this.caller.triggerAttackRelease(calledNote, '8n')
    })
  }

  response = (note) => {
    const { calledNote, noteCalledTime, callerTimeout, matchCounts, playerLevel } = this.state
    const { setTimeout } = this.props;

    this.responder.triggerAttackRelease(note, '8n')
    const responseInterval = Date.now() - noteCalledTime
    clearTimeout(callerTimeout)
    if (this.state.appStarted) {
      const currentMatchCount = matchCounts[playerLevel-1]
      const newMatchCount = { ...currentMatchCount }
      let newCalledNote
      if (note === calledNote) {
        newMatchCount.hit = currentMatchCount.hit + 1
        newCalledNote = this.pickCallNote()
      } else {
        newMatchCount.miss = currentMatchCount.miss + 1
        newCalledNote = calledNote
      }
      const newMatchCounts = [ ...matchCounts ]
      newMatchCount[playerLevel-1] = newMatchCount
      this.setState({
        responseNote: note,
        calledNote: newCalledNote,
        responseReceivedTime: Date.now(),
        callerTimeout: setTimeout(this.startApp, responseInterval),
        matchCounts: newMatchCounts
      }, () => console.log('response timeout', this.state.callerTimeout))
    }
  }

  renderNoteDisplay() {
    const notes = this.state.levelStaging[this.state.playerLevel-1]
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
            cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
          onClick={() => this.response(note)}
        >
          <h1>{note}</h1>
        </div>
      )
    })
    return noteDisplay
  }

  render() {
    const { matchCounts, playerLevel } = this.state
    const currentMatchCount = matchCounts[playerLevel-1]
    return (
      <div className="app">

        <header className="app-header">
          <div>
            Match: {currentMatchCount.hit}
            Miss: {currentMatchCount.miss}
          </div>
          <div
            style={{
              width: '200px', height: '75px',
              background: 'green', color: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            onClick={this.startApp}
          >
            <h2>Start</h2>
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

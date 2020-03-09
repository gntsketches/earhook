import React from 'react'
import './App.css'
import Tone from "tone"
import ReactTimeout from 'react-timeout'


class App extends React.Component {
  constructor() {
    super();

    this.caller = new Tone.Synth().toMaster()
    this.responder = new Tone.Synth().toMaster()

    this.state = {
      noteCallWait: 5000,
      // maxNoteCallWait: 5000,
      noteCalledTime: null,
      // responseReceivedTime: null,
      callerTimeout: null,
      matchCounts: {
        cd: { miss: 0, hit: 0 },
      },
      playerLevel: 0,
      levelStaging: [
        'cd', 'cde', 'cdef', 'cdefg', 'cdefga', 'cdefgab', 'cdefgabc'
      ],
      showCalled: false,  // for "training wheels"
    }
  }

  startApp = () => {
    const { noteCallWait, callerTimeout } = this.state
    const { setTimeout, clearTimeout } = this.props
    console.log('starting app')
    clearTimeout(callerTimeout)
    this.setState({
      noteCalledTime: Date.now(),
      callerTimeout: setTimeout(this.startApp, noteCallWait)
    }, () => console.log('timeout', this.state.callerTimeout))
    this.caller.triggerAttackRelease('C4', '8n')
  }

  response = () => {
    const { noteCalledTime, callerTimeout } = this.state
    const { setTimeout } = this.props;
    const responseInterval = Date.now() - noteCalledTime
    clearTimeout(callerTimeout)
    this.setState({
      responseReceivedTime: Date.now(),
      callerTimeout: setTimeout(this.startApp, responseInterval)
    }, () => console.log('response timeout', this.state.callerTimeout))
    this.responder.triggerAttackRelease('C4', '8n')
  }

  render() {
    return (
      <div className="app">

        <header className="app-header">
          <div
            style={{ width: '100px', height: '100px', background: 'blue', color: 'white' }}
            onClick={this.startApp}
          >
            Start
          </div>
        </header>

        <div>
          <div
            style={{ width: '100px', height: '100px', background: 'green', color: 'white' }}
            onClick={() => this.response('C')}
          >
            A Note
          </div>
        </div>
      </div>
    )
  }
}

export default ReactTimeout(App);

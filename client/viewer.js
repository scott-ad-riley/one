import { render, Component } from 'preact-compat'
import { h } from 'preact'

class App extends Component {
  constructor() {
    super()
    this.state = {
      fileChanges: [],
    }
    this.updateFileChange = this.updateFileChange.bind(this)
  }

  componentDidMount() {
    this.props.socket.on('data', this.updateFileChange)
  }

  updateFileChange({ eventType, data }) {
    switch (eventType) {
      case 'FULL_TREE':
        this.setState({
          fileChanges: data,
        })
        break
      case 'FILE_UPDATED':
      case 'FILE_DELETED':
        this.setState({
          fileChanges: [...this.state.fileChanges, data],
        })
    }
  }

  render() {
    return (
      <div>
        File Changes:
        {this.state.fileChanges.map(({ filepath, contents }) => (
          <FileChange filepath={filepath} contents={contents} />
        ))}
      </div>
    )
  }
}

class FileChange extends Component {
  render() {
    return (
      <div>
        <p>Filepath: {this.props.filepath}</p>
        <p>Contents: {this.props.contents}</p>
        <hr />
      </div>
    )
  }
}

window.onload = () => {
  fetch('/primus/primus.js')
    .then(res => res.text())
    .then(text => {
      const $el = document.createElement('script')
      $el.innerHTML = text
      document.body.appendChild($el)
      const primus = new Primus()
      render(<App socket={primus} />, document.getElementById('root'))
    })
}

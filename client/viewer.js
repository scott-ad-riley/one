import { render, Component } from 'preact-compat'
import { h } from 'preact'

class App extends Component {
  componentDidMount() {
    this.props.socket.on('data', console.log)
  }

  render() {
    return <div>Hello World!</div>
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

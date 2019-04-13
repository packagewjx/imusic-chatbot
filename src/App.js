import React, {Component} from 'react';
import './App.css';
import ChatBot from 'react-simple-chatbot'

class Query extends Component {
  constructor(props) {
    super(props);

    this.state = {result: ''}
  }

  componentWillMount() {
    let self = this;
    let request = new XMLHttpRequest();
    let queryURL = "http://110.64.66.207:8000/query?query=" + this.props.previousStep.value;
    request.addEventListener("readystatechange", readyStateChange);

    function readyStateChange() {
      if (this.readyState === 4) {
        const data = JSON.parse(this.responseText);
        self.setState({result: data.response}, () => {
          self.props.triggerNextStep();})
      }
    }

    request.open('GET', queryURL);
    request.send();
  }

  render() {
    return this.state.result;
  }
}

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let self = this;

    return (
      <div className="App">
        <ChatBot botDelay={0} userDelay={0}
                 steps={[
                   {
                     id: '1',
                     message: '您想听什么歌？',
                     trigger: 'user-input'
                   },
                   {
                     id: 'user-input',
                     user: true,
                     trigger: 'query'
                   },
                   {
                     id: 'query',
                     asMessage: true,
                     component: <Query/>,
                     waitAction: true,
                     trigger: 'user-input'
                   },
                 ]}
        />
      </div>
    );
  }
}

export default App;

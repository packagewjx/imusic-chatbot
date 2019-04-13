import React, {Component} from 'react';
import './App.css';
import ChatBot, {Loading} from 'react-simple-chatbot'

/**
 * 解析中间结果字符串，让用户进一步搜索
 * @param {string} str 需要解析的字符串
 * @returns {string[] | undefined} 若结果空，则返回undefined
 */
function parseUnsureResult(str) {
  let pat = /（([^.）]+)...）/;
  let parseResult = pat.exec(str);
  if (parseResult === null)
    return undefined;
  return parseResult[1].split("、");
}

/**
 * 解析最终结果字符串，并返回
 * @param {string} str
 */
function parseResult(str) {
  if (str.indexOf('\n') !== -1) {
    // 若能够找到换行符，代表有结果传回来
    let results = str.split("\n");
    // 当前第0个和最后一个结果是没有用的
    results = results.slice(1, results.length - 1);
    return results;
  }
  return undefined;
}

class Query extends Component {
  constructor(props) {
    super(props);

    this.state = {result: <Loading/>}
  }

  componentDidMount() {
    let self = this;
    let request = new XMLHttpRequest();
    let queryURL = "http://110.64.66.207:8000/query?query=" + this.props.previousStep.value;
    request.addEventListener("readystatechange", readyStateChange);

    function readyStateChange() {
      if (this.readyState === 4) {
        const data = JSON.parse(this.responseText);
        const textResult = data.response;
        let results;
        let nextStep = {trigger: 'user-input'};
        let nextMessage = textResult;
        if ((results = parseUnsureResult(textResult)) !== undefined) {
          nextStep.value = results;
          nextStep.trigger = 'choices';
        } else if ((results = parseResult(textResult)) !== undefined) {
          nextStep.value = results;
          nextStep.trigger = 'choices';
          nextMessage = textResult.substr(0, textResult.indexOf('：'));
        }

        self.setState({result: <div>{nextMessage}</div>}, () => {
          self.props.triggerNextStep(nextStep);
        });
      }
    }

    request.open('GET', queryURL);
    request.send();
  }

  render() {
    return this.state.result;
  }
}

/**
 * 将选项变成列表，单击可继续搜索
 */
class Choices extends Component {
  constructor(props) {
    super(props);

    this.state = {disabled: false}
  }

  render() {
    let self = this;
    let buttons = [];
    let choices = this.props.previousStep.value;
    for (let i = 0; i < choices.length; i++) {
      buttons.push(
        <button key={i} disabled={this.state.disabled} onClick={() => {
          self.props.triggerNextStep({value: choices[i], trigger: 'user-selected'});
          self.setState({disabled: true})
        }}>
          {choices[i]}
        </button>)
    }

    buttons.push(<button key={'user-input'} disabled={this.state.disabled} onClick={() => {
      self.setState({disabled: true});
      self.props.triggerNextStep({trigger: 'user-input'});
    }}>不选择</button>);

    return (
      <div>
        {buttons}
      </div>
    );
  }
}

/**
 * 简单的只是显示一条消息
 */
class HelpYouFindMessage extends Component {
  componentDidMount() {
    this.props.triggerNextStep({value: this.props.previousStep.value, trigger: 'query'});
  }

  render() {
    return <div>帮您查找{this.props.previousStep.value}</div>;
  }
}

class App extends Component {
  render() {
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
                     id: 'user-selected',
                     asMessage: true,
                     component: <HelpYouFindMessage/>,
                     waitAction: true
                   },
                   {
                     id: 'query',
                     asMessage: true,
                     component: <Query/>,
                     waitAction: true,
                   },
                   {
                     id: 'choices',
                     component: <Choices/>,
                     waitAction: true,
                   }
                 ]}
        />
      </div>
    );
  }
}

export default App;

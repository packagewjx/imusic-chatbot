import React, {Component} from 'react';
import './App.css';
import ChatBot, {Loading} from 'react-simple-chatbot'

/**
 * 解析中间结果字符串，让用户进一步搜索
 * @param {string} str 需要解析的字符串
 * @returns {{message: string, choices: {label: string, value: string}[]} | undefined} 若结果空，则返回undefined
 */
function parseUnsureResult(str) {
  let pat = /（([^.）]+)(?:...)?）$/;
  let parseResult = pat.exec(str);
  if (parseResult === null)
    return undefined;
  let labels = parseResult[1].split("、");
  let choices = [];
  for (let i = 0; i < labels.length; i++) {
    choices.push({label: labels[i], value: labels[i]});
  }
  return {message: str.substr(0, str.indexOf('（')), choices: choices};
}

/**
 * 解析返回的拼音错误、字错误选项，给用户选择
 * @param {string} str
 * @return {{message: string, choices: {label:string, value:string}[]}}
 */
function parseCorrectionResult(str) {
  if (str.indexOf('输入选项：') !== -1) {
    let message = str.substr(0, str.indexOf('('));
    let choices = [];
    let splits = str.split('\n');
    for (let i = 1; i < splits.length - 1; i++) {
      choices.push({value: splits[i].substr(0, splits[i].indexOf(':')),
        label: splits[i]});
    }
    return {message: message, choices: choices}
  }
  return undefined;
}

/**
 * 解析最终结果字符串，并返回
 * @param {string} str
 * @return {{message: string, choices: {label:string, value:string}[]}}
 */
function parseResult(str) {
  if (str.indexOf('歌') !== -1 && str.indexOf('\n') !== -1) {
    // 若能够找到换行符和`歌`字，代表有结果传回来
    let labels = str.split("\n");
    let message = labels[0].substr(0, labels[0].indexOf('：'));
    // 当前第0个和最后一个结果是没有用的
    labels = labels.slice(1, labels.length - 1);
    let results = [];
    for (let i = 0; i < labels.length; i++) {
      results.push({label: labels[i], value: labels[i]});
    }
    return {choices: results, message: message};
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
        let result;
        let nextStep = {trigger: 'user-input'};
        let nextMessage = textResult;
        // 解析字符串内容，并对有选项的内容提取出选项
        if ((result = parseUnsureResult(textResult)) !== undefined
          || (result = parseResult(textResult)) !== undefined
          || (result = parseCorrectionResult(textResult)) !== undefined) {
          nextStep.value = result.choices;
          nextStep.trigger = 'choices';
          nextMessage = result.message;
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
 * 选项是一个对象：{label: string, value: string}
 */
class Choices extends Component {
  constructor(props) {
    super(props);

    this.state = {disabled: false}
  }

  render() {
    let self = this;
    let rows = [];
    let choices = this.props.previousStep.value;
    for (let i = 0; i < choices.length; i++) {
      rows.push(
        <div key={i} className={this.state.disabled ? "list-item list-item-disabled" : "list-item"} onClick={() => {
          self.props.triggerNextStep({value: choices[i].value, trigger: 'user-selected'});
          self.setState({disabled: true});
        }}>{choices[i].label}</div>
      )
    }

    // 让用户能够不选择，而是继续输入
    rows.push(
      <div key={'b'} className={this.state.disabled ? "list-item list-item-disabled" : "list-item"} onClick={() => {
        self.setState({disabled: true});
        self.props.triggerNextStep({trigger: 'not-my-choice'});
      }}>没有我想要的</div>
    );

    return <div style={{width: "100%", pointerEvents: this.state.disabled ? "none" : "default"}}>
      {rows}
    </div>;
  }
}

/**
 * 简单的只是显示一条消息，然后自动去查询
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
        <ChatBot botDelay={0} userDelay={0} style={{width: "100vw", height: "100vh"}}
                 contentStyle={{height: "calc(100vh - 112px)"}} headerTitle="爱音乐智能对话机器人"
                 placeholder="请输入信息..." botAvatar="imusic.jpeg"
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
                     delay: 0,
                   },
                   {
                     id: 'not-my-choice',
                     message: '那您想找什么？',
                     trigger: 'user-input'
                   }
                 ]}
        />
      </div>
    );
  }
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';
import App, {parseUnsureResult} from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App/>, div);
  ReactDOM.unmountComponentAtNode(div);
});


it('parse unsure result', () => {
  class Case {
    str;
    isUndefined;
    expectedResultSize;
    expectedMessage;


    constructor(str, isUndefined, expectedResultSize, expectedMessage) {
      this.str = str;
      this.isUndefined = isUndefined;
      this.expectedResultSize = expectedResultSize;
      this.expectedMessage = expectedMessage;
    }
  }

  /**
   *
   * @type {Array.<Case>}
   */
  let cases = [];
  cases.push(new Case("你知道它的歌名是什么吗？为您查找到好多首歌（您好您拨打的用户正在通话中、您好您拨打的用户已停机、" +
    "您好您拨打的电话正在通话中、您好您拨打的电话已停机、老师您好...）", false, 5,
    "你知道它的歌名是什么吗？为您查找到好多首歌"));
  cases.push(new Case("你知道它的歌名是什么吗？为您查找到好多首歌（勇气、幸福的勇气、连拥抱都没有勇气、思恋的勇气、爱你不是两三天...）",
    false, 5, "你知道它的歌名是什么吗？为您查找到好多首歌"));
  cases.push(new Case("是谁唱的勇气呢？为您找到了很多位歌手哦（梁静茹、夏后、夏天Alex、彦磊、刘璐...）", false, 5,
    "是谁唱的勇气呢？为您找到了很多位歌手哦"));
  cases.push(new Case("你要听梁静茹的哪首歌呀？为您找到了很多首歌哦：勇气、爱你不是两三天、如果有一天、勇气(免费版)、勇气(跨年演唱会)",
    false, 5, "你要听梁静茹的哪首歌呀？为您找到了很多首歌哦"));
  cases.push(new Case("", true, 0, ""));
  cases.push(new Case("abcdefg", true, 0, ""));
  cases.push(new Case("我不明白你的意思", true, 0, ""));
  cases.push(new Case("我不知道（你才知道）有什么歌曲哦", true, 0, ""));
  cases.push(new Case("你知道它的歌名是什么吗？为您查找到好多首歌（勇气（wjx版）、勇气（ibm版）、勇气、勇气（scut版）、勇气（窝工版）...）",
    false, 5, "你知道它的歌名是什么吗？为您查找到好多首歌"));
  cases.push(new Case("你知道它的歌名是什么吗？为您查找到好多首歌：你好呀、我很好、我知道、所以呢、哈哈（你傻吧）",
    false, 5, "你知道它的歌名是什么吗？为您查找到好多首歌"));

  cases.forEach(value => {
    let result = parseUnsureResult(value.str);

    if (value.isUndefined) {
      expect(result).toBeUndefined();
    } else {
      expect(result.message).toBe(value.expectedMessage);
      expect(result.choices.length).toBe(value.expectedResultSize);
    }
  })

});
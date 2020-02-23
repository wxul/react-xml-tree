import { Tree, Node } from './xml';

/**
 * 简单的xml string parser
 * @author Albert<wlj_3322@163.com>
 */
class Parser {
  private _index: number;
  private _current: string;
  private _stack: NodeTag[];

  private _xmlString: string;

  constructor(xmlString: string, options: any = {}) {
    this._xmlString = xmlString;
    this._index = 0;
    this._stack = [];
    this._current = this._xmlString[this._index];
  }

  _next = (expect?: string) => {
    if (expect) {
      if (expect == this._current) {
        this._index++;
        this._current = this._xmlString[this._index];
      } else {
        throw new Error(`${expect} is expected at ${this._index}.`);
      }
    } else {
      this._index++;
      this._current = this._xmlString[this._index];
    }
  };

  /**
   * 跳过空格
   */
  _skipSpace = () => {
    while (this._current && /\s/.test(this._current)) {
      this._next();
    }
  };

  /**
   * 获取tagName
   */
  _tagName = () => {
    let tag = '';
    while (this._current && /[^>]/.test(this._current)) {
      tag += this._current;
      this._next();
    }
    return tag;
  };

  /**
   * 获取tag的内容
   */
  _text = () => {
    let text = '';
    while (this._current && this._current != '<') {
      text += this._current;
      this._next();
    }
    return text;
  };

  _openTag = () => {
    this._next('<');
    const tagName = this._tagName();
    this._skipSpace();
    this._next('>');
    return {
      type: 'openTag',
      value: tagName,
    };
  };

  _closeTag = () => {
    this._next('<');
    this._next('/');
    const tagName = this._tagName();
    this._next('>');
    return {
      type: 'closeTag',
      value: tagName,
    };
  };

  _content = () => {
    const text = this._text();
    return {
      type: 'text',
      value: text,
    };
  };

  _parse = () => {
    this._skipSpace();
    if (!this._xmlString[this._index]) {
      return;
    } else if (this._xmlString[this._index] === '<') {
      if (this._xmlString[this._index + 1] === '/') {
        return this._closeTag();
      } else {
        return this._openTag();
      }
    } else {
      return this._content();
    }
  };

  /**
   * 分词
   */
  tokenizer = () => {
    this._skipSpace();
    while (this._index < this._xmlString.length) {
      const parsed = this._parse();
      if (parsed) {
        this._stack.push(parsed);
      }
    }
  };

  /**
   * 分词转树结构
   */
  convert = () => {
    this.tokenizer();

    let currentTag: Node | null = null;
    let tagStack = [];
    let xmlTree: Tree | null = null;

    let i = 0;
    while (i < this._stack.length) {
      let node = this._stack[i];
      if (node.type === 'openTag') {
        const tag: Node = new Node(node.value, '');
        if (!xmlTree) {
          xmlTree = new Tree(tag);
        } else {
          xmlTree.addNode(tag, currentTag || void 0);
        }
        currentTag = tag;

        tagStack.push(tag);
      } else if (node.type === 'closeTag') {
        const lastTag = tagStack.pop();
        if (lastTag && lastTag.name === node?.value) {
          currentTag = tagStack[tagStack.length - 1];
        } else {
          throw new Error('标签不匹配');
        }
      } else if (node.type === 'text') {
        if (currentTag) {
          currentTag.value = node?.value;
        }
      }
      i++;
    }

    return xmlTree;
  };
}

export default Parser;

type NodeTag = {
  type: string;
  value: string;
};

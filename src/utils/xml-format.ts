import { Node } from './xml';

export interface XMLFormatterOptions {
  tabSize?: number;
}

// xml的树结构转文本
export default class XMLFormatter {
  private _level: number;
  private _node: Node;
  private _options: XMLFormatterOptions;

  constructor(node: Node, options: XMLFormatterOptions = {}) {
    this._node = node;
    const opt: XMLFormatterOptions = Object.assign(
      {},
      {
        tabSize: 4,
      },
      options,
    );
    this._options = opt;
    this._level = 0;
  }

  // 缩进填充
  _padStart = (level: number) => {
    return ''.padStart(level * (this?._options?.tabSize || 4));
  };

  // 格式化递归
  _formatter = (node: Node, level: number) => {
    const padStart = this._padStart(level);
    let str = `${padStart}<${node.name}>\n`;
    if (node.children && node.children.length) {
      node.children.forEach(n => {
        str += this._formatter(n, level + 1);
      });
    } else {
      str += `${this._padStart(level + 1)}${node.value}\n`;
    }

    str += `${padStart}</${node.name}>\n`;

    return str;
  };

  // node转格式化文本
  toString = () => {
    return this._formatter(this._node, 0);
  };
}

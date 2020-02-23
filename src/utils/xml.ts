import { isFunction } from 'lodash';
import XMLFormatter from './xml-format';

// 节点的类
export class Node {
  private _name: string;
  private _value?: string = '';
  private _children: Node[];
  private _parent?: Node;

  private _id: number;

  private static _index: number = 0;

  constructor(name: string, value?: string, parent?: Node) {
    this._name = name;
    if (value) this._value = value;
    if (parent) this._parent = parent;
    this._children = [];

    this._id = ++Node._index;
  }

  get name() {
    return this._name;
  }
  set name(val: string) {
    this._name = val;
  }
  get value() {
    return this._value;
  }
  set value(val: string | undefined) {
    this._value = val;
  }
  get children() {
    return this._children;
  }
  get parent() {
    return this._parent;
  }
  set parent(node: Node | undefined) {
    this._parent = node;
  }
  get id() {
    return this._id;
  }

  static get LastIndex() {
    return this._index;
  }

  // 格式化文本
  toString = () => {
    return new XMLFormatter(this).toString();
  };
}

// xml树的类
export class Tree {
  private _root: Node;

  constructor(root: Node) {
    this._root = root;
  }

  get root() {
    return this._root;
  }

  // 前序递归遍历
  _traverse = (node: Node, callback?: (node: Node) => void) => {
    if (isFunction(callback)) {
      callback(node);
    }
    for (let i = 0; i < node.children.length; i++) {
      this._traverse(node.children[i], callback);
    }
    return;
  };

  // 遍历
  traverse = (callback?: (node: Node) => void) => {
    this._traverse(this._root, callback);
  };

  // 根据id查找
  findNodeById = (id: number): Node | null => {
    let node = null;
    this.traverse(n => {
      if (n.id === id) node = n;
      return;
    });
    return node;
  };

  // 添加一个节点到目标节点
  addNode = (node: Node, targetNode: Node = this._root, targetIndex: number = -1) => {
    if (targetIndex < 0) {
      targetNode.children.push(node);
    } else {
      targetNode.children.splice(targetIndex, 0, node);
    }
    node.parent = targetNode;
  };

  // 添加一个节点到目标节点
  addNodeToParentById = (node: Node, targetNodeId: number, targetIndex: number = -1) => {
    const parentNode = this.findNodeById(targetNodeId);
    if (parentNode) {
      this.addNode(node, parentNode, targetIndex);
    }
  };

  // 查出某个node在父节点中的位置
  _findNodeIndex = (node: Node) => {
    const { parent } = node;
    return parent?.children.findIndex(n => n.id === node.id);
  };

  // 移除一个node
  removeNodeById = (id: number): Node | null => {
    const node = this.findNodeById(id);
    if (node) {
      this.removeNode(node);
    }
    return node;
  };

  removeNode = (node: Node) => {
    const { parent } = node;
    if (!parent) return;
    const findIndex = this._findNodeIndex(node);
    if (findIndex != void 0 && findIndex >= 0) {
      parent?.children.splice(findIndex, 1);
    }
  };

  // sourceNode节点是否是targetNode节点的子孙节点
  _hasChildren = (sourceNode: Node, targetNode: Node) => {
    let temp = sourceNode.parent;
    while (temp) {
      if (temp.id === targetNode.id) return true;
      temp = temp.parent;
    }
    return false;
  };

  exchangeNode = (sourceNode: Node, targetNode: Node) => {
    // 节点有效并且targetNode节点不是sourceNode节点的子孙节点
    if (sourceNode && targetNode && !this._hasChildren(targetNode, sourceNode)) {
      const sourceParent = sourceNode.parent;
      const sourceIndex = this._findNodeIndex(sourceNode);
      const targetParent = targetNode.parent;
      const targetIndex = this._findNodeIndex(targetNode);
      // 根节点不能是source
      if (sourceIndex === void 0 || !targetParent) return;

      // 同一个父级
      if (
        sourceParent &&
        targetParent &&
        targetIndex != void 0 &&
        sourceParent.id === targetParent.id
      ) {
        sourceParent.children.splice(sourceIndex, 1);
        sourceParent.children.splice(targetIndex, 0, sourceNode);
      } else {
        // 删除source
        this.removeNode(sourceNode);
        // 添加
        this.addNode(sourceNode, targetNode, 0);
      }
    }
  };

  // drop
  exchange = (sourceId: number, targetId: number) => {
    const sourceNode = this.findNodeById(sourceId);
    const targetNode = this.findNodeById(targetId);
    if (sourceNode && targetNode) {
      this.exchangeNode(sourceNode, targetNode);
    }
  };

  moveNode = (sourceNode: Node, direct: number) => {
    if (!sourceNode.parent) return;
    const sourceIndex = this._findNodeIndex(sourceNode);
    if (sourceIndex === void 0 || sourceIndex < 0) return;
    const targetIndex = sourceIndex + direct;
    // 超出数组范围
    if (targetIndex < 0 || targetIndex >= sourceNode.parent.children.length) return;
    this.exchangeNode(sourceNode.parent.children[targetIndex], sourceNode);
  };

  // 同级兄弟节点移动
  move = (sourceId: number, direct: number) => {
    const sourceNode = this.findNodeById(sourceId);
    if (!sourceNode) return;
    this.moveNode(sourceNode, direct);
  };
}

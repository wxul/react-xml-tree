import React, { Component } from 'react';
import styles from './styles.css';
import { connect } from 'dva';
import event from '@/utils/event';
import { Node, Tree } from '@/utils/xml';
import { download } from '@/utils';

interface IProps {
  xmlNode: Node;
  checkedId?: number;
  xmlNodeTree: Tree;
  dispatch?: Function;
}

interface IState {
  isEnter: boolean;
  isAdd: boolean;
  isEdit: boolean;
  isCollapse: boolean;

  // add
  addNodeName: string;
  addNodeContent: string;

  // edit
  editNodeName: string;
  editNodeConcent: string;
}

class XMLNode extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isEnter: false,
      isAdd: false,
      isEdit: false,
      isCollapse: false,

      addNodeName: '',
      addNodeContent: '',
      editNodeName: '',
      editNodeConcent: '',
    };
  }
  componentDidMount() {
    event.on('forceUpdate', this.update);
  }
  componentWillUnmount() {
    event.off('forceUpdate', this.update);
  }
  // 订阅重绘事件
  update = (id: number) => {
    if (id === this.props.xmlNode.id) this.forceUpdate();
  };
  stop = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  // 移入移出相关样式改变
  onMouseOver = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    this.setState({
      isEnter: true,
    });
  };
  onMouseOut = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.setState({
      isEnter: false,
    });
  };

  /**
   * 点击选中该节点
   */
  onCheck = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.props.dispatch?.({
      type: 'xml/check',
      payload: this.props.xmlNode.id,
    });
    e.stopPropagation();
  };

  // 节点上移/下移
  move = (direct: number) => {
    const { xmlNode, xmlNodeTree } = this.props;
    const { parent } = xmlNode;
    if (!parent) return;
    xmlNodeTree.move(xmlNode.id, direct);
    // 强制父节点重绘
    event.emit('forceUpdate', parent.id);
  };

  // 下载此节点内容
  download = () => {
    const { xmlNode } = this.props;
    download(`${xmlNode.name}.xml`, xmlNode.toString());
  };

  // 添加节点相关方法
  add = () => {
    this.setState({
      isAdd: true,
      addNodeName: '',
      addNodeContent: '',
      isEdit: false,
    });
  };
  onAddNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      addNodeName: e.target.value,
    });
  };
  onAddNodeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      addNodeContent: e.target.value,
    });
  };
  cancelAdd = () => {
    this.setState({
      isAdd: false,
    });
  };
  confirmAdd = () => {
    const { addNodeName, addNodeContent } = this.state;
    if (addNodeName) {
      const { xmlNodeTree, xmlNode } = this.props;
      xmlNodeTree.addNode(new Node(addNodeName, addNodeContent), xmlNode, 0);
      this.cancelAdd();
    }
  };

  // 编辑节点相关方法
  edit = () => {
    const { xmlNode } = this.props;
    this.setState({
      isEdit: true,
      editNodeName: xmlNode.name,
      editNodeConcent: xmlNode.value || '',
      isAdd: false,
    });
  };
  onEditNodeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      editNodeName: e.target.value,
    });
  };
  onEditNodeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      editNodeConcent: e.target.value,
    });
  };
  cancelEdit = () => {
    this.setState({
      isEdit: false,
    });
  };
  confirmEdit = () => {
    const { editNodeName, editNodeConcent } = this.state;
    if (editNodeName) {
      const { xmlNode } = this.props;
      xmlNode.name = editNodeName;
      xmlNode.value = editNodeConcent;
      this.cancelEdit();
    }
  };

  // 删除此节点
  delNode = () => {
    if (window.confirm('确认删除该节点？')) {
      const { xmlNode, xmlNodeTree } = this.props;
      xmlNodeTree.removeNode(xmlNode);
    }
  };

  // 展开/收起
  toogle = () => {
    this.setState({
      isCollapse: !this.state.isCollapse,
    });
  };

  // 拖放
  onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData('targetId', `${this.props.xmlNode.id}`);
  };
  onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const id = Number(e.dataTransfer.getData('targetId'));
    const { xmlNode, xmlNodeTree } = this.props;
    xmlNodeTree.exchange(id, xmlNode.id);
  };

  // 渲染子node
  renderChildren(children: Node[]) {
    return children.map((n, i) => {
      return <XMLNodeWithDva key={`${n.id}`} xmlNode={n} />;
    });
  }
  render() {
    const { xmlNode, checkedId } = this.props;
    const { name, value, children, id } = xmlNode;
    const { isEnter, isAdd, isEdit, editNodeName, editNodeConcent, isCollapse } = this.state;
    const isChecked = checkedId === id;

    return (
      <div
        data-id={id}
        className={styles.node}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
        onClick={this.onCheck}
        style={{
          backgroundColor: isChecked ? '#ddd' : isEnter ? '#eee' : 'transparent',
        }}
        draggable={true}
        onDragStart={this.onDragStart}
        onDrop={this.onDrop}
        onDragOver={this.onDragOver}
      >
        <div className={styles['node-name']}>
          <span className={styles['node-toogle']} onClick={this.toogle}>
            {isCollapse ? '+' : '-'}
          </span>
          {isCollapse ? <span>&lt;{name}/&gt;</span> : <span>&lt;{name}&gt;</span>}
          {isChecked ? (
            <div className={styles['node-oprator']}>
              <span title="上移" onClick={this.move.bind(null, -1)}>
                ↑
              </span>
              <span title="下移" onClick={this.move.bind(null, 1)}>
                ↓
              </span>
              <span title="添加节点" onClick={this.add}>
                +
              </span>
              <span title="删除此节点" onClick={this.delNode}>
                -
              </span>
              <span title="修改节点" onClick={this.edit}>
                📄
              </span>
              <span title="下载此节点内容" onClick={this.download}>
                📩
              </span>
            </div>
          ) : null}
        </div>
        {isAdd ? (
          <div className={styles.form}>
            <input
              className={styles.formitem}
              type="text"
              placeholder="添加的节点名，不能为空"
              onChange={this.onAddNodeNameChange}
            />
            <input
              className={styles.formitem}
              type="text"
              placeholder="内容"
              onChange={this.onAddNodeValueChange}
            />
            <div className={styles.formitem}>
              <button onClick={this.confirmAdd}>确定</button>
              <button onClick={this.cancelAdd}>取消</button>
            </div>
          </div>
        ) : null}
        {isEdit ? (
          <div className={styles.form}>
            <input
              className={styles.formitem}
              type="text"
              placeholder="节点名，不能为空"
              onChange={this.onEditNodeNameChange}
              defaultValue={editNodeName}
            />
            {children && children.length > 0 ? null : (
              <input
                className={styles.formitem}
                type="text"
                placeholder="内容"
                onChange={this.onEditNodeValueChange}
                defaultValue={editNodeConcent}
              />
            )}
            <div className={styles.formitem}>
              <button onClick={this.confirmEdit}>确定</button>
              <button onClick={this.cancelEdit}>取消</button>
            </div>
          </div>
        ) : null}
        {isCollapse ? null : (
          <>
            <div className={styles['node-children']}>
              {children && children.length > 0 ? this.renderChildren(children) : value}
            </div>
            <div>&lt;/{name}&gt;</div>
          </>
        )}
      </div>
    );
  }
}

const XMLNodeWithDva = connect(state => {
  return {
    checkedId: state.xml.checkedId,
    xmlNodeTree: state.xml.xmlNodeTree,
  };
})(XMLNode);

export default XMLNodeWithDva;

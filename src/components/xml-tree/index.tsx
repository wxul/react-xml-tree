import React, { Component } from 'react';
import XMLNode from './node';
import event from '@/utils/event';
import { Tree } from '@/utils/xml';

interface IProps {
  xmlTree: Tree;
}

export default class XMLTree extends Component<IProps> {
  componentDidMount() {
    event.on('forceUpdate', this.update);
  }
  componentWillUnmount() {
    event.off('forceUpdate', this.update);
  }
  update = (id: number = -1) => {
    if (id < 0) this.forceUpdate();
  };
  render() {
    const { xmlTree } = this.props;
    return (
      <div>
        <div>文档:</div>
        <div>{xmlTree ? <XMLNode xmlNode={xmlTree.root} /> : null}</div>
      </div>
    );
  }
}

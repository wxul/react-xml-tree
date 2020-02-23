import React, { Component } from 'react';
import { connect } from 'dva';

class Preview extends Component {
  render() {
    return (
      <div>
        <div>文本:</div>
        <textarea name="" id=""></textarea>
      </div>
    );
  }
}

export default connect()(Preview);

import React from 'react';
import styles from './index.css';
import Parser from '../utils/xml-parser';
import XMLTree from '@/components/xml-tree';
import { connect } from 'dva';
import { Tree } from '@/utils/xml';

interface IProps {
  dispatch: Function;
  xmlNodeTree: Tree;
}

class Home extends React.Component<IProps> {
  // 上传文件
  onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.files);
    if (e?.currentTarget?.files?.[0]) {
      try {
        const file = e.currentTarget.files[0];
        const content = await file.text();
        const parser = new Parser(content);
        const result = parser.convert();
        if (result) {
          this.props.dispatch({ type: 'xml/save', payload: result });
        }
      } catch (error) {
        window.alert(error.message);
      }
    }
  };
  render() {
    const { xmlNodeTree } = this.props || {};
    return (
      <div className={styles.app}>
        <div className={styles.upload}>
          <span>上传xml文件：</span>
          <input type="file" onChange={this.onFileChange} />
        </div>
        <div className={styles.main}>
          <div className={styles.box}>
            {xmlNodeTree ? <XMLTree xmlTree={xmlNodeTree} /> : '请上传xml文件'}
          </div>
          <div className={styles.box}></div>
        </div>
      </div>
    );
  }
}

export default connect(state => {
  return {
    xmlNodeTree: state.xml.xmlNodeTree,
  };
})(Home);

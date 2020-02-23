import { IConfig } from 'umi-types';

// ref: https://umijs.org/config/
const config: IConfig = {
  treeShaking: true,
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [{ path: '/', component: '../pages/index' }],
    },
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: false,
        dva: {
          immer: true,
        },
        dynamicImport: { webpackChunkName: true },
        title: 'react-xml-tree',
        dll: true,

        routes: {
          exclude: [/components\//],
        },
      },
    ],
  ],
};

export default config;

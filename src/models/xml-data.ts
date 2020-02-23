export default {
  namespace: 'xml',
  state: {
    xmlNodeTree: null,
    checkedId: null,
  },
  reducers: {
    save(state: any, { payload: xmlNodeTree }: any) {
      return { ...state, xmlNodeTree };
    },
    check(state: any, { payload: checkedId }: any) {
      return { ...state, checkedId };
    },
  },
};

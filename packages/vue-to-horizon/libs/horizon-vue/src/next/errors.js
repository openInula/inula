export const JSErrors = {
  must_return_object:
    'throw error: vue options api data attr must return a {} object, ' +
    'e.g.: ' +
    'data() { const ret = { activeTabIndex: 0 }; return ret; } ' +
    'need to change to: ' +
    'data() { return { activeTabIndex: 0 }; }',
};

export const JSWarnings = {
  not_support_this_templateLiteral:
    'warning: not supported this[templateLiteral contains expression], modify it manually: ',
};

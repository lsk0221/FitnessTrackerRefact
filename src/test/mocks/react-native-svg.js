const React = require('react');

const createMock = (name) => {
  const Comp = (props) => React.createElement(name, props, props.children);
  return Comp;
};

module.exports = new Proxy({}, {
  get: (_, prop) => createMock(`Svg-${String(prop)}`),
});




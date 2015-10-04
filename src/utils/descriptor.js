import assign from 'lodash/object/assign';
import forEach from 'lodash/collection/forEach';
import isEmpty from 'lodash/lang/isEmpty';

import { isSpecDescriptor } from '.';

/**
 * Initialize descriptor with property defaults.
 *
 * @return {Object} Default descriptor.
 */
export function initDescriptor() {
  return {
    methods: {},
    properties: {},
    deepProperties: {},
    initializers: [],
    staticProperties: {},
    deepStaticProperties: {},
    propertyDescriptors: {},
    staticPropertyDescriptors: {},
    configuration: {},
  };
};

/**
 * Convert the React component constructor function to a descriptor.
 *
 * @param  {Object} Component The React component constructor function.
 *
 * @return {Object} The React component descriptor.
 */
export function getReactDescriptor(Component) {
  const desc = {};

  if (Component) {
    desc.methods = { ...Component.prototype };
    desc.initializers = [
      (options, { instance, args }) =>
        Component.call(instance, options, ...args),
    ];
  }

  return desc;
};

/**
 * Verify a description object is compliant
 * to the stamp specification.
 *
 * @param  {Object} desc A description object.
 *
 * @return {Object} A stamp spec compliant description object.
 */
export function parseDesc(desc = {}) {
  if (isSpecDescriptor(desc) || isEmpty(desc)) return desc;

  let {
    displayName, init, state, statics,
    contextTypes, childContextTypes, propTypes, defaultProps,
    ...methods,
  } = desc;
  const parsedDesc = {
    initializers: [],
    deepProperties: {},
    methods: {},
    deepStaticProperties: {},
  };

  !displayName && (displayName = 'ReactStamp');
  init && parsedDesc.initializers.push(init);
  state && (parsedDesc.deepProperties.state = state);
  methods && assign(parsedDesc.methods, methods);
  parsedDesc.deepStaticProperties = { ...statics, displayName };

  forEach({ contextTypes, childContextTypes, propTypes, defaultProps },
    (val, key) => val && (parsedDesc.deepStaticProperties[key] = val)
  );

  return parsedDesc;
}


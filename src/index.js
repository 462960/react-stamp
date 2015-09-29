import assign from 'lodash/object/assign';

import {
  compose,
  getReactDescriptor,
  parseDesc,
  dupeFilter,
} from './utils';

/**
 * Given a description object, return a stamp
 * aka composable.
 *
 * @param  {Object} React The React library.
 * @param  {Object} desc A description object.
 *
 * @return {Object} A stamp.
 */
export default function createStamp(React, desc = {}) {
  const specDesc = parseDesc(desc);
  const { methods, initializers } = getReactDescriptor(React && React.Component);

  /**
   * Make sure the descriptor is not overriding React's
   * `setState` and `forceUpdate` methods.
   */
  specDesc.methods = assign({}, methods, specDesc.methods, dupeFilter);
  specDesc.initializers = (initializers || []).concat(specDesc.initializers);

  const stamp = (...args) => {
    const instance = Object.create(specDesc.methods);
    /**
     * State is handled special for React
     */
    const { state, ...deepProperties } = specDesc.deepProperties || {};

    specDesc.initializers.forEach(initializer => {
      initializer.apply(instance, [ args, { instance, stamp } ]);
    });

    state && (instance.state = assign(instance.state || {}, state));
    assign(instance, deepProperties, specDesc.properties);
    Object.defineProperties(instance, specDesc.propertyDescriptors || {});
    assign(instance, specDesc.configuration);

    return instance;
  }

  assign(stamp, specDesc.deepStaticProperties, specDesc.staticProperties);
  Object.defineProperties(stamp, specDesc.staticPropertyDescriptors || {});

  stamp.compose = assign(compose.bind(stamp), specDesc);

  return stamp;
}

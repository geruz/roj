'use strict';

/*eslint-disable */
module.exports.render = (component, element) => {
    element.src = component.toHtmlString({});
};

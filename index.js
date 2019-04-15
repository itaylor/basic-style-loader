const path = require('path');

const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');

const schema = require('./options.json');

module.exports = () => {};

module.exports.pitch = function loader(request) {
  const options = loaderUtils.getOptions(this) || {};
  validateOptions(schema, options, 'Simple Style Loader');
  return [
    '',
    `var content = require(${loaderUtils.stringifyRequest(
      this,
      `!!${request}`
    )});`,
    "if(typeof content === 'string') content = [[module.id, content, '']];",
    `var options = ${JSON.stringify(options)}`,
    options.insertionFn
      ? `options.insertionFn = ${options.insertionFn.toString()};`
      : '',
    `require(${loaderUtils.stringifyRequest(
      this,
      `!${path.join(__dirname, 'addStyles.js')}`
    )})(content, options);`,
    'if(content.locals) module.exports = content.locals;',
    '',
  ].join('\n');
};

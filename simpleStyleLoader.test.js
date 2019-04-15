const path = require('path');
const fs = require('fs');

const rimraf = require('rimraf');
const webpack = require('webpack');
const jsdom = require('jsdom');

const outputDir = `${__dirname}/test-output`;
const fixturesDir = `${__dirname}/fixtures`;

let window;
describe('', () => {
  beforeEach(() => {
    rimraf.sync(outputDir);
    const jsdomHtml = fs.readFileSync(`${fixturesDir}/index.html`);
    const virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.sendTo(console);
    const obj = new jsdom.JSDOM(jsdomHtml, {
      resources: 'usable',
      runScripts: 'dangerously',
      virtualConsole,
    });
    window = obj.window; // eslint-disable-line prefer-destructuring
  });
  afterAll(() => {
    rimraf.sync(outputDir);
  });
 
  test('basic: scripts get added to head', async () => {
    const compiler = createWebpackCompiler(getWebpackConfig());
    await compileAndRun(compiler);
    const resultedStyleTags = window.document.querySelectorAll(['head style']);
    expect(resultedStyleTags.length).toBe(3);
    expect(resultedStyleTags).toMatchSnapshot();
  });
  test('options: sourceMap option adds inline sourceMaps if css-loader passes them', async () => {
    const use = [{
      loader: 'simple-style-loader', 
      options: {
        sourceMap: true,
      }
    }, {
      loader: 'css-loader', 
      options: {
        sourceMap: true,
      }
    }];
    const compiler = createWebpackCompiler(getWebpackConfig(use));
    await compileAndRun(compiler);
    const resultedStyleTags = window.document.querySelectorAll(['head style']);
    expect(resultedStyleTags.length).toBe(3);
    expect(resultedStyleTags).toMatchSnapshot();
  });
  test('options: sourceMap option wont add sourcemap if css-loader does not also', async () => {
    const use = [{
      loader: 'simple-style-loader', 
      options: {
        sourceMap: true,
      }
    }, {
      loader: 'css-loader', 
      options: {
        sourceMap: false,
      }
    }];
    const compiler = createWebpackCompiler(getWebpackConfig(use));
    await compileAndRun(compiler);
    const resultedStyleTags = window.document.querySelectorAll(['head style']);
    expect(resultedStyleTags.length).toBe(3);
    expect(resultedStyleTags).toMatchSnapshot();
  });
  test('options: sourceMap prevents sourcemap even if css-loader passes one', async () => {
    const use = [{
      loader: 'simple-style-loader', 
      options: {
        sourceMap: false,
      }
    }, {
      loader: 'css-loader', 
      options: {
        sourceMap: true,
      }
    }];
    const compiler = createWebpackCompiler(getWebpackConfig(use));
    await compileAndRun(compiler);
    const resultedStyleTags = window.document.querySelectorAll(['head style']);
    expect(resultedStyleTags.length).toBe(3);
    expect(resultedStyleTags).toMatchSnapshot();
  });
  test('options: insertionFn option allows tags to be placed elsewhere in the DOM', async () => {
    const use = [{
      loader: 'simple-style-loader', 
      options: {
        insertionFn: (styleTag) => {
          document.body.appendChild(styleTag);
        },
      }
    }, 
    'css-loader'
    ];
    const compiler = createWebpackCompiler(getWebpackConfig(use));
    await compileAndRun(compiler);
    const resultedStyleTags = window.document.querySelectorAll(['body style']);
    expect(resultedStyleTags.length).toBe(2);
    expect(resultedStyleTags).toMatchSnapshot();
  });
  test('options: insertionFn gets passed styleObj and can use it to add attributes', async () => {
    const use = [{
      loader: 'simple-style-loader', 
      options: {
        insertionFn: (styleTag, styleObj) => { 
          const idSafe = `id-${styleObj.id}`.replace(/[\W]/gi, '_');
          styleTag.setAttribute('id', idSafe);
          document.head.appendChild(styleTag);
        },
      }
    }, 
    'css-loader'
    ];
    const compiler = createWebpackCompiler(getWebpackConfig(use));
    await compileAndRun(compiler);
    const resultedStyleTags = window.document.querySelectorAll(['head style']);
    expect(resultedStyleTags.length).toBe(3);
    expect(resultedStyleTags).toMatchSnapshot();
  });
});

function compileAndRun(compiler, compiledScriptName = 'bundle.js') {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) =>  {
    resolve = res;
    reject = rej;
  });

  compiler.run((err, stats) => {
    if (err) {
      return reject(err);
    }
    if (stats.compilation.errors.length) {
      return reject(new Error(stats.compilation.errors));
    }
    const bundleJs = stats.compilation.assets[compiledScriptName].source();
    window.eval(bundleJs); 
    return resolve();
  });
  return promise;
}

function createWebpackCompiler(webpackConfig) {
  Object.assign(webpackConfig, {
    mode: 'development',
    resolveLoader: {
      alias: {
        'simple-style-loader': path.resolve(__dirname),
      },
    },
    plugins: [],
  });
  const compiler = webpack(webpackConfig);
  return compiler;
}

function getWebpackConfig(use = ['simple-style-loader','css-loader']) {
  const webpackConfig = {
    entry: `${fixturesDir}/main.js`,
    output: {
      path: outputDir,
      filename: 'bundle.js',
    },
    module: {
      rules: [{
        test: /\.css?$/,
        use,
      }],
    },
  };
  return webpackConfig;
} 
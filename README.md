# Basic Style Loader
A webpack loader that adds Adds CSS to the DOM by injecting a `<style>` tag

## Why use this instead of the default [webpack-contrib/style-loader](https://github.com/webpack-contrib/style-loader)?
The `webpack-contrib` `style-loader` handles a lot of use-cases with many complex and difficult to understand options.  A good portion of the code is workarounds to support old browsers.  Its behavior with regards to sourceMaps is difficult to understand and with `sourceMap: true` it causes a FOUC (flash of unstyled content) because it uses `<link>` tags instead of `<style>` tags. 

This module sheds backward compatiblity with old browsers, and fixes problems with sourcemaps causing FOUCs by using inline sourcemaps inside the `<style>` tags.  This module seeks to be as simple as possible and is very little code.

## Install
```bash
npm install basic-style-loader --save-dev
```

## Usage
You will need to combine `basic-style-loader` with Webpack's [`css-loader`](https://github.com/webpack/css-loader) or another loader that works similarly. The CSS Loader is in charge of taking your css files and bundling them into your `.js` bundle file at compile time.  The Style Loader is in charge of inserting code so that at runtime, those css strings are inserted into the DOM of the page.

**component.js**
```js
import style from './file.css';
```

**webpack.config.js**
```js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'basic-style-loader' }, { loader: 'css-loader' }],
      },
    ];
  }
}
```

## Options

| Name               | Type          | Default          | Description                                           |
| **`insertionFn`**  | `{Function}`  | `(styleTag) => document.head.appendChild(styleTag);`    | The function that does the actual insertion of `<style>` tags into the DOM.  You can provide your own function(styleTag, styleObj) here if you want to insert the styleTag somewhere other than the document head, or if you want to add additional attributes to it before it's inserted into the DOM |
| **`sourceMap`**    | `{Boolean}`   | `false`          | Enable/Disable Sourcemaps *Note:* for sourcemaps to work, they must also be enabled in the previous loader (usually `css-loader`) |                                                                

Options are provided in the normal webpack fashion as an object in the loader object.  

```js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{
          loader: 'basic-style-loader',
          options: {
            sourceMap: true,
            insertionFn: function (styleTag) {
              //An example insertionFn that appends to the body instead of the head
              document.body.appendChild(styleTag);
            }
          } 
        }, {
          loader: 'css-loader'
          options: {
            sourceMap: true,
          }
        }],
      },
    ];
  }
}
```

## Credit where it's due
This module was created largely by looking at the `style-loader` codebase and trying to understand and imagine what a simpler, stripped down version of it would be.

## MIT LICENSE
Copyright 2019 Ian Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
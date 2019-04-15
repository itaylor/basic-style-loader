module.exports = function addStyles(list, options = {}) {
  const insertionFn = options.insertionFn || appendToDocumentHead;
  const styles = listToStyles(list, options);
  styles.forEach((item) => {
    const styleTag = createStyleTag(item);
    insertionFn(styleTag, item);
  });
};

function listToStyles(list, options) {
  return list.map((item) => {
    const [id, css, media, sm] = item;
    const sourceMap = options.sourceMap ? sm : null;
    return { id, css, media, sourceMap };
  });
}

function createStyleTag(item) {
  const { media, css, sourceMap } = item;
  const styleTag = document.createElement('style');

  if (media) styleTag.setAttribute('media', media);
  styleTag.setAttribute('type', 'text/css');

  let cssToUse = css;
  if (sourceMap) {
    const sourceMapString = createSourceMapString(sourceMap);
    cssToUse += `\n${sourceMapString}`;
  }
  styleTag.appendChild(document.createTextNode(cssToUse));
  return styleTag;
}

function createSourceMapString(sourceMap) {
  const encodedSourceMap = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  return `/*# sourceMappingURL=data:application/json;base64,${encodedSourceMap} */`;
}

function appendToDocumentHead(styleTag) {
  document.head.appendChild(styleTag)
}
const fs = require('node:fs');
const {createRequire} = require('node:module');
const root = process.env.NETVERIFY_AUDIT_ROOT || require('node:path').resolve(__dirname, '../../..');
const req = createRequire(root + '/backend/package.json');
const ts = req('typescript');
require.extensions['.ts'] = (mod, filename) => {
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021,
    experimentalDecorators: true, emitDecoratorMetadata: true, esModuleInterop: true
  }, fileName: filename}).outputText;
  mod._compile(code, filename);
};
req('reflect-metadata');
req('@nestjs/common').Logger.overrideLogger(false);
process.env.TZ = 'Asia/Shanghai';
module.exports = {root, req, src: p => require(root + '/backend/src/' + p + '.ts')};

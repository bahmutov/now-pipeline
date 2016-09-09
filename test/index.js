const port = process.env.PORT || 4000
const foo = require('./subfolder/foo')
require('http').Server((req, res) => {
  const msg = "Hi there! " + foo + " node " + process.versions.node;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(require("sign-bunny")(msg));
}).listen(port);
console.log('listening on port', port)

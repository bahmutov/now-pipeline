const port = process.env.PORT || 4000
require('http').Server((req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(require("sign-bunny")("Hi there!"));
}).listen(port);
console.log('listening on port', port)

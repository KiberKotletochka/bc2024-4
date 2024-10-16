const http = require('http');
const fs = require("node:fs");
const { program } = require('commander');

program
    .requiredOption('-h, --host <host>', 'address of the server')
    .requiredOption('-p, --port <port>', 'port of the server')
    .requiredOption('-c, --cache <path>', 'path to the cache directory');

program.parse();

const { host, port, cache } = program.opts();

const server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World!');
    res.end();
});

server.listen(port, host, () =>{
    console.log(`Server is running on http://${host}:${port}`);
});
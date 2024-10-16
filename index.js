const http = require('http');
const fs = require("fs").promises;
const { program } = require('commander');

program
    .requiredOption('-h, --host <host>', 'address of the server')
    .requiredOption('-p, --port <port>', 'port of the server')
    .requiredOption('-c, --cache <path>', 'path to the cache directory');

program.parse();
const { host, port, cache } = program.opts();

const server = http.createServer(async function (req, res) {
    console.log(`Received request: ${req.method} ${req.url}`);
    if (req.method === 'PUT') {
        const statusCode = req.url.slice(1);
        console.log(`Processing PUT request for status code: ${statusCode}`);

        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
            body = Buffer.concat(body);
            const filePath = `${cache}/${statusCode}.jpg`;
            console.log(`Saving image to: ${filePath}`);
            await fs.writeFile(filePath, body);
            res.writeHead(201, {'Content-Type': 'text/plain'});
            res.end('Image saved');
        });
    } else {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end('Method not allowed');
    }
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

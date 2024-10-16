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
    const statusCode = req.url.slice(1);
    const filePath = `${cache}/${statusCode}.jpg`;
    if (req.method === 'PUT') {
        console.log(`Processing PUT request for status code: ${statusCode}`);

        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
            body = Buffer.concat(body);
            console.log(`Saving image to: ${filePath}`);
            await fs.writeFile(filePath, body);
            res.writeHead(201, {'Content-Type': 'text/plain'});
            res.end('Image saved');
        });
    } else if (req.method === 'GET') {
        console.log(`Processing GET request for status code: ${statusCode}`);

        try {
            const image = await fs.readFile(filePath);
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(image);
        } catch (err) {
            try {
                const image404 = await fs.readFile(`${cache}/404.jpg`);
                res.writeHead(404, {'Content-Type': 'image/jpeg'});
                res.end(image404);
            } catch (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('404 image not found');
            }
        }
    } else if (req.method === 'DELETE') {
        console.log(`Processing DELETE request for status code: ${statusCode}`);

        try {
            await fs.unlink(filePath);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Image deleted');
        } catch (err) {
            console.log(`Delete failed, trying to serve 404 image: ${err}`);
            try {
                const image404 = await fs.readFile(`${cache}/404.jpg`);
                res.writeHead(404, {'Content-Type': 'image/jpeg'});
                res.end(image404);
            } catch (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('404 image not found');
            }
        }
    } else {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        res.end('Method not allowed');
    }
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

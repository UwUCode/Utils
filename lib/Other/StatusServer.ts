import { type Server, createServer } from "node:http";

export default function statusServer(check: () => boolean, host = "127.0.0.1", port = 3621) {
    const server = createServer((req, res) => {
        res.writeHead(check() ? 204 : 503, {
            "Content-Type":   "text/plain",
            "Content-Length": 0
        }).end();
    }).listen(port, host);
    const closeFunction: (() => void) & { server: Server; } = () => void server.close();
    closeFunction.server = server;
    return closeFunction;
}

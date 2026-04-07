import * as bodyParser from 'body-parser';
import express from 'express';  
import http from 'http';
import cors from 'cors'
import { mongooseConnection} from './database'
import * as packageInfo from '../package.json'
import { router } from './Routes'
import path from 'path';
import { initializeSocket } from './socket';
 
const app = express();


app.use(cors())
app.use(mongooseConnection)
app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
app.use("/public", express.static(path.join(process.cwd(), "public")));
const health = (_req, res) => {
    return res.status(200).json({
        message: `Project Name Server is Running, Server health is green`,
        app: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,   
        author: packageInfo.author,
        license: packageInfo.license
    })
}
const bad_gateway = (_req, res) => { return res.status(502).json({ status: 502, message: "Project Name Backend API Bad Gateway" }) }

app.get('/', health);
app.get('/health', health);
app.get('/socket-test', (_req, res) => {
    res.sendFile(path.join(process.cwd(), "public", "socket-test.html"));
});
app.get('/isServerUp', (_req, res) => {
    res.send('Server is running ');
});

app.use(router);

app.all(/.*/, bad_gateway);

let server = new http.Server(app);
initializeSocket(server);
export default server;

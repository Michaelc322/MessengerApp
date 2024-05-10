const express = require('express');
const {Server} = require('socket.io');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const authRouter = require('./routers/authRouter');
const session = require('express-session');
const server = require('http').createServer(app);
const RedisStore = require("connect-redis").default;
const {sessionMiddleware, wrap, corsConfig} = require('./controllers/serverController');
require('dotenv').config();

const io = new Server(server, {
    cors: corsConfig
});

const redisClient = require('./redis');
app.use(helmet())
app.use(cors(corsConfig));

app.use(express.json());



app.use(sessionMiddleware)

app.use("/auth", authRouter);
io.use(wrap(sessionMiddleware));

io.on("connection", (socket) => {
    console.log(socket.request.session.user.username)
});

server.listen(4000, () => {
    console.log('listening on port :4000');
});
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
const { authorizeUser, addFriend, initializeUser, onDisconnect, dm } = require('./controllers/socketController');
app.use(helmet())
app.use(cors(corsConfig));

app.use(express.json());



app.use(sessionMiddleware)

app.use("/auth", authRouter);
io.use(wrap(sessionMiddleware));
io.use(authorizeUser);

io.on("connect", socket => {
    initializeUser(socket);

    socket.on("add_friend", (friendName, cb) => {
        addFriend(socket, friendName, cb);
    })

    socket.on("dm", message => dm(socket, message));

    socket.on("disconnecting", () => onDisconnect(socket));

});



server.listen(4000, () => {
    console.log('listening on port :4000');
});
const redisClient = require("../redis");

module.exports.authorizeUser = (socket, next) => {
    if(!socket.request.session || !socket.request.session.user){
        next(new Error("Not authorized"))
    }else{
        socket.user = {...socket.request.session.user};
        redisClient.hset(
            `userid:${socket.user.username}`, 
            "userid", socket.user.userid
            );
        next();
    }
}

module.exports.initializeUser = async socket => {
    socket.user = { ...socket.request.session.user };
    socket.join(socket.user.userid);
    await redisClient.hset(
      `userid:${socket.user.username}`,
      "userid",
      socket.user.userid,
      "connected", true
    );
    const friendList = await redisClient.lrange(
      `friends:${socket.user.username}`,
      0,
      -1
    );

    const parsedFriendList = await parseFriendList(friendList);
    const friendRooms = parsedFriendList.map(friend => friend.userid);

    if(friendRooms.length > 0){
        socket.to(friendRooms).emit("connected", true, socket.user.username);
    }

    console.log(`${socket.user.username} friends:`, parsedFriendList);
    socket.emit("friends", parsedFriendList);

    const msgQuery = await redisClient.lrange(`chat:${socket.user.userid}`, 0, -1);
    // to.from.content

    const messages = msgQuery.map(msgStr => {
        const parsedStr = msgStr.split(".");
        return {
            to: parsedStr[0],
            from: parsedStr[1],
            content: parsedStr[2]
        }
    })

    if(messages && messages.length > 0){
        socket.emit("messages", messages);
    }

  };

module.exports.addFriend = async (socket, friendName, cb) => {
    if(friendName === socket.user.username){
        cb({done : false, errorMsg: "You can't add yourself as a friend!"});
        return;
    }
    const friend = await redisClient.hgetall(
        `userid:${friendName}`
        );
    
    const currentFriendList=await redisClient.lrange(
        `friends:${socket.user.username}`,
        0, -1
    );
    

    if(!friend.userid){
        cb({done : false, errorMsg: "User doesn't exist!"})
        return;
    }
    
    if(currentFriendList && currentFriendList.indexOf(`${friendName}.${friend.userid}`) !== -1){
        cb({done : false, errorMsg: "You are already friends!"})
        return;
    }

    await redisClient.lpush(`friends:${socket.user.username}`, [friendName, friend.userid].join("."));
    
    const newFriend = {
        username: friendName,
        userid: friend.userid,
        connected: friend.connected,
    }


    cb({done : true, newFriend})
}

module.exports.onDisconnect = async (socket) => {
    await redisClient.hset(`userid:${socket.user.username}`, "connected", false);
    // get friends
    // emit to all friends that offline

    const friendList = await redisClient.lrange(
        `friends:${socket.user.username}`,
        0,
        -1
    );
    const friendRooms = await parseFriendList(friendList).then(friends => friends.map(friend => friend.userid));
    console.log(friendRooms);
    socket.to(friendRooms).emit("connected", false, socket.user.username);

}


module.exports.dm = async (socket, message) => {
    message.from = socket.user.userid;
    const messageString = [message.to, message.from, message.content].join(".");

    await redisClient.lpush(`chat:${message.to}`, messageString);
    await redisClient.lpush(`chat:${message.from}`, messageString);

    socket.to(message.to).emit("dm", message);

}

const parseFriendList = async friendList => {
    const newFriendList = [];
    for(let friend of friendList){
        const parsedFriend = friend.split(".");
        const friendConnected = await redisClient.hget(`userid:${parsedFriend[0]}`, "connected");
        console.log(friendConnected, parsedFriend[0]);
        newFriendList.push({username: parsedFriend[0], userid: parsedFriend[1], connected: friendConnected});
    }
    return newFriendList;
}

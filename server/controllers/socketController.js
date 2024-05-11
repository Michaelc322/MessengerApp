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
    console.log(`${socket.user.username} friends:`, friendList);
    socket.emit("friends", friendList);
  };

module.exports.addFriend = async (socket, friendName, cb) => {
    if(friendName === socket.user.username){
        cb({done : false, errorMsg: "You can't add yourself as a friend!"});
        return;
    }
    console.log(friendName);
    const friendUserID = await redisClient.hget(`userid:${friendName}`, "userid");
    
    const currentFriendList=await redisClient.lrange(
        `friends:${socket.user.username}`,
        0, -1
    );
    
    if(!friendUserID){
        cb({done : false, errorMsg: "User doesn't exist!"})
        return;
    }
    

    if(currentFriendList && currentFriendList.indexOf(friendName) != -1){
        cb({done : false, errorMsg: "You are already friends!"})
        return;
    }

    await redisClient.lpush(`friends:${socket.user.username}`, friendName);
    cb({done : true})
}



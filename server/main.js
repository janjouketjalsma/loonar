import { Meteor } from 'meteor/meteor';

//Define settings
ROBOTIP = "192.168.43.2";
const Options = {
  sessionDuration:20
}

//Create the connections collection
const Connections = new Mongo.Collection("connections");

//Send all connectioninfo to the client
Meteor.publish('publicConnectionInfo', function publicConnectionInfo() {
  return Connections.find({});
});

//Init vars scoped to this file
var connectionId = "";

//Run at startup of meteor server
Meteor.startup(() => {
  //Update connections every 5 seconds
  Meteor.setInterval(function () {
    //Deactivate finished active sessions
    Connections.remove({timeRemaining: { $exists: true, $lte: 0},active:true});

    //Find current/next session
    let currentSession = Connections.findOne({$query:{finished: {$exists: false}},$orderby:{loginTime:1}});

    if(currentSession){
      //Check if current session is active
      if(!currentSession.active){
        //No existing session
        //Activate a new session
        Connections.update({_id : currentSession._id},{
          $set: {
            active: true,
            timeRemaining: Options["sessionDuration"] + 5
          }
        });
      }else{
        //Existing session
        //Update countdown for current session
        Connections.update({_id : currentSession._id},{
          $inc: { timeRemaining: -5 }
        });
      }
    }
  }, 5000);
});

Meteor.methods({
  moveRobot:function(options){
    let isMoving = false;
    let onlyLetters = /^[a-zA-Z]$/;
    let robotURL = "http://" + process.env.ROBOTIP + ":5000/loonar/api/v1.0";

    //Override speed on server side
    options["speed"] = 50;

    if(!isMoving){

      //Validate parameters
      if(options["direction"].match(/^[a-zA-Z]+$/) && !isNaN(options["speed"])){
        return HTTP.call("GET", robotURL + "/" + options["direction"] + "/" + options["speed"],{
          auth : "loonar:Authenticated"
        });
      }

    }else{
      //Error message: Wait for movement to complete
    }

  },
  connectionId: function(){
    return connectionId;
  }
});

Meteor.onConnection(function(conn) {
    if(Connections.find({conId : conn.id}).count() == 0){
      //New connection
      Connections.insert({
        'conId' : conn.id,
        'loginTime': Date()
      });
      connectionId = conn.id;
    }else{
      //Existing connection
    }
});

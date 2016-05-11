import { Meteor } from 'meteor/meteor';

//Define settings
ROBOTIP = "192.168.43.2";
const Options = {
  sessionDuration:600
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
    //Deactivate finished sessions
    Connections.update({timeRemaining: { $exists: true, $lte: 0}},{active: false,finished: true});

    //Find current session
    let currentSession = Connections.findOne({$query:{finished: {$exists: false}},$orderby:{loginTime:-1}});

    if(currentSession){
      //Check if current session is active
      if(Connections.find({active: true}).count() == 0){
        //No existing session
        //Activate a new session
        console.log("Starting new session");
        console.log("Time:",Options["sessionDuration"]);
        Connections.update({_id : currentSession._id},{
          active: true,
          timeRemaining: Options["sessionDuration"]
        });
      }else{
        //Existing session
        //Update countdown for current session
        console.log("Decrementing remaining time for session",currentSession._id);
        Connections.update({_id : currentSession._id},{
          $set: { active: true},
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

    //Override duraction on server side
    options["duration"] = 50;

    if(!isMoving){

      //Validate parameters
      if(options["direction"].match(/^[a-zA-Z]+$/) && !isNaN(options["duration"])){
        return HTTP.call("GET", robotURL + "/" + options["direction"] + "/" + options["duration"],{
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

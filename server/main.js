import { Meteor } from 'meteor/meteor';

const Connections = new Mongo.Collection("connections");

Meteor.publish('publicConnectionInfo', function publicConnectionInfo() {
  return Connections.find({});
});

let userIP = "";

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  moveRobot:function(options){
    let isMoving = false;
    let onlyLetters = /^[a-zA-Z]$/;
    let robotURL = "http://192.168.43.2:5000/loonar/api/v1.0";

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

  }
});

Meteor.onConnection(function(conn) {
    //Check if this is a new or an existing connection
    console.log("Existing connection?",Connections.find({conId : conn.id}).count());

    Connections.insert({
      'conId' : conn.id,
      'ip': conn.clientAddress,
      'loginTime': Date()
    });
});

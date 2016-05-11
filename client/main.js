import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe("publicConnectionInfo");

//Define collections
const Connections   = new Mongo.Collection("connections");

//Create a countdown timer
var countdownonnectionId
var myConnection;

Template.main.helpers({
  connection: function(){
    myConnection = ReactiveMethod.call("connectionId");
    return Connections.findOne({conId : myConnection});
  },
  status: function(){
    return Meteor.status();
  },
  queued: function(){
    return Connections.find();
  }
});

Template.timer.onRendered(function(){
  let conDetails = Connections.findOne({conId : myConnection});
  console.log(conDetails.timeRemaining);
  countdown = new ReactiveCountdown(conDetails.timeRemaining);
  countdown.start();
});

Template.timer.helpers({
  getCountdown: function() {
    let remainingSeconds = countdown.get();
    return ("00" + Math.floor(remainingSeconds / 60)).slice(-2) + ":" + ("00" + remainingSeconds % 60).slice(-2);
  }
});

Template.controls.events({
  "click .js-move": function(event){
    console.log(Connections.find().fetch());
    Meteor.call("moveRobot", {direction: event.target.getAttribute('data-direction')}, function(error, result){
      if(error){
        console.log("error", error);
      }
      if(result){
         console.log("moving!");
      }
    });
  }
});

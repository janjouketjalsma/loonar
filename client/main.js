import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Meteor.subscribe("publicConnectionInfo");

const Connections   = new Mongo.Collection("connections");
var countdown       = new ReactiveCountdown(600);
var myConnection  	= "";

countdown.start(function() {
  console.log("finished countdown");
});

Template.main.helpers({
  connection: function(){
    myConnection = Meteor.call("connectionId");
    console.log(myConnection);
    return Connections.find({conId : myConnection});
  },
  status: function(){
    return Meteor.status();
  }
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

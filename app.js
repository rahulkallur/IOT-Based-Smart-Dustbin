const express = require('express');
const app = express();
const path = require('path');
const Nexmo = require('nexmo');
const router = express.Router();
var five = require("johnny-five");

//Thingspeak Clent
var ThingSpeak = require('thingspeakclient');
var client = new ThingSpeak({updateTimeout:30000});
var cm,inches,cm1,inches1;
var count = 0;

//Channel ID && Keys
var channelID = 924739;
var writeKey = 'AYG09JJYNW399CX9';
const { Board, Proximity } = require("johnny-five");
const board = new Board();
app.use(express.static(__dirname + "/public"));
//const Nexmo = require('nexmo');

//Nexmo API
const nexmo = new Nexmo({
  apiKey: 'afe7ff44',
  apiSecret: '****************',
});

var lat=15.369328;
var longi=75.121968;

//Nexmo Message API
const from = 'Nexmo';
const to = '91**********';
const text = 'Alert!!!!Collect garbage from the location '+lat+','+longi+"\t"+"";

//Connecting To ThingSpeak Client
client.attachChannel(channelID, {writeKey: writeKey}, function (err){
    if (!err) {
        console.log(`Successfully connected to ThingSpeak`);
    }
    else {
        console.log(`Cannot connect to ThingSpeak!!`);
    }
  });

//Johnny-Five Ultrasonic Data Reading

  board.on("ready", () => {
    const proximity = new Proximity({
      controller: "HCSR04",
      pin: 7
    });
    
  //Sensor Emit the Data Continuosly to measure the garbage level
    proximity.on("change", () => {
      const {centimeters, inches} = proximity;
      console.log("Proximity: ");
      console.log("  cm  : ", centimeters);
      console.log("  in  : ", inches);
      console.log("-----------------");
      if(centimeters<=5)
      {
        if(count==0)//To send the SMS only once otherwise the API will enter into loop and it will send more than 20 messages at a time(To avoid this keep count of messages)
        {
          client.updateChannel(channelID, {field1:centimeters ,field2:inches}, function(err, resp) {
            if (!err && resp > 0) {
                console.log('updated successfully. Entry was: ' + resp + ". Data was: " + centimeters + ","+inches );
            }
            else {
                console.log("Cannot update to ThingSpeak");
            }
        });
        //Sending SMS To The Authority
        nexmo.message.sendSms(from, to, text);
        count++;
        }
        else{
          client.updateChannel(channelID, {field1:centimeters ,field2:inches}, function(err, resp) {
            if (!err && resp > 0) {
                console.log('updated successfully. Entry was: ' + resp + ". Data was: " + centimeters + ","+inches );
            }
            else {
                console.log("Cannot update to ThingSpeak");
            }
        });
          
        }
        
      }
      else{
        console.log('Cannot send message');
      }

     

    });
  });
  
      //if(centimeters <= 5 && count<=0)
      //{
                //Sending SMS To The Authority
        //nexmo.message.sendSms(from, to, text);
        //count++;


      //}
      
      
  
    //setTimeout(proximity.on,5000,'funky');




router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/index.html'));
  //__dirname : It will resolve to your project folder.
});

router.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/about.html'));
});

router.get('/sitemap',function(req,res){
  res.sendFile(path.join(__dirname+'/sitemap.html'));
});

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');

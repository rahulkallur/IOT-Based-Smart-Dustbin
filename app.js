const express = require('express');
const app = express();
const path = require('path');
const Nexmo = require('nexmo');
//const from = 'Nexmo';
//const to = '917795955689';
//const text = "Collect the garbage from this location"+15.369352+','+75.121570+"\t"+"";
const router = express.Router();
var five = require("johnny-five");
var ThingSpeak = require('thingspeakclient');

//var controller = process.argv[2] || "GP2Y0A02YK0F";
var client = new ThingSpeak({updateTimeout:30000});
var cm,inches,cm1,inches1;
var count = 0;
var channelID = 924739;
var writeKey = 'AYG09JJYNW399CX9';
const { Board, Proximity } = require("johnny-five");
const board = new Board();
app.use(express.static(__dirname + "/public"));
//const Nexmo = require('nexmo');

const nexmo = new Nexmo({
  apiKey: 'afe7ff44',
  apiSecret: 'aM1fvPLNA2uftxLi',
});
var lat=15.369328;
var longi=75.121968;
const from = 'Nexmo';
const to = '919980630498';
const text = 'Alert!!!!Collect garbage from the location '+lat+','+longi+"\t"+"";

client.attachChannel(channelID, {writeKey: writeKey}, function (err){
    if (!err) {
        console.log(`Successfully connected to ThingSpeak`);
    }
    else {
        console.log(`Cannot connect to ThingSpeak!!`);
    }
  });

  board.on("ready", () => {
    const proximity = new Proximity({
      controller: "HCSR04",
      pin: 7
    });
  
    proximity.on("change", () => {
      const {centimeters, inches} = proximity;
      console.log("Proximity: ");
      console.log("  cm  : ", centimeters);
      console.log("  in  : ", inches);
      console.log("-----------------");
      if(centimeters<=5)
      {
        if(count==0)
        {
          client.updateChannel(channelID, {field1:centimeters ,field2:inches}, function(err, resp) {
            if (!err && resp > 0) {
                console.log('updated successfully. Entry was: ' + resp + ". Data was: " + centimeters + ","+inches );
            }
            else {
                console.log("Cannot update to ThingSpeak");
            }
        });
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
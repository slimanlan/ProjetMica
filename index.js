const express = require("express");
const session = require('express-session');
const app = express();
const diff = require("dialogflow-fulfillment");
var path = require('path');
var PORT = process.env.PORT || 5000;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post("/", express.json(), (req, res) => {

    const agent = new diff.WebhookClient({
            request : req,
            response : res
    });

    function measureFDRCV(agent) {
        // Get parameters
        var global_context = agent.context.get('global_context').parameters;

        var FDRCV = 0; 

        if (global_context.sexe.toLowerCase() == "homme" && global_context.age.amount > 50 ) FDRCV++;   
        if (global_context.sexe.toLowerCase() == "femme" && global_context.age.amount > 60 ) FDRCV++; 
        if (global_context.Smoking.toLowerCase() == "oui") FDRCV++; 

        // convert hight from cm to metr
        var hight = global_context.numbersequence/100;
        var weight = global_context.unitweight.amount; 

        var IMC = weight / (hight  * hight) 

        if (IMC > 25) FDRCV++; 

        console.log("FDRCV = " + FDRCV); 
        console.log("IMC = " + IMC); 

        lastCacultedFDRCV = FDRCV; 
        lastCacultedMIC = IMC;
        
        agent.add("FDRCV = " + FDRCV);
        agent.add("IMC = " + IMC);
       

    }

    var intentMap = new Map();
    
    intentMap.set("RspPoids-AskFumer - no", measureFDRCV)
    intentMap.set("RspPoids-AskFumer - yes", measureFDRCV)
    intentMap.set("RspPoids-AskFumer", measureFDRCV)
    
    
    agent.handleRequest(intentMap);

})

app.listen(PORT, () => console.log("Server is live"));


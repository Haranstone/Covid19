//webhook for the chatbot


const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const axios = require('axios').default;
const request = require('request-promise');
const rp = require('request-promise-native');
var  nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;

 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  
  //Welcome function
  function welcome(agent){
    agent.add('Welcome I am samaritan , i am here to help you regarding corona issues \n\njust type menu and see for yourself.');
}
  

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  //function for covid19 summary by api.rootnet
  
  function coronaSummaryHandler(agent){
return rp('https://api.rootnet.in/covid19-in/stats/latest').then(result => { // Extract relevant details from data. 
    var str = JSON.parse(result); 
    var totalSummary= JSON.stringify(str.data.summary.total); 
    var confirmedIndianSummary= JSON.stringify(str.data.summary.confirmedCasesIndian);
    var confirmedForeignSummary= JSON.stringify(str.data.summary.confirmedCasesForeign);
    var dischargedSummary= JSON.stringify(str.data.summary.discharged);
    var deathsSummary= JSON.stringify(str.data.summary.deaths);    
    var finalSummary= "The COVID19 Summary, total cases in india is "+totalSummary+" \nConfirmed Indian Cases is "+confirmedIndianSummary+" \nConfirmed Foreign Cases is "+confirmedForeignSummary+" \nRecovered Cases "+dischargedSummary+ " \ntotal deaths "+deathsSummary+ " \n\nStay safe our government has doing everything in it's power to make you safe .";
    //return Promise.resolve(agent); 
    console.log(finalSummary);
    agent.add(finalSummary); 
})
 .catch(err=>{
  console.log(err);
});
}
  
//function for real time test cases by ICMR

function coronaTestCasesHandler(){
 return rp('https://api.rootnet.in/covid19-in/stats/testing/latest').then(result => { // Extract relevant details from data. 
  // Add it to the agent. 
  var str = JSON.parse(result); 
  var resu = str.data.totalSamplesTested; //.data.data.totalSamplesTested;
  var resuDate = JSON.stringify(str.data.day);
  var testResult = "The total number of test samples has been tested by ICMR so far is "+resu+" \nlast updated on "+ resuDate;
  console.log(testResult);
   agent.add(testResult);
})
.catch(err=>{
  console.log(err);
   agent.add(err);
});
}
 //function for bharat covaxin vaccine handler
 function covaxinVaccineHandler(agent){
 agent.add("COVAXINTM, India's indigenous COVID-19 vaccine by Bharat Biotech is developed in collaboration with the Indian Council of Medical Research (ICMR) - National Institute of Virology (NIV). \nThe indigenous, inactivated vaccine is developed and manufactured in Bharat Biotech's BSL-3 (Bio-Safety Level 3) high containment facility. \n\nThe vaccine received DCGI approval for Phase I & II Human Clinical Trials and the trials commenced across India from July, 2020. \n\nAfter successful completion of the interim analysis from the Phase 1 & 2 clinical trials of COVAXINTM, Bharat Biotech received DCGI approval for Phase 3 clinical trials in 26,000 participants in over 25 centres across India.");
 } 
 //function for oxford vaccine handler
  function oxfordVaccineHandler(agent){
  agent.add("The Oxford-AstraZeneca COVID-19 vaccine showed an average efficacy of 70.4%, with no hospitalisations or severe disease, according to the data. Serum Institute sought emergency use licence for a version of the British drugmaker’s vaccine in India last month. \n\nThe vaccine is 'virus-vectored', which means it is a version of a virus that normally infects chimpanzees and has been modified with a portion of the COVID-19 called the 'spike protein' to fire the immune system. \n\nThe authorisation is for two full doses administered with an interval of between four and 12 weeks.");
  }
  
let otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
//console.log(otp);
  
  function verifyOtpHandler(agent){
      var getOtp = agent.parameters.otp;
    
    if(getOtp==otp){
  agent.add("You have been successfully verified");
}
else{
  agent.add('otp is incorrect');
}
  }
  
  //function to collect data of volunteers
  function getEmailHandler(agent){
    var userEmail = agent.parameters.email; 
    var userName = agent.parameters.name;
    var userMobile = agent.parameters.number;
    //var userAadhar = agent.parameters.aadhar;
    var userState = agent.parameters.state;
    var userCity = agent.parameters.city;
    var url = "mongodb+srv://<YOUR CREDENTIAL>@cluster0.yhuli.mongodb.net";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("Vaccination");
  var myobj = { name: userName, email: userEmail, number: userMobile , State: userState, City: userCity};
  dbo.collection("interestedPeoples").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
  });
});
  
  agent.add("Corona Vaccines are ready to roll out in india when it reaches your city we'll let you know through your given email ID & mobile number. \n\nThank you for your time now just say 'quit' to exit the bot.");
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('coronaSummary', coronaSummaryHandler);
  intentMap.set('coronaTestCases', coronaTestCasesHandler);
  intentMap.set('covaxinVaccine', covaxinVaccineHandler );
  intentMap.set('oxfordVaccine', oxfordVaccineHandler);
   intentMap.set('getEmail', getEmailHandler);
  intentMap.set('getEmailOtp', verifyOtpHandler);
  agent.handleRequest(intentMap);
});

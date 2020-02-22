const esDomain = {
    region: 'us-east-1',
    endpoint: 'https://search-awsdomain-wu7hbch33jivnl7enixctz233y.us-east-1.es.amazonaws.com/',
    index: 'restaurants',
    doctype: 'json'
};
const AWS = require('aws-sdk');
const esEndpoint = new AWS.Endpoint(esDomain.endpoint);

var respondBody = null;
var requestid = null;
var requestid1 = null;
var data1 = null;
var data2 = null;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readFromEs(index, context, callback) {
    var req = new AWS.HttpRequest(esEndpoint);
    var path = require('path');
    req.method = 'GET';
    req.path = path.join('/', esDomain.index, "/_search?q=cuisine:chinese");
    
    console.log(req.path);
    req.region = esDomain.region;
    req.headers['presigned-expires'] = false;
    req.headers['Host'] = esEndpoint.host;
    var creds = new AWS.EnvironmentCredentials('AWS');
    var signer = new AWS.Signers.V4(req, 'es');  // es: service code
    signer.addAuthorization(creds, new Date());

    var send = new AWS.NodeHttpClient();
    
    
    send.handleRequest(req, null, function (httpResp) {
        // console.log(httpResp);
        var respBody = '';
        httpResp.on('data', function (chunk) {
            respBody += chunk;
        });
        httpResp.on('end', function (chunk) {
            console.log('Response: ' + respBody);
            respondBody = respBody;
            callback(respBody);
        });
    }, function (err) {
        console.log('Error: ' + err);
        context.fail('Lambda failed with error ' + err);
    });

}

exports.handler = async (event, context) => {
    //const yelp = require('yelp-fusion');
    //const client = yelp.client("Your Yelp API Key");
    var phoneUtil = require('./google-libphonenumber/dist/libphonenumber.js').PhoneNumberUtil.getInstance();
    var phoneNumberFormat = require('./google-libphonenumber/dist/libphonenumber.js').PhoneNumberFormat;
    
    //sEndpoint = new AWS.Endpoint(esDomain.endpoint);
    
    var message = "";
    var cusine = "";
    var actualMessage = "";
    var restaurantSuggestion = "";
    var sqsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/031005810056/Q1';
    AWS.config.update({region: 'us-east-1'});
    var sqs = new AWS.SQS();
    var ddb = new AWS.DynamoDB();
    var sns = new AWS.SNS();
    var receiveMessageParams = {
        QueueUrl: sqsQueueUrl,
        MaxNumberOfMessages: 1
    };
    return sqs.receiveMessage(receiveMessageParams).promise()
    .then((data) => {
        if(!data.hasOwnProperty('Messages')){
            throw new Error('No message in the SQS queue');
        }
        message = JSON.parse(data.Messages[0].Body).currentIntent.slots;
        actualMessage = JSON.parse(data.Messages[0].Body).currentIntent.slots;
        console.log('actual' + actualMessage.Cuisine);
        readFromEs(message['Cuisine'], context, (data) => {
            var arr = JSON.parse(respondBody).hits.hits;
            var length = arr.length;
            var id = Math.floor(Math.random() * Math.floor(length));
            var id1 = Math.floor(Math.random() * Math.floor(length));
            while(id1 ==  id) {
                id1 = Math.floor(Math.random() * Math.floor(length));
            }
            requestid = arr[id]._id;
            requestid1 = arr[id1]._id;
        })
        var deleteMessageParams = {
            QueueUrl: sqsQueueUrl,
            ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        return sqs.deleteMessage(deleteMessageParams).promise();
    })
    .then(async(data) => {
        await sleep(2000);
        console.log(requestid);
        console.log(requestid1);
        restaurantSuggestion = "Hello! Here are my "+actualMessage.Cuisine+" restaurant suggestions for "+actualMessage.NumberOfPeople+" people, for "+actualMessage.DiningDate+" at "+actualMessage.DiningTime+" ";
        //console.log(restaurantSuggestion);
        var dynamoparams = {
            TableName : 'yelp-restaurants',
            Key: {
                "Business_id": {S: requestid}
            }
        };
         var dynamoparams1 = {
            TableName : 'yelp-restaurants',
            Key: {
                "Business_id": {S: requestid1}
            }
        };
        data1 = await ddb.getItem(dynamoparams).promise();
        data2 = await ddb.getItem(dynamoparams1).promise();
        var data=[];
        data.push(data1);
        data.push(data2);
        return data;
      })
    .then((data) =>{
        restaurantSuggestion += "First restaurant: " + data[0].Item.name.S + " ";
        restaurantSuggestion += "and Second Restaurant: " + data[1].Item.name.S;
        var parsedPhoneNumber = phoneUtil.parseAndKeepRawInput(message.PhoneNumber,'US');
        var phoneNumberE164 = phoneUtil.format(parsedPhoneNumber, phoneNumberFormat.E164);
        var smsParams = {
              Message: restaurantSuggestion,
             PhoneNumber: phoneNumberE164
         };
        return sns.publish(smsParams).promise();
     })
     .then((data) =>{
         console.log("MessageID is " + data.MessageId);
     })
     .catch((err) => {
         console.log(err);
     })
};

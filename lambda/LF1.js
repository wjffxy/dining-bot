exports.handler = async (event) => {

    console.log('Loading function');
    console.log(event);

    if(event.invocationSource == "DialogCodeHook" && event.currentIntent.name == "GreetingIntent"){
        const response = {
            "dialogAction":{
                "fulfillmentState":"Fulfilled",
                "type":"Close",
                "message":{
                    "contentType":"PlainText",
                    "content": "Hi there, how can I help?"
                }
            }
        }
        return response;
    }else if (event.invocationSource == "DialogCodeHook" && event.currentIntent.name == "ThankYouIntent"){
        const response = {
            "dialogAction":{
                "fulfillmentState":"Fulfilled",
                "type":"Close",
                "message":{
                    "contentType":"PlainText",
                    "content": "You’re welcome"
                }
            }
        }
        return response;
    }else if (event.invocationSource == "FulfillmentCodeHook" && event.currentIntent.name == "DiningSuggestionsIntent"){
        var sqsQueueUrl = 'https://sqs.us-east-1.amazonaws.com/031005810056/Q1';
        var AWS = require('aws-sdk');
        AWS.config.update({region: 'us-east-1'});
        var sqs = new AWS.SQS();
        var params = {
            MessageBody: JSON.stringify(event),
            QueueUrl: sqsQueueUrl
        };
        return sqs.sendMessage(params).promise()
        .then((data) => {
            console.log("Success");
            const response = {
                "dialogAction":{
                    "fulfillmentState":"Fulfilled",
                    "type":"Close",
                    "message":{
                        "contentType":"PlainText",
                        "content": "Thanks for the information. I will send you the restaurant recommendations shortly through an SMS! Have a good day"
                    }
                }
            }
            return response;
        }).catch((err) => {
            console.log(err);
        })
    }
};
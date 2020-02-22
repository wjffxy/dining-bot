const AWS =  require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const lexruntime = new AWS.LexRuntime();
var lexChatbotParams = {
        botAlias: 'DCCTest',
        botName: 'DiningConciergeChatBot',
        inputText: event.message,
        userId: event.identityID,
        requestAttributes: {},
        sessionAttributes: {}
    };



exports.handler = async (event) => {

    return lexruntime.postText(lexChatbotParams).promise()
    .then((data) =>{
        console.log(data);
        if(data == null || data.message == null){
            const response = {
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            statusCode: 200,
            body: "I'm still under development"
        };
        return response;
        } else{
            const response = {
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
            statusCode: 200,
            body: data.message
        };
        return response;
        }
        
    })
    .catch((err) =>{
        console.log(err);
    })
};
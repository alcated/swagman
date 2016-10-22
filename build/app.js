'use strict';

var restify = require('restify');
var builder = require('botbuilder');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// 
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=3b841c2d-ce9c-446d-928a-779494338dda&subscription-key=a85bdd4890f74341b6257f62b9787f80');

// 
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.SWAGMAN_APP_ID,
    appPassword: process.env.SWAGMAN_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', intents);

intents.matches('StartActivity', [function (session, args) {
    builder.Prompts.text(session, "What kind of wear do you want to buy today ?");
    console.log('args', args);
    var greeting = builder.EntityRecognizer.findEntity(args.entities, "Greeting");
    console.log('greeting', greeting);
}]);
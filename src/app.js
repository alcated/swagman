const restify = require('restify');
const builder = require('botbuilder');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create a LuisRecognizer that’s pointed at your model
const recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=3b841c2d-ce9c-446d-928a-779494338dda&subscription-key=a85bdd4890f74341b6257f62b9787f80');

// Configure cloud based intent recognition services with LUIS
const intents = new builder.IntentDialog({ recognizers: [recognizer] });

// Create chat bot
const connector = new builder.ChatConnector({
    appId: process.env.SWAGMAN_APP_ID,
    appPassword: process.env.SWAGMAN_APP_PASSWORD
});
const bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', intents);

intents.matches('StartActivity', [
    function (session, args) {   
        // Process optional entities received from LUIS
    	var greeting = builder.EntityRecognizer.findEntity(args.entities, "Greeting");
        if (greeting) builder.Prompts.text(session, "Are you looking for a new outfit ?");
    	console.log('greeting', greeting);
    }
]);
const assert = require('assert');
const builder = require('botbuilder');

describe('Dialogs', function () {
    this.timeout(5000);
    it('should redirect to another dialog with arguments', function (done) {
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        bot.dialog('/', [
            function (session) {
                session.beginDialog('/child', { foo: 'bar' })
            },
            function (session, results) {
                assert(results.response.bar === 'foo');
                session.send('done');
            }
        ]);
        bot.dialog('/child', function (session, args) {
            assert(args.foo === 'bar');
            session.endDialogWithResult({ response: { bar: 'foo' } });
        });
        bot.on('send', function (message) {
            assert(message.text == 'done');
            done();
        });
        connector.processMessage('start');
    });

    it('should process a waterfall of all built-in prompt types', function (done) {
        var step = 0;
        const connector = new builder.ConsoleConnector();
        const bot = new builder.UniversalBot(connector);
        bot.dialog('/', [
            function (session) {
                assert(session.message.text == 'start');
                builder.Prompts.text(session, 'enter text');
            },
            function (session, results) {
                assert(results.response === 'some text');
                builder.Prompts.number(session, 'enter a number');
            },
            function (session, results) {
                assert(results.response === 42);
                builder.Prompts.choice(session, 'pick a color', 'red|green|blue');
            },
            function (session, results) {
                assert(results.response && results.response.entity === 'green');
                builder.Prompts.confirm(session, 'Is green your choice?');
            },
            function (session, results) {
                assert(results.response && results.response === true);
                builder.Prompts.time(session, 'enter a time');
            },
            function (session, results) {
                assert(results.response);
                const date = builder.EntityRecognizer.resolveTime([results.response]);
                assert(date);
                session.send('done');
            }
        ]);
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    assert(message.text == 'enter text');
                    connector.processMessage('some text');
                    break;
                case 2:
                    connector.processMessage('42');
                    break;
                case 3:
                    connector.processMessage('green');
                    break;
                case 4:
                    connector.processMessage('yes');
                    break;
                case 5:
                    connector.processMessage('in 5 minutes');
                    break;
                case 6:
                    assert(message.text == 'done');
                    done();
                    break;
            }
        });
        connector.processMessage('start');
    });

    it('should process a waterfall of all built-in prompt types', function (done) {
        var step = 0;
        // 
        const recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=3b841c2d-ce9c-446d-928a-779494338dda&subscription-key=a85bdd4890f74341b6257f62b9787f80');

        // 
        const intents = new builder.IntentDialog({ recognizers: [recognizer] });

        // Create chat bot
        const connector = new builder.ConsoleConnector();

        const bot = new builder.UniversalBot(connector);
        bot.dialog('/', intents);
        intents.onBegin((session, args, next) => {
            session.send("At anytime send a greeting if you need my services");
            next();
        });
        intents.matches('StartActivity', [
            function (session, args) {
                var greeting = builder.EntityRecognizer.findEntity(args.entities, "Greeting");
                assert(greeting);
                builder.Prompts.text(session, 'Are you looking for a new outfit ?');
                session.endDialogWithResult();
            }
        ]);
        bot.on('send', function (message) {
            switch (++step) {
                case 1:
                    assert(message.text == 'At anytime send a greeting if you need my services');                    
                    break;
                case 2:
                    assert(message.text == 'Are you looking for a new outfit ?');
                    done();
                    break;
            }
        });
        connector.processMessage('Good morning Swagman');

    });
});

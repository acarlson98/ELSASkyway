// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = 'AC179c861f45421ac06909f635f06cb093';
const authToken = '2cb0c08f6cb526421ea688223538999c';
const client = require('twilio')(accountSid, authToken);

// 1(201)801-4005

client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+12018014005', // Twilio number
     to: '+14022535372' // Drew's number
   })
  .then(message => console.log(message.sid));

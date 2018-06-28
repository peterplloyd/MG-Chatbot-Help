var TwitterPackage = require('twitter');

var secret = {
  consumer_key: 't3kWS6zbYGJhMOdeNWsHTv1zs',
  consumer_secret: 'YSqOydkRw2GFUJva0FTv8592fMt8JXJfwo9VQ7Z2fHA0qihRpp',
  access_token_key: '19545357-sNF91i0MG2OX7i51g8sA9hRha89cG9dKFLXZb8zoR',
  access_token_secret: 'YUz0vx6h4ypXlsULP5zja29kwk44DHnGaknbEoP0Kmq3m'
}
var Twitter = new TwitterPackage(secret);

// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
Twitter.stream('statuses/filter', {track: '#mghackhelp'}, function(stream) {

  // ... when we get tweet data...
  stream.on('data', function(tweet) {

    // print out the text of the tweet that came in
    console.log(tweet.text);

    //build our reply object
    var statusObj = {status: "Hi @" + tweet.user.screen_name + ", Whatever your reply is"}

    //call the post function to tweet something
    Twitter.post('statuses/update', statusObj,  function(error, tweetReply, response){

      //if we get an error print it out
      if(error){
        console.log(error);
      }

      //print the text of the tweet we sent out
      console.log(tweetReply.text);
    });
  });

  // ... when we get an error...
  stream.on('error', function(error) {
    //print out the error
    console.log(error);
  });
});

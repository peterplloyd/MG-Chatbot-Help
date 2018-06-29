var TwitterPackage = require("twitter"),
  AWS = require("aws-sdk"),
  fs = require("fs");

AWS.config.update({ region: "eu-west-1" });

var secret = {
  consumer_key: "t3kWS6zbYGJhMOdeNWsHTv1zs",
  consumer_secret: "YSqOydkRw2GFUJva0FTv8592fMt8JXJfwo9VQ7Z2fHA0qihRpp",
  access_token_key: "19545357-sNF91i0MG2OX7i51g8sA9hRha89cG9dKFLXZb8zoR",
  access_token_secret: "YUz0vx6h4ypXlsULP5zja29kwk44DHnGaknbEoP0Kmq3m"
};
var Twitter = new TwitterPackage(secret);
var comprehend = new AWS.Comprehend({ apiVersion: "2017-11-27" });

// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
Twitter.stream("statuses/filter", { track: "#mghackhelp" }, function(stream) {
  // ... when we get tweet data...

  stream.on("data", function(tweet) {
    var keywords = ["order", "price", "wrong", "return"];
    //stream(keywords);

    //function stream(keywords) {
    // print out the text of the tweet that came in

    //This is to test with fake tweets without having to post them
    //var tweet = { text: "Angry about rubbish money price" };

    var params = {
      LanguageCode: "en",
      Text: tweet.text
    };

    var phrasesData = detectKeyPhrases(params);

    console.log("Phrases: " + phrasesData);

    function detectKeyPhrases(params) {
      var phrasesOutput = comprehend.detectKeyPhrases(params, function(
        err,
        data
      ) {
        if (err) {
          console.log(err, err.stack);
        } else {
          return data;
        }
      });
      return phrasesOutput;
    }

    //Get Sentiment Data
    var sentimentData = detectSentiment(params);

    function detectSentiment(params) {
      var sentimentOutput = comprehend.detectSentiment(params, function(
        err,
        data
      ) {
        if (err) {
          console.log(err, err.stack);
        } else {
          return data;
        }
      });
      return sentimentOutput;
    }

    //Check message for keywords
    var registeredKeyword = findWord(keywords, tweet.text);

    function findWord(keywords, tweet) {
      var match = [];

      keywords.forEach(function(el) {
        if (RegExp("\\b" + el + "\\b").test(tweet)) {
          match = el;
        }
      });
      return match;
    }

    //Response
    var customerResponse = getResponse(registeredKeyword);

    function getResponse(registeredKeyword) {
      //Order
      switch (registeredKeyword) {
        case "order":
          return "Dang girl! Lets go track that order hun!";
        //Wrong Price
        case "price":
          return "I wish everything was free! Slide into our DMs and we'll sort it out";
        //Wrong Size
        case "size":
          return "Gotta look fly in the right swag! Lets get your stuff sorted. missguided.co.uk/help";
        //Returns
        case "return":
          return "Sorry you didn't like it! Gotta look fire for the 'gram";
        default:
          return "Please send us a DM and we'll get back to you asap";
      }
    }

    //build our reply object
    var statusObj = {
      status: "Hi @" + tweet.user.screen_name + ",",
      in_reply_to_status_id: "" + tweet.id_str
    };

    //Send all our Data to a txt file
    var analyticsResults =
      "Tweet: " +
      tweet.text +
      "\nKeyWords: " +
      registeredKeyword +
      "\nReply: " +
      customerResponse +
      "\nSentiment: " +
      sentimentData +
      "\nPhrase Data: " +
      phrasesData;

    fs.writeFile("results.txt", analyticsResults, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });

    //call the post function to tweet something
    Twitter.post("statuses/update", statusObj, function(
      error,
      tweetReply,
      response
    ) {
      //if we get an error print it out
      if (error) {
        console.log(error);
      }
    });
  });

  //... when we get an error...
  stream.on("error", function(error) {
    //print out the error
    console.log(error);
  });
});

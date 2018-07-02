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

    var params = {
      LanguageCode: "en",
      Text: tweet.text
    };

    function detectKeyPhrases(params, cb) {
      comprehend.detectKeyPhrases(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          cb(data);
        }
      });
    }

    //Get Sentiment Data
    function detectSentiment(params, cb) {
      comprehend.detectSentiment(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          cb(data);
        }
      });
    }

    //Check message for keywords
    var registeredKeyword = findWord(keywords, tweet.text);

    function findWord(keywords, tweet) {
      var match;

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
      status: "Hi @" + tweet.user.screen_name + "," + customerResponse,
      in_reply_to_status_id: "" + tweet.id_str
    };

    detectKeyPhrases(params, data => {
      var analyticsResults =
        "Tweet: " +
        tweet.text +
        "\nKeyWords: " +
        registeredKeyword +
        "\nReply: " +
        customerResponse +
        "\nPhrase Data: " +
        JSON.stringify(data);

      fs.appendFileSync(
        "results.txt",
        analyticsResults,
        "utf8",
        { flags: "a+" },
        function(err) {
          if (err) {
            return console.log(err);
          } else {
            console.log("The file was saved!");
          }
        }
      );
    });

    detectSentiment(params, data => {
      var analyticsResults = "\nSentiment: " + JSON.stringify(data);

      fs.appendFileSync(
        "results.txt",
        analyticsResults,
        "utf8",
        { flags: "a+" },
        function(err) {
          if (err) {
            return console.log(err);
          } else {
            console.log("The file was saved!");
          }
        }
      );
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

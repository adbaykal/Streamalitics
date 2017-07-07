const express = require('express');
const bodyParser= require('body-parser');
const app = express();

var session        = require('express-session');
var passport       = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request        = require('request');

//config file
var configFile = "./config.json";
if(app.get('env') === "development")
{
    configFile = "./config.local.json";
}

var config = require(configFile);

// Define our constants, you will change these with your own
const TWITCH_CLIENT_ID = config.TwitchClientId;
const TWITCH_SECRET    = config.TwitchSecret;
const SESSION_SECRET   = config.SessionSecret;
var CALLBACK_URL     = config.TwitchCallbackUrl; 

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

app.use('/assets',express.static('assets'));
app.use('/pages',express.static('pages'));

//Model definition
var analytics = {
    user : null,
    channel: null,
    viewers:null
};

//Passport overriding
// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/kraken/user',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'OAuth ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://api.twitch.tv/kraken/oauth2/authorize',
    tokenURL: 'https://api.twitch.tv/kraken/oauth2/token',
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: CALLBACK_URL,
    state: true
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    // Securely store user profile in your DB
    //User.findOrCreate(..., function(err, user) {
    //  done(err, user);
    //});

    done(null, profile);
  }
));

//View Actions

app.get('/', (req, res) =>  {
    if(req.session && req.session.passport && req.session.passport.user) {

        analytics.user = req.session.passport.user;
        
        res.render('index.ejs',analytics);

    } else {
        CALLBACK_URL  = req.protocol + '://' + req.get('host') + config.TwitchCallbackUrl;

        res.render('login.ejs');
    }
})

app.get('/logout', (req, res) =>  {
    if(req.session && req.session.passport && req.session.passport.user) {

        req.session.passport = null;
        
    } 

    res.render('login.ejs');
})

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read channel_editor channel_read channel_subscriptions' }));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));


//JSON Actions
app.get('/channel', (req,res) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        //GET Channel info
        // prepare the header
        var chanOptions = {
            url : 'https://api.twitch.tv/kraken/channel',
            method : 'GET',
            headers : {
                'Accept' : 'application/vnd.twitchtv.v5+json',
                'Client-ID' : TWITCH_CLIENT_ID,
                'Authorization':'OAuth ' + req.session.passport.user.accessToken,
            }
        };

        function chanCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var channelRes = JSON.parse(body);
                console.log(body);
                analytics.channel = channelRes;
                res.send(channelRes);
            }
        }
        
        request(chanOptions, chanCallback);
    }
})

app.get('/stream', (req,res) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        //GET Channel info
        // prepare the header
        var streamOptions = {
            url : 'https://api.twitch.tv/kraken/streams/'+req.session.passport.user._id,
            method : 'GET',
            headers : {
                'Accept' : 'application/vnd.twitchtv.v5+json',
                'Client-ID' : TWITCH_CLIENT_ID,
                'Authorization':'OAuth ' + req.session.passport.user.accessToken,
            }
        };

        function streamCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var streamRes = JSON.parse(body);
                console.log(body);
                res.send(streamRes.stream);
            }
        }
        
        request(streamOptions, streamCallback);
    }
})

app.get('/viewer', (req,res) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        //GET Channel info
        // prepare the header
        /*var viewerOptions = {
            url : 'https://tmi.twitch.tv/group/user/'+req.session.passport.user.name+'/chatters',
            method : 'GET'
        };*/
        
        var viewerOptions = {
            url : 'https://tmi.twitch.tv/group/user/playhearthstone/chatters',
            method : 'GET'
        };
        

        function viewerCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var viewerRes = JSON.parse(body);
                console.log(body);
                res.send(viewerRes);
            }
        }
        
        request(viewerOptions, viewerCallback);
    }
})

app.get('/follower', (req,res) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        //GET Channel info
        // prepare the header
        var followerOptions = {
            url : 'https://api.twitch.tv/kraken/channels/'+req.session.passport.user._id+'/follows',
            method : 'GET',
            headers : {
                'Accept' : 'application/vnd.twitchtv.v5+json',
                'Client-ID' : TWITCH_CLIENT_ID,
                'Authorization':'OAuth ' + req.session.passport.user.accessToken,
            }
        };

        function followerCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var followerRes = JSON.parse(body);
                console.log(body);
                res.send(followerRes);
            }
        }
        
        request(followerOptions, followerCallback);
    }
})

app.get('/subscriber', (req,res) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        //GET Channel info
        // prepare the header
        var subsOptions = {
            url : 'https://api.twitch.tv/kraken/channels/'+req.session.passport.user._id+'/subscriptions',
            method : 'GET',
            headers : {
                'Accept' : 'application/vnd.twitchtv.v5+json',
                'Client-ID' : TWITCH_CLIENT_ID,
                'Authorization':'OAuth ' + req.session.passport.user.accessToken,
            }
        };

        function subsCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var subsRes = JSON.parse(body);
                console.log(body);
                res.send(subsRes);
            }
        }
        
        request(subsOptions, subsCallback);
    }
})

app.get('/games', (req,res) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        //GET Channel info
        // prepare the header
        var gamesOptions = {
            url : 'https://api.twitch.tv/kraken/games/top?limit=100',
            method : 'GET',
            headers : {
                'Accept' : 'application/vnd.twitchtv.v5+json',
                'Client-ID' : TWITCH_CLIENT_ID
            }
        };

        function gamesCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var gamesRes = JSON.parse(body);
                console.log(body);
                res.send(gamesRes);
            }
        }
        
        request(gamesOptions, gamesCallback);
    }
})

app.post('/updateStreamInfo',(req,res) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        //GET Channel info
        // prepare the header
        var reqObj = {
            'channel':
            {
                'status': req.body.description,
                'game':req.body.game
            }
        };

        var updateOptions = {
            url : 'https://api.twitch.tv/kraken/channels/' + req.session.passport.user._id,
            method : 'PUT',
            headers : {
                'Accept' : 'application/vnd.twitchtv.v5+json',
                'ContentType':'application/json',
                'Client-ID' : TWITCH_CLIENT_ID,
                'Authorization':'OAuth ' + req.session.passport.user.accessToken,
            },
            json: reqObj
        };

        function updateCallback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var updateRes = body;
                console.log(body);
                res.send(updateRes);
            }else
            {
                res.send(500,response.body);
            }
        }
        
        request(updateOptions, updateCallback);
    }
})

//Server port info gurtell's comment
var serverPort = process.env.PORT || 3000;

app.listen(serverPort, function() {
  console.log('listening on '+serverPort)
})
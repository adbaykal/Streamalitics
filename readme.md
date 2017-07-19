## Synopsis

Streamalitics is an open-source Twitch Streamer Dashboard utility which viewers can monitor Twitch statistics during their streams. 


## Used Components

The backend of Streamalitics were written in express.js which is a web application library of node.js. Additional libraries that are used on the application are:

 - request - For creating http/https request for querying Twitch API.
 - passport - For oAuth athentication operations for Twitch API
 - session - For managing session variables

## Motivation

This code contains node.js backend of the application. Since the front-end were written using a premium template, they could not be opened as open-source. The purpose of this repository is to illustrate how the Twitch API can be queried using express.js.

## Installation

You need to install neccessary dependencies by running:

```
npm install
```

After installing you can run the program by:

```
node server.js
```

## Contributors

Thanks to [Gürkan Telseren](https://github.com/gurtell) Gürkan Telseren for ideas for improvement and code contribution.

## License

This software is protected under MIT licence.
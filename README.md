# p2p-video-conferencing

This repository contains a functional web app implementation of a video conferencing software. Through the use of PeerJS and a PeerServer, it is a peer-to-peer system that does not rely on a server for each user to stay connected; instead they are connected in a network among themselves. The backend consists of a Node.js app with Express.js as the server-side middleware. EJS has been used as the templating engine for Express. <br>

Another implementation is that of Three.js to create an interactive 3D globe on the landing page. This is not integral to the project, but having learnt 3D modelling recently I wished to test its usability in the frontend.

Due to the limitations of deploying this application on Heroku, I have not implemented a Peer Server (provided by the folks at PeerJS). A local Peer Server cannot be run on a different port in the same instance either. As such I am routing my peer traffic through PeerJS's free community cloud-hosted peer server. This may occasionally cause a clash in generated IDs, however since this app was made for educational purposes, this is a risk I am willing to overlook.

The application can be found for free use <a href="https://stella-meet.herokuapp.com/" target="_blank">here</a>. Keep in mind Heroku applications go to sleep after 30 minutes of inactivity, so a loading period should be expected.

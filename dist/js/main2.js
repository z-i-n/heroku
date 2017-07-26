/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
/* global TimelineDataSeries, TimelineGraphView */

'use strict';
var remoteVideo = document.querySelector('#remoteVideo');
var localVideo = document.querySelector('#localVideo');
//var callButton = document.querySelector('button#callButton');
var hangupButton = document.querySelector('button#hangupButton');
//var codecSelector = document.querySelector('select#codec');
hangupButton.disabled = true;
// callButton.onclick = call;
hangupButton.onclick = hangUpCall;
var count = 0;
var isOffer = false;
var PeerConnection;
var hasAddTrack = false;
var localStream;

var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
  voiceActivityDetection: false
};

var mediaConstraints = {
  audio: true,            // We want an audio track
  video: true             // ...and we want a video track
};

var servers = {
    'iceServers': [
      /*{url:'stun:stun01.sipphone.com'},/*error*/
      {url:'stun:stun.ekiga.net'},
      /*{url:'stun:stun.fwdnet.net'},/*error*/
      {url:'stun:stun.ideasip.com'},
      /*{url:'stun:stun.iptel.org'},/*error*/
      {url:'stun:stun.rixtelecom.se'},
      {url:'stun:stun.schlund.de'},
      {url:'stun:stun.l.google.com:19302'},
      {url:'stun:stun1.l.google.com:19302'},
      {url:'stun:stun2.l.google.com:19302'},
      {url:'stun:stun3.l.google.com:19302'},
      {url:'stun:stun4.l.google.com:19302'},
      {url:'stun:stunserver.org'},
      {url:'stun:stun.softjoys.com'},
      {url:'stun:stun.voiparound.com'},
      {url:'stun:stun.voipbuster.com'},
      {url:'stun:stun.voipstunt.com'},
      {url:'stun:stun.voxgratia.org'},
      {url:'stun:stun.xten.com'},
      {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
      },
      {
          url: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      },
      {
          url: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      }
    ]
};

var pcConstraints = {
  'optional': []
};

// Output an error message to console.

function log_error(text) {
  var time = new Date();

  console.error("[" + time.toLocaleTimeString() + "] " + text);
}


function createPeerConnection() {
  console.log("Setting up a connection...");

  // Create an RTCPeerConnection which knows to use our chosen
  // STUN server.

  PeerConnection = new RTCPeerConnection(servers, pcConstraints);

  // Do we have addTrack()? If not, we will use streams instead.

  hasAddTrack = (PeerConnection.addTrack !== undefined);

  // Set up event handlers for the ICE negotiation process.

  PeerConnection.onicecandidate = handleICECandidateEvent;
  PeerConnection.onnremovestream = handleRemoveStreamEvent;
  PeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
  PeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
  PeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  PeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;

  // Because the deprecation of addStream() and the addstream event is recent,
  // we need to use those if addTrack() and track aren't available.

  if (hasAddTrack) {
    PeerConnection.ontrack = handleTrackEvent;
  } else {
    PeerConnection.onaddstream = handleAddStreamEvent;
  }
}

// Called by the WebRTC layer to let us know when it's time to
// begin (or restart) ICE negotiation. Starts by creating a WebRTC
// offer, then sets it as the description of our local media
// (which configures our local media stream), then sends the
// description to the callee as an offer. This is a proposed media
// format, codec, resolution, etc.

function handleNegotiationNeededEvent() {
  console.log("*** Negotiation needed");
  if (isOffer && count < 1) {
    count++;
    console.log("---> Creating offer");
    PeerConnection.createOffer(offerOptions).then(function(offer) {
      console.log("---> Creating new description object to send to remote peer");
      return PeerConnection.setLocalDescription(offer);
    })
    .then(function(desc) {
      console.log("---> Sending offer to remote peer");

      socket.emit('offer', JSON.stringify( PeerConnection.localDescription ));
    })
    .catch(reportError);
  }
}


// Called by the WebRTC layer when events occur on the media tracks
// on our WebRTC call. This includes when streams are added to and
// removed from the call.
//
// track events include the following fields:
//
// RTCRtpReceiver       receiver
// MediaStreamTrack     track
// MediaStream[]        streams
// RTCRtpTransceiver    transceiver

function handleTrackEvent(event) {
  console.log("*** Track event");
  remoteVideo.srcObject = event.streams[0];
}

// Called by the WebRTC layer when a stream starts arriving from the
// remote peer. We use this to update our user interface, in this
// example.

function handleAddStreamEvent(event) {
  console.log("*** Stream added");
  remoteVideo.srcObject = event.stream;
}

// An event handler which is called when the remote end of the connection
// removes its stream. We consider this the same as hanging up the call.
// It could just as well be treated as a "mute".
//
// Note that currently, the spec is hazy on exactly when this and other
// "connection failure" scenarios should occur, so sometimes they simply
// don't happen.

function handleRemoveStreamEvent(event) {
  console.log("*** Stream removed");
  closeVideoCall();
}

// Handles |icecandidate| events by forwarding the specified
// ICE candidate (created by our local ICE agent) to the other
// peer through the signaling server.

function handleICECandidateEvent(event) {
  if (event.candidate) {
    console.log("Outgoing ICE candidate: " + event.candidate.candidate);

    socket.emit("candidate", event.candidate);
  }
}

// Handle |iceconnectionstatechange| events. This will detect
// when the ICE connection is closed, failed, or disconnected.
//
// This is called when the state of the ICE agent changes.

function handleICEConnectionStateChangeEvent(event) {
  console.log("*** ICE connection state changed to " + PeerConnection.iceConnectionState);

  switch(PeerConnection.iceConnectionState) {
    case "closed":
    case "failed":
    case "disconnected":
      closeVideoCall();
      break;
  }
}

// Set up a |signalingstatechange| event handler. This will detect when
// the signaling connection is closed.
//
// NOTE: This will actually move to the new RTCPeerConnectionState enum
// returned in the property RTCPeerConnection.connectionState when
// browsers catch up with the latest version of the specification!

function handleSignalingStateChangeEvent(event) {
  console.log("*** WebRTC signaling state changed to: " + PeerConnection.signalingState);
  switch(PeerConnection.signalingState) {
    case "closed":
      closeVideoCall();
      break;
  }
}

// Handle the |icegatheringstatechange| event. This lets us know what the
// ICE engine is currently working on: "new" means no networking has happened
// yet, "gathering" means the ICE engine is currently gathering candidates,
// and "complete" means gathering is complete. Note that the engine can
// alternate between "gathering" and "complete" repeatedly as needs and
// circumstances change.
//
// We don't need to do anything when this happens, but we log it to the
// console so you can see what's going on when playing with the sample.

function handleICEGatheringStateChangeEvent(event) {
  console.log("*** ICE gathering state changed to: " + PeerConnection.iceGatheringState);
}

// Close the RTCPeerConnection and reset variables so that the user can
// make or receive another call if they wish. This is called both
// when the user hangs up, the other user hangs up, or if a connection
// failure is detected.

function closeVideoCall() {

  console.log("Closing the call");

  // Close the RTCPeerConnection

  if (PeerConnection) {
    console.log("--> Closing the peer connection");

    // Disconnect all our event listeners; we don't want stray events
    // to interfere with the hangup while it's ongoing.

    PeerConnection.onaddstream = null;  // For older implementations
    PeerConnection.ontrack = null;      // For newer ones
    PeerConnection.onremovestream = null;
    PeerConnection.onnicecandidate = null;
    PeerConnection.oniceconnectionstatechange = null;
    PeerConnection.onsignalingstatechange = null;
    PeerConnection.onicegatheringstatechange = null;
    PeerConnection.onnotificationneeded = null;

    // Stop the videos

    if (remoteVideo.srcObject) {
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    if (localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach(track => track.stop());
    }

    remoteVideo.src = null;
    localVideo.src = null;

    // Close the peer connection

    PeerConnection.close();
    PeerConnection = null;
  }

  // Disable the hangup button

  hangupButton.disabled = true;
}

// Handle the "hang-up" message, which is sent if the other peer
// has hung up the call or otherwise disconnected.

function handleHangUpMsg(msg) {
  console.log("*** Received hang up notification from other peer");

  closeVideoCall();
}

// Hang up the call by closing our end of the connection, then
// sending a "hang-up" message to the other peer (keep in mind that
// the signaling is done on a different connection). This notifies
// the other peer that the connection should be terminated and the UI
// returned to the "no call in progress" state.

function hangUpCall() {
  closeVideoCall();
  socket.emit("hang-up");
}

// Handle a click on an item in the user list by inviting the clicked
// user to video chat. Note that we don't actually send a message to
// the callee here -- calling RTCPeerConnection.addStream() issues
// a |notificationneeded| event, so we'll let our handler for that
// make the offer.

function invite() {
  console.log("Starting to prepare an invitation");
  if (PeerConnection) {
    alert("You can't start a call because you already have one open!");
  } else {
    console.log("Setting up connection to invite");
    createPeerConnection();

    // Now configure and create the local stream, attach it to the
    // "preview" box (id "local_video"), and add it to the
    // RTCPeerConnection.

    console.log("Requesting webcam access...");

    navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(function(localStream) {
      console.log("-- Local video stream obtained");
      localVideo.src = window.URL.createObjectURL(localStream);
      localVideo.srcObject = localStream;

      if (hasAddTrack) {
        console.log("-- Adding tracks to the RTCPeerConnection");
        localStream.getTracks().forEach(track => PeerConnection.addTrack(track, localStream));
      } else {
        console.log("-- Adding stream to the RTCPeerConnection");
        PeerConnection.addStream(localStream);
      }
    })
    .catch(handleGetUserMediaError);
  }
}

// Accept an offer to video chat. We configure our local settings,
// create our RTCPeerConnection, get and attach our local camera
// stream, then create and send an answer to the caller.

function handleVideoOfferMsg(msg) {
  var localStream = null;
  // Call createPeerConnection() to create the RTCPeerConnection.

  console.log("Starting to accept invitation");
  createPeerConnection();

  // We need to set the remote description to the received SDP offer
  // so that our local WebRTC layer knows how to talk to the caller.

  var desc = new RTCSessionDescription(msg);

  PeerConnection.setRemoteDescription(desc).then(function () {
    console.log("Setting up the local media stream...");
    return navigator.mediaDevices.getUserMedia(mediaConstraints);
  })
  .then(function(stream) {
    console.log("-- Local video stream obtained");
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(localStream);
    localVideo.srcObject = localStream;

    if (hasAddTrack) {
      console.log("-- Adding tracks to the RTCPeerConnection");
      localStream.getTracks().forEach(track =>
            PeerConnection.addTrack(track, localStream)
      );
    } else {
      console.log("-- Adding stream to the RTCPeerConnection");
      PeerConnection.addStream(localStream);
    }
  })
  .then(function() {
    console.log("------> Creating answer");
    // Now that we've successfully set the remote description, we need to
    // start our stream up locally then create an SDP answer. This SDP
    // data describes the local end of our call, including the codec
    // information, options agreed upon, and so forth.
    return PeerConnection.createAnswer();
  })
  .then(function(answer) {
    console.log("------> Setting local description after creating answer");
    // We now have our answer, so establish that as the local description.
    // This actually configures our end of the call to match the settings
    // specified in the SDP.
    return PeerConnection.setLocalDescription(answer);
  })
  .then(function() {
    // We've configured our end of the call now. Time to send our
    // answer back to the caller so they know that we want to talk
    // and how to talk to us.

    console.log("Sending answer packet back to other peer");

    socket.emit('answer', JSON.stringify(PeerConnection.localDescription));//PeerConnection.localDescription
  })
  .catch(handleGetUserMediaError);
}

// Responds to the "video-answer" message sent to the caller
// once the callee has decided to accept our request to talk.

function handleVideoAnswerMsg(msg) {
  console.log("Call recipient has accepted our call");

  // Configure the remote description, which is the SDP payload
  // in our "video-answer" message.

  var desc = new RTCSessionDescription(msg);
  PeerConnection.setRemoteDescription(desc).catch(reportError);
}

// A new ICE candidate has been received from the other peer. Call
// RTCPeerConnection.addIceCandidate() to send it along to the
// local ICE framework.

function handleNewICECandidateMsg(msg) {
  var candidate = new RTCIceCandidate(msg);

  console.log("Adding received ICE candidate: " + JSON.stringify(candidate));
  PeerConnection.addIceCandidate(candidate)
    .catch(reportError);
}

// Handle errors which occur when trying to access the local media
// hardware; that is, exceptions thrown by getUserMedia(). The two most
// likely scenarios are that the user has no camera and/or microphone
// or that they declined to share their equipment when prompted. If
// they simply opted not to share their media, that's not really an
// error, so we won't present a message in that situation.

function handleGetUserMediaError(e) {
  console.log(e);
  switch(e.name) {
    case "NotFoundError":
      console.log("Unable to open your call because no camera and/or microphone" +
            "were found.");
      break;
    case "SecurityError":
    case "PermissionDeniedError":
      // Do nothing; this is the same as the user canceling the call.
      break;
    default:
      console.log("Error opening your camera and/or microphone: " + e.message);
      break;
  }

  // Make sure we shut down our end of the RTCPeerConnection so we're
  // ready to try again.

  closeVideoCall();
}

// Handles reporting errors. Currently, we just dump stuff to console but
// in a real-world application, an appropriate (and user-friendly)
// error message should be displayed.

function reportError(errMessage) {
  log_error("Error " + errMessage.name + ": " + errMessage.message);
}




var socket = io.connect();
/*var el = document.getElementById('server-time');
socket.on('create_room', function(timeString) {
  el.innerHTML = 'Server time: ' + timeString;
});*/
socket.on('request.offer', function() {
  //offer create
  area_standby.style.display = '';
  area_talk.style.display = '';
  isOffer = true;
  invite();
});
socket.on('offer', function(data) {
  //receive offer
    var signal = JSON.parse(data);
    if (signal.sdp) {
      handleVideoOfferMsg(signal);
    }
    area_standby.style.display = '';
    area_talk.style.display = '';
});
socket.on('answer', function(data) {
  //receive offer
    var signal = JSON.parse(data);
    if (signal.sdp) {
      handleVideoAnswerMsg(signal);
    }
});
socket.on('candidate', function(data) {
  //receive offer
    if (data) {
      handleNewICECandidateMsg(data);
    }
});
var area_create = document.getElementById('create_room');
var area_standby = document.getElementById('standby');
var area_talk = document.getElementById('talk');
var btn = document.getElementById('btn_room_create');
var room_name = document.getElementById('room_name');

btn.addEventListener('click', function(e) {
  socket.emit('joinRoom', room_name.value, function (data) {
    area_standby.innerHTML = '<p> join room : ' + room_name.value + '</p>'
                            + (data == 'waiting' ? '<p>Waiting for other users</p>' : 'Waiting for offer');
    area_create.style.display = 'none';
    area_standby.style.display = '';
  });
}, false);


remoteVideo.addEventListener('play', function(e){
  console.log('----------------------');
  console.log(e);
  e.target.style.left = -((e.target.clientWidth - document.body.clientWidth)/2) + 'px';
}, false);
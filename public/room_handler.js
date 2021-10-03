const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

let myVideoStream;
const myVideo = document.createElement("video");
myVideo.setAttribute("class", "camera");
myVideo.muted = true;
const peers = {};

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, sessionStorage.getItem("username"));
  console.log("Peer connection established");

  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      myVideoStream = stream;
      addVideoStream(myVideo, stream);
      Grid();

      myPeer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        video.setAttribute("class", "camera");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
          Grid();
        });
        call.on("close", () => {
          video.remove();
          Grid();
        });
      });

      socket.on("user-connected", (userId, username) => {
        setTimeout(() => {
          connectToNewUser(userId, stream);
          $("ul").append(
            `<li><span class="messageHeader"><small> ${username} joined the meeting</small></span></li>`
          );
        }, 2000);
      });

      // input value
      let text = $("input");
      // press enter send message
      $("html").keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
          socket.emit("message", text.val());
          text.val("");
        }
      });

      socket.on("createMessage", (message, username) => {
        $("ul").append(`<li>
                  <span>
                    <span class="messageSender">${username}</span> 
                  </span><br>
                  <span class="message">${message}</span>
                  <span class="messageTime" style="color:gray"><small>
                  ${new Date().toLocaleString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                  </small></span>
                </li>`);
        scrollToBottom();
      });
    });
});

socket.on("user-disconnected", (userId, username) => {
  setTimeout(() => {
    $("ul").append(
      `<li><span class="messageHeader"><small>${username} left the meeting</small></span></li>`
    );
    if (peers[userId]) {
      peers[userId].close();
    } else {
      manualClose(userId);
    }
    Grid();
  }, 2000);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  video.setAttribute("class", "camera");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
    Grid();
  });
  call.on("close", () => {
    manualClose(userId);
    video.remove();
    Grid();
  });

  peers[userId] = call;
  console.log(peers[userId]);
}

function addVideoStream(video, stream, reflip = false) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  if (!reflip) {
    videoGrid.append(video);
  } else {
    // Option to flip video back if needed
    video.setAttribute("style", "transform: rotateY(360deg) !important;");
    videoGrid.append(video);
    Grid();
  }
}

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Disable Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Enable Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const security = () => {
  alert("Connection is end-to-end encrypted");
};

const share = () => {
  var text = `
  Join the meeting at ${window.location.href} :)
  `;
  navigator.clipboard.writeText(text);
  alert("Link Copied!");
};

const leaveMeeting = () => {
  const myWindow = window.open("/broadcast");
  window.location.href = myWindow;
  myWindow.close();
  window.location.replace("/");
};

function manualClose(userId) {
  // close the peer connections
  for (let conns in myPeer.connections) {
    myPeer.connections[conns].forEach((conn, index, array) => {
      if (conn.peer === userId) {
        console.log(
          `closing ${conn.connectionId} peerConnection (${index + 1}/${
            array.length
          })`,
          conn.peerConnection
        );
        conn.peerConnection.close();

        // close it using peerjs methods
        if (conn.close) {
          conn.close();
        }
      }
    });
  }
}

// Make sure things clean up properly.

window.onunload = window.onbeforeunload = function (e) {
  if (!!myPeer && !myPeer.destroyed) {
    myPeer.destroy();
  }
};

// Dynamic camera resizing

function Area(Increment, Count, Width, Height, Margin = 10) {
  let i = (w = 0);
  let h = Increment * 0.75 + Margin * 2;
  while (i < Count) {
    if (w + Increment > Width) {
      w = 0;
      h = h + Increment * 0.75 + Margin * 2;
    }
    w = w + Increment + Margin * 2;
    i++;
  }
  if (h > Height) return false;
  else return Increment;
}

function Grid() {
  // variables:
  let Margin = 10;
  let Scenery = document.getElementById("main__videos");
  let Width = Scenery.offsetWidth - Margin * 2;
  let Height = Scenery.offsetHeight - Margin * 2;
  let Cameras = document.getElementsByClassName("camera");
  let max = 0;

  // loop (i recommend you optimize this)
  let i = 1;
  while (i < 5000) {
    let w = Area(i, Cameras.length, Width, Height, Margin);
    if (w === false) {
      max = i - 1;
      break;
    }
    i++;
  }

  // set styles
  max = max - Margin * 2;
  setWidth(max, Margin);
}

// Set Width and Margin 
function setWidth(width, margin) {
  let Cameras = document.getElementsByClassName('camera');
  for (var s = 0; s < Cameras.length; s++) {
      Cameras[s].style.width = width + "px";
      Cameras[s].style.margin = margin + "px";
      Cameras[s].style.height = (width * 0.75) + "px";
  }
}

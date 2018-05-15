var socket;

namespace = '/scrum-poker'; // change to an empty string to use the global namespace
// the socket.io documentation recommends sending an explicit package upon
// connection this is specially important when using the global namespace var
// socket = io.connect('https://' + document.domain + ':' + location.port +
// namespace); Changing from the above line in the original example to the
// following allows the system to work locally with http, and on Heroku with
// both https and http:

if ("127.0.0.1".indexOf(document.domain) != -1 || "localhost".indexOf(document.domain) != -1) 
  socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
else 
  socket = io.connect(namespace);

socket
  .on('connect', function () {
    initial();
    socket.emit('my event', {data: 'I\'m connected!'});
  });

// event handler for server sent data the data is displayed in the "Received"
// section of the page
socket.on('my response', function (msg) {
  console.log("response", msg);
  $('#log').append('<br>Received #' + msg.count + ': ' + msg.data);
});

socket.on('my room', function (msg) {
  console.log("room", msg);
  if (!!msg) {
    let room = msg.room;
    if (!!room) {
      setRoom(room, getUser());
    }
  }
});

socket.on('my room', function (msg) {
  if (!!msg) {
    let room = msg.room;
    let user = msg.user;
    addUserToRoom(room, user);
    showUserInRoomOnPage(room);
  }
});

function joinRoom(room) {
  console.log(room);
  setActiveRoom(room);
  socket.emit('join', {
    room: room,
    user: getUser()
  });
}

// handlers for the different forms in the page these send data to the server in
// a variety of ways
$('form#emit')
  .submit(function (event) {
    socket.emit('my event', {
      data: $('#emit_data').val()
    });
    return false;
  });

$('form#broadcast').submit(function (event) {
  socket.emit('my broadcast event', {
    data: $('#broadcast_data').val()
  });
  return false;
});

$('form#join').submit(function (event) {
  socket.emit('join', {
    room: $('#join_room').val()
  });
  return false;
});

$('form#leave').submit(function (event) {
  socket.emit('leave', {
    room: $('#leave_room').val()
  });
  return false;
});

$('form#send_room').submit(function (event) {
  socket.emit('my room event', {
    room: $('#room_name').val(),
    data: $('#room_data').val()
  });
  return false;
});

$('form#close').submit(function (event) {
  socket.emit('close room', {
    room: $('#close_room').val()
  });
  return false;
});

$('form#disconnect').submit(function (event) {
  socket.emit('disconnect request');
  return false;
});

function initial() {
  checkLogin();
}

function showAllRoom() {
  let rooms = getRoom(); 
  $('#all_room').empty();
  if (rooms.length > 0) {
    for (let r = 0; r < rooms.length; r++) {
      let room = rooms[r].room;
      let btnRoom = '<button class="join-room" onclick="joinRoom(\'' + room + '\')">' + room + '</button>';
      $('#all_room').append(btnRoom);
    }
  }
}

function checkLogin() {
  if (!!getUser()) {
    $('#for_logedin').show();
    $('#not_login').hide();
    $('#label_connect').text(getUser() + ' connected!');
    showAllRoom();
    getUserActiveRoom();
  } else {
    $('#label_connect').text('I\'m connected!');
    $('#not_login').show();
    $('#for_logedin').hide();
  }
}

function getUserActiveRoom() {
  let roomActive = getActiveRoom();
  if (!!roomActive) {
    $('#room_active').show();
    $('#room_name').text(roomActive);
    showUserInRoomOnPage(roomActive);
  } else {
    $('#room_active').hide();
  }
}

function showUserInRoomOnPage(room) {
  let userInRoom = getUserInRoom(room);
  console.log("userInRoom",userInRoom);
  $('#user_in_room').empty();
  userInRoom.forEach(function (element) {
    console.log(element);
    $('#user_in_room').append('<div><a href="#">' + element.user + '</a></div>');
  }, this);
}

$('#btn_add_name').click(function () {
  let name = $('#your_name').val();
  if (!!name) {
    setUser(name);
    checkLogin();
    $('#your_name').val("");
  } else {
    alert("Please Enter Your Name");
  }
});

$('#btn_add_room').click(function () {
  let room = $('#room').val();
  if (!!room) {
    if (setRoom(room, getUser())) {
      $('#room').val("");
      // socket.emit('join', {room: room});
    } else {
      alert("Is existing.");
    }
  } else {
    alert("Please Enter Room Name");
  }
});

var USER_KEY = 'user';
var ROOM_KEY = 'room';
var ACTIVE_ROOM_KEY = 'active_room';

function getUser() {
    return localStorage.getItem(USER_KEY);
}

function setUser(username) {
    return localStorage.setItem(USER_KEY, username);
}

function setRoom(room, admin) {
    let rooms = getRoom();
    if(checkRoom(room)) {
        rooms.push({room: room, admin});
        localStorage.setItem(ROOM_KEY, JSON.stringify(rooms));
        return true;
    } else {
        return false;
    }
}

function getRoom() {
    let rooms = localStorage.getItem(ROOM_KEY);
    if(!!rooms) {
        rooms = JSON.parse(rooms);
        return rooms;
    } else {
        return [];
    }
}

function checkRoom(room) {
    let rooms = localStorage.getItem(ROOM_KEY);
    if(!!rooms) {
        rooms = JSON.parse(rooms);
        for(let r = 0; r < rooms.length; r++) {
            if(room == rooms[r].room) {
                return false;
            }
        }
    }
    return true;
}

function getActiveRoom() {
    let activeRoom = localStorage.getItem(ACTIVE_ROOM_KEY);
    return activeRoom;
}

function setActiveRoom(room) {
    localStorage.setItem(ACTIVE_ROOM_KEY, room);
}

function addUserToRoom(room, user) {
    let rooms = getUserInRoom(room);
    if(checkUserInRoom(room, user)) {
        rooms.push({room: room, user: user});
        localStorage.setItem(room, JSON.stringify(rooms));
    }
}

function getUserInRoom(room) {
    let rooms = localStorage.getItem(room);
    if(!!rooms) {
        rooms = JSON.parse(rooms);
        if(rooms.length > 0) return rooms;
    }
    return [];
}

function checkUserInRoom(room, user) {
    let rooms = localStorage.getItem(room);
    if(!!rooms) {
        rooms = JSON.parse(rooms);
        for(let r = 0; r < rooms.length; r++) {
            if(user == rooms[r].user) {
                return false;
            }
        }
    }
    return true;
}
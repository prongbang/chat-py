import os
from gevent import monkey
monkey.patch_all()

import time
from threading import Thread
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, disconnect
from flask_cors import CORS, cross_origin

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app)
thread = None


def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while True:
        time.sleep(10)
        count += 1
        socketio.emit('my response',
                      {'data': 'Server generated event', 'count': count},
                      namespace='/scrum-poker')

@app.route('/')
def index():
    global thread
    if thread is None:
        thread = Thread(target=background_thread)
        thread.start()
    return render_template('index.html')

@socketio.on('my event', namespace='/scrum-poker')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response', {'data': message['data'], 'count': session['receive_count']})


@socketio.on('my broadcast event', namespace='/scrum-poker')
def test_broadcast_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': message['data'], 'count': session['receive_count']},
         broadcast=True)


@socketio.on('join', namespace='/scrum-poker')
def join(message):
    join_room(message['room']) 
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my room', {'room': message['room'], 'user': message['user'], 'count': session['receive_count']}, broadcast=True)

@socketio.on('leave', namespace='/scrum-poker')
def leave(message):
    leave_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': 'In rooms: ' + ', '.join(request.namespace.rooms),
          'count': session['receive_count']})


@socketio.on('close room', namespace='/scrum-poker')
def close(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response', 
        {'data': 'Room ' + message['room'] + ' is closing.', 'count': session['receive_count']},
         room=message['room'])
    close_room(message['room'])


@socketio.on('my room event', namespace='/scrum-poker')
def send_room_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my room',
         {'data': message['data'], 'count': session['receive_count']},
         room=message['room'])


@socketio.on('disconnect request', namespace='/scrum-poker')
def disconnect_request():
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': 'Disconnected!', 'count': session['receive_count']})
    disconnect()


@socketio.on('connect', namespace='/scrum-poker')
def test_connect():
    print('Client connected')
    emit('my response', {'data': 'Connected', 'count': 0})


@socketio.on('disconnect', namespace='/scrum-poker')
def test_disconnect():
    print('Client disconnected')


if __name__ == "__main__":
    # Fetch the environment variable (so it works on Heroku):
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
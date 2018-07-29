const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('action', (arg) => {
  console.log('Listener called', arg);
});

emitter.emit('action', { data: 'something' });

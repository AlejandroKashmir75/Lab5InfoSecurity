var validation = require('./libs/unalib');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// root: presentar html
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){

  socket.on('Evento-Mensaje-Server', function(msg){
    try {
      // Validación inicial básica
      if (!msg || (typeof msg !== 'string' && typeof msg !== 'object')) {
        return;
      }

      
      var processed = validation.validateMessage(msg);
      
      
      if (!processed) return;

      
      if (processed.blocked) {
        
        socket.emit('Evento-Mensaje-Server', {
          nombre: 'Sistema',
          color: '#FF0000',
          mensaje: '[Tu mensaje fue bloqueado por contener contenido potencialmente malicioso]',
          tipo: 'text',
          timestamp: Date.now()
        });
        return;
      }

      
      processed.timestamp = Date.now();
      processed.from = socket.id;

      
      io.emit('Evento-Mensaje-Server', processed);
    } catch (e) {
      console.error('Error procesando mensaje:', e.message);
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
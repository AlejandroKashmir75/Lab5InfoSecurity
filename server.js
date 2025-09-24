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

      // procesamos el mensaje con la librería
      var processed = validation.validateMessage(msg);
      
      // Si no hay resultado válido, ignorar
      if (!processed) return;

      // Si el mensaje fue bloqueado por contener script u otro contenido malicioso
      if (processed.blocked) {
        // Solo notificar al remitente, sin broadcast
        socket.emit('Evento-Mensaje-Server', {
          nombre: 'Sistema',
          color: '#FF0000',
          mensaje: '[Tu mensaje fue bloqueado por contener contenido potencialmente malicioso]',
          tipo: 'text',
          timestamp: Date.now()
        });
        return;
      }

      // metadata mínima
      processed.timestamp = Date.now();
      processed.from = socket.id;

      // Solo si no está bloqueado, emitir a todos
      io.emit('Evento-Mensaje-Server', processed);
    } catch (e) {
      console.error('Error procesando mensaje:', e.message);
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
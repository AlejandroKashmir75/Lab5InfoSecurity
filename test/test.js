var val = require('../libs/unalib');
var assert = require('assert');


describe('unalib', function(){


  describe('funcion is_valid_phone', function(){

    it('deberia devolver true para 8297-8547', function(){

      assert.equal(val.is_valid_phone('8297-8547'), true);

    });

    it('deberia devolver false para 8297p-8547', function(){

      assert.equal(val.is_valid_phone('8297p-8547'), false);

    });

  });


  describe('funcion is_valid_url_image', function(){

    it('deberia devolver true para http://image.com/image.jpg', function(){

      assert.equal(val.is_valid_url_image('http://image.com/image.jpg'), true);

    });

    it('deberia devolver true para http://image.com/image.gif', function(){

      assert.equal(val.is_valid_url_image('http://image.com/image.gif'), true);

    });
    
  });

  describe('funcion is_valid_yt_video', function(){

    it('deberia devolver true para http://image.com/image.jpg', function(){

      assert.equal(val.is_valid_yt_video('https://www.youtube.com/watch?v=qYwlqx-JLok'), true);

    });

  });

describe('Nuevas pruebas - imágenes, videos y seguridad', function(){

  it('valida y reconoce una URL de imagen directa (debe ser tipo image)', function(){
    var res = val.validateMessage({ mensaje: 'https://placekitten.com/200/300' });
    // debe marcar tipo image y mantener la URL como mensaje
    assert.equal(res.tipo, 'image');
    assert.equal(res.mensaje, 'https://placekitten.com/200/300');
  });

  it('valida una URL de imagen con parámetros y la reconoce como imagen', function(){
    var res = val.validateMessage({ mensaje: 'https://example.com/photo.jpg?size=large&ref=1' });
    assert.equal(res.tipo, 'image');
    assert.equal(res.mensaje, 'https://example.com/photo.jpg?size=large&ref=1');
  });

  it('acepta un enlace de YouTube (watch?v=) y devuelve URL de embed para el reproductor', function(){
    var res = val.validateMessage({ mensaje: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    assert.equal(res.tipo, 'video');
    // debe contener la ruta embed
    assert.ok(typeof res.mensaje === 'string' && res.mensaje.indexOf('youtube.com/embed/') !== -1);
  });

  it('acepta un enlace corto de YouTube (youtu.be) y genera la URL embed', function(){
    var res = val.validateMessage({ mensaje: 'https://youtu.be/dQw4w9WgXcQ' });
    assert.equal(res.tipo, 'video');
    assert.ok(res.mensaje.indexOf('youtube.com/embed/') !== -1);
  });

  it('detecta y bloquea una inyección de script explícita', function(){
    var res = val.validateMessage({ mensaje: '<script>alert(\"xss\")</script>' });
    // la implementación devuelve un aviso seguro en lugar del payload original
    assert.equal(res.tipo, 'text');
    assert.equal(res.mensaje, '[Mensaje bloqueado: contenido potencialmente malicioso]');
  });

  it('escapa etiquetas HTML normales en texto para evitar ejecución', function(){
    var res = val.validateMessage({ mensaje: '<b>negrita</b>' });
    assert.equal(res.tipo, 'text');
    assert.equal(res.mensaje, '&lt;b&gt;negrita&lt;/b&gt;');
  });

});


});








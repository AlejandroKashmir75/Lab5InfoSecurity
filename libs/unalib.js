// libs/unalib.js
'use strict';

var VALID_IMAGE_REGEX = /^https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|bmp)(?:[?#].*)?$/i;
var YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{11})/i;
var PHONE_REGEX = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/i;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

// Reemplaza entidades HTML comunes (&amp; => &)
function decodeHtmlEntities(s) {
  if (!s || typeof s !== 'string') return s;
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// Extrae la primera URL válida de un texto, intentando decodificar parámetros comunes
function extractPossibleUrl(text) {
  if (!text || typeof text !== 'string') return null;

  // Primero decodificar entidades HTML (&amp;)
  var t = decodeHtmlEntities(text);

  // Buscar parámetros url= o imgurl= o q= que contengan una URL (típico de Google)
  var paramMatch = t.match(/(?:[?&](?:imgurl|url|q)=)([^&\s]+)/i);
  if (paramMatch && paramMatch[1]) {
    try {
      var decoded = decodeURIComponent(paramMatch[1]);
      
      decoded = decoded.replace(/^["']|["']$/g, '');
      return decoded;
    } catch (e) {
    
      return paramMatch[1].replace(/&amp;/g, '&');
    }
  }

  var urlMatch = t.match(/https?:\/\/[^\s'"]+/i);
  if (urlMatch) {
    
    var candidate = urlMatch[0].replace(/&amp;$/i, '');
    
    try {
      candidate = decodeURIComponent(candidate);
    } catch (e) {
      
    }
    return candidate;
  }

  return null;
}

function isLikelyImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
   
    if (VALID_IMAGE_REGEX.test(url)) return true;

    var u = new URL(url);

    var host = (u.hostname || '').toLowerCase();
    
    if (/placekitten\.com|picsum\.photos|images\.unsplash\.com|picsum\.photo/i.test(host)) {
      return true;
    }

   
    if (/\/\d+\/\d+(?:$|[?#])/.test(u.pathname)) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

module.exports = {

  is_valid_phone: function (phone) {
    try {
      if (phone == null) return false;
      return PHONE_REGEX.test(String(phone));
    } catch (e) {
      console.error('is_valid_phone error:', e);
      return false;
    }
  },

  is_valid_url_image: function (url) {
    try {
      if (!url) return false;
      return VALID_IMAGE_REGEX.test(String(url).trim());
    } catch (e) {
      console.error('is_valid_url_image error:', e);
      return false;
    }
  },

  is_valid_yt_video: function (url) {
    try {
      if (!url) return false;
      return YT_REGEX.test(String(url).trim());
    } catch (e) {
      console.error('is_valid_yt_video error:', e);
      return false;
    }
  },

  getYTVideoId: function (url) {
    try {
      var m = String(url).match(YT_REGEX);
      return (m && m[1]) ? m[1] : null;
    } catch (e) {
      console.error('getYTVideoId error:', e);
      return null;
    }
  },

  getEmbeddedCode: function (url) {
    var id = this.getYTVideoId(url);
    if (!id) return null;
    return 'https://www.youtube.com/embed/' + id;
  },

  getImageTag: function (url) {
    return String(url);
  },

  validateMessage: function (raw) {
    try {
      var obj;

      if (typeof raw === 'string') {
        try {
          obj = JSON.parse(raw);
        } catch (e) {
          obj = { mensaje: raw };
        }
      } else if (typeof raw === 'object' && raw !== null) {
        obj = JSON.parse(JSON.stringify(raw));
      } else {
        return { nombre: '', color: '', mensaje: '', tipo: 'text', original: raw };
      }

      obj.nombre = obj.nombre ? String(obj.nombre) : '';
      obj.color = obj.color ? String(obj.color) : '';
      obj.mensaje = obj.mensaje == null ? '' : String(obj.mensaje).trim();

      // Limitar tamaño del mensaje a 5000 chars
      if (obj.mensaje.length > 5000) obj.mensaje = obj.mensaje.slice(0, 5000);

      
      var scriptRegex = /<[^>]*?(?:script|on\w+\s*=|javascript:)/i;
      if (scriptRegex.test(obj.mensaje) || /javascript:/i.test(decodeURIComponent(obj.mensaje))) {
        var warning = '[Mensaje bloqueado: contenido potencialmente malicioso]';
        return {
          nombre: 'Sistema',
          color: '#FF0000',
          mensaje: warning,
          tipo: 'text',
          original: '',
          blocked: true
        };
      }

      var possible = extractPossibleUrl(obj.mensaje);
      if (possible) {
        obj.mensaje = possible;
      }

      if (this.is_valid_url_image(obj.mensaje) || isLikelyImageUrl(obj.mensaje)) {
        return { nombre: obj.nombre, color: obj.color, mensaje: this.getImageTag(obj.mensaje), tipo: 'image', original: obj.mensaje };
      }

      if (this.is_valid_yt_video(obj.mensaje)) {
        var embed = this.getEmbeddedCode(obj.mensaje);
        return { nombre: obj.nombre, color: obj.color, mensaje: embed, tipo: (embed ? 'video' : 'text'), original: obj.mensaje };
      }

      return { nombre: obj.nombre, color: obj.color, mensaje: escapeHtml(obj.mensaje), tipo: 'text', original: obj.mensaje };

    } catch (e) {
      console.error('validateMessage error:', e);
      return { nombre: '', color: '', mensaje: escapeHtml(String(raw || '')), tipo: 'text', original: raw };
    }
  }

};

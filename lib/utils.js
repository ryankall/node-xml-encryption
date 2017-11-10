var builder = require('xmlbuilder'),
    path = require('path'),
    fs = require('fs');

var templates = {
  'encrypted-key': fs.readFileSync(path.join(__dirname, 'templates', 'encrypted-key.tpl.xml'), 'utf8'),
  'keyinfo': fs.readFileSync(path.join(__dirname, 'templates', 'keyinfo.tpl.xml'), 'utf8')
};

function renderTemplate (file, data){
var feed = null;

  if (file === 'keyinfo') {
      var feedObj = {
          'KeyInfo': {
              '@xmlns': 'http://www.w3.org/2000/09/xmldsig#',
              '@Type': 'http://www.w3.org/2001/04/xmlenc#Element',
              'e:EncryptedKey': {'@xmlns:e': "http://www.w3.org/2001/04/xmlenc#",
                  'e:EncryptionMethod': { '@Algorithm': data.keyEncryptionMethod.toString(),
                      'DigestMethod': {'@Algorithm': "http://www.w3.org/2000/09/xmldsig#sha1"}
                  },
                  'KeyInfo':  data.encryptionPublicCert,
                  'e:CipherData': {
                      'e:CipherValue': data.encryptedKey.toString() },
              },
          }
      };
      feed = builder.create(feedObj);
      console.log(feed.end({ pretty: true }));
  } else if (file === 'encrypted-key') {
      var feedObj = {
          'xenc:EncryptedData': {
              '@xmlns:xenc': 'http://www.w3.org/2001/04/xmlenc#',
              '@Type': 'http://www.w3.org/2001/04/xmlenc#Element',

              'xenc:EncryptionMethod': { '@Algorithm': data.keyEncryptionMethod.toString() },
              'ds:keyinfo': data.keyinfo.toString(),
              'xenc:CipherData': {
                  "xenc:CipherValue": data.encryptedContent
              }
          }
      };
       feed = builder.create(feedObj);
      console.log(feed.end({ pretty: true }));
  }

  return null;
}

function pemToCert(pem) {
  var cert = /-----BEGIN CERTIFICATE-----([^-]*)-----END CERTIFICATE-----/g.exec(pem);
  if (cert.length > 0) {
    return cert[1].replace(/[\n|\r\n]/g, '');
  }

  return null;
};


module.exports = {
  renderTemplate: renderTemplate,
  pemToCert: pemToCert
};

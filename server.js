const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server,perMessageDeflate: {
  zlibDeflateOptions: {
    level: 5, // Configuração leve para maior velocidade 
    }}});

let viewers = []; // Lista de visualizadores conectados
let transmitter = null; // Transmissor conectado

// Função para obter o IP local
const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Configura o CORS para todas as rotas HTTP
app.use(cors());

// Rota estática para os arquivos HTML
app.use(express.static(__dirname + '/public'));

// Rota para retornar o IP local
app.get('/local-ip', (req, res) => {
  const localIP = getLocalIPAddress();
  console.log(`IP local solicitado: ${localIP}`);
  res.json({ ip: localIP });
});

// WebSocket para conexão
wss.on('connection', (ws, req) => {
  const url = req.url;

  if (url === '/transmitter') {
    console.log('Transmissor conectado.');
    transmitter = ws;

    ws.on('message', (data) => {
      // Repasse os dados para os visualizadores
      viewers.forEach((viewer) => {
        if (viewer.readyState === WebSocket.OPEN) {
          viewer.send(data);
        }
      });
    });

    ws.on('close', () => {
      console.log('Transmissor desconectado.');
      transmitter = null;
    });
  } else if (url === '/viewer') {
    console.log('Visualizador conectado.');
    viewers.push(ws);

    ws.on('close', () => {
      console.log('Visualizador desconectado.');
      viewers = viewers.filter((viewer) => viewer !== ws);
    });
  }
});

// Inicia o servidor HTTP e WebSocket
server.listen(3000, () => {
  console.log(`Servidor rodando em http://${getLocalIPAddress()}:3000`);
  console.log(`Para vizualizar essa trasnmisão voce deve se conectar no Link: http://${getLocalIPAddress()}:3000/viewer.html`);
});

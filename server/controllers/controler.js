let viewers = []; // Lista de visualizadores conectados
let transmitter = null; // Transmissor conectado

const { getLocalIPAddress } = require('../utils/utils.js');
const { cors, express, WebSocket } = require('../config/serverConfig.js');

// Função para lidar com as conexões WebSocket
const handleWebSocketConnection = (ws, req, wss) => {
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
};

// Função para configurar as rotas HTTP
const configureRoutes = (app) => {
  app.use(cors());
  app.use(express.static(__dirname + '/public'));

  // Rota para retornar o IP local
  app.get('/local-ip', (req, res) => {
    const localIP = getLocalIPAddress();
    console.log(`IP local solicitado: ${localIP}`);
    res.json({ ip: localIP });
  });
};

module.exports = { handleWebSocketConnection, configureRoutes };

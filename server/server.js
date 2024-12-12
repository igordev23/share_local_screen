const { app, server, wss, express } = require('./config/serverConfig.js');
const { handleWebSocketConnection, configureRoutes } = require('./controllers/controler.js');
const { getLocalIPAddress } = require('./utils/utils.js');
const path = require('path'); // Importação do módulo path
// Configura as rotas HTTP
configureRoutes(app);
// Configura o CORS para todas as rotas HTTP
// Redireciona para o arquivo HTML principal
// Rota estática para os arquivos HTML



// Serve arquivos estáticos da pasta 'frontend/public' na raiz do projeto
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Redireciona para o arquivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'html', 'viewer.html'));
});


// WebSocket para conexão
wss.on('connection', (ws, req) => {
  handleWebSocketConnection(ws, req, wss);
});

// Inicia o servidor HTTP e WebSocket
server.listen(3000, () => {
  console.log(`Servidor rodando em http://${getLocalIPAddress()}:3000`);
  console.log(`Para visualizar essa transmissão você deve se conectar no Link: http://${getLocalIPAddress()}:3000/viewer.html`);
});

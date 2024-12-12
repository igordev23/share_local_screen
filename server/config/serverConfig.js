const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

// Criação do servidor Express e WebSocket
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 5, // Configuração leve para maior velocidade
    },
  },
});



module.exports = { app, server, wss, cors ,express, WebSocket};

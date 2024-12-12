import { startVideoStream } from '../src/videoconfig.js';
import { initWebSocket } from '../src/websocket.js';

const startButton = document.getElementById('start');
const preview = document.getElementById('preview');
const ipDisplay = document.getElementById('ip-display'); // Elemento onde o IP será mostrado

let serverIP = ''; // Variável para armazenar o IP retornado pelo servidor

// Função para obter o IP do servidor
const fetchServerIP = async () => {
  try {
    const response = await fetch('http://localhost:3000/local-ip');
    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    serverIP = data.ip;
    ipDisplay.textContent = `Transmissão disponível em: http://${serverIP}:3000`;
    console.log(`IP do servidor obtido: ${serverIP}`);
  } catch (error) {
    console.error('Erro ao obter o IP do servidor:', error);
    ipDisplay.textContent = 'Erro ao obter IP do servidor';
  }
};

// Inicializa o fluxo
fetchServerIP().then(() => {
  if (serverIP) {
    initWebSocket(serverIP, preview, startButton, startVideoStream); // Passa os parâmetros necessários
  }
});

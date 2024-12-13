const { app, BrowserWindow, ipcMain } = require('electron');
const { findBrowserAndOpenURL } = require('./browserUtils.js');
const path = require('path'); // Para manipular caminhos de arquivos
const { exec } = require('child_process');
const net = require('net'); // Para verificar se a porta está em uso

let server; // Variável para armazenar o servidor
let modalWindow; // Janela modal
let mainWindow;

// Inicializa o servidor e mantém a referência
const startServer = () => {
  server = require('../server/server.js');
  console.log('Servidor iniciado.');
};

// Encerra o servidor de forma limpa
const stopServer = () => {
  if (server && server.close) {
    server.close(() => {
      console.log('Servidor encerrado.');
      process.exit(0); // Simula o Ctrl+C encerrando o processo
    });
  } else {
    process.exit(0); // Garante encerramento mesmo se `server.close` não existir
  }
};

// Cria o modal com o botão "Encerrar Aplicativo"
const createModal = () => {
  modalWindow = new BrowserWindow({
    width: 300,
    height: 150,
    resizable: false,
    frame: false, // Remove a moldura da janela
    alwaysOnTop: true, // Mantém a janela sempre no topo
    webPreferences: {
      nodeIntegration: true, // Necessário para usar IPC
      contextIsolation: false,
    },
  });

  // Carrega o modal.html com caminho absoluto
  modalWindow.loadFile(path.join(__dirname, '..', 'frontend', 'public', 'html', 'modal.html'));
};

// Função para verificar se a porta está em uso
const isPortInUse = (port, callback) => {
  const server = net.createServer()
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        callback(true);
      } else {
        callback(false);
      }
    })
    .once('listening', () => {
      server.close(() => callback(false));
    })
    .listen(port);
};

// Cria a janela e abre o navegador
const createWindow = () => {
  // URL local para o arquivo transmitter.html servido pelo servidor
  const fileUrl = `http://localhost:3000/transmitter`;
  console.log(`Abrindo o arquivo HTML via servidor local: ${fileUrl}`);

  // Abre o navegador configurado com a URL do servidor local
  findBrowserAndOpenURL(fileUrl);

  // Cria o modal (se necessário)
  createModal();
};


// Evento disparado quando o Electron está pronto
app.whenReady().then(() => {
  startServer(); // Inicia o servidor
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Evento disparado ao fechar todas as janelas
app.on('window-all-closed', () => {
  stopServer();
});

// Intercepta SIGINT (Ctrl+C) para encerrar o servidor
process.on('SIGINT', () => {
  console.log('Encerrando o servidor devido a Ctrl+C...');
  stopServer();
});

// Manipuladores para minimizar e fechar
ipcMain.on('app:minimize', () => {
  if (modalWindow) {
    modalWindow.minimize(); // Minimiza o modal
  }
});

// Intercepta o evento do botão "Encerrar Aplicativo"
ipcMain.on('app:quit', () => {
  stopServer(); // Encerra o servidor e o aplicativo
});

// Evento para encerramento explícito do processo
app.on('before-quit', () => {
  stopServer();
});
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const net = require('net');

let server;
let configWindow = null;

// Inicializa o servidor
const startServer = () => {
  server = require('../server/server.js');
  console.log('Servidor iniciado.');
};

// Encerra o servidor
const stopServer = () => {
  if (server && server.close) {
    server.close(() => {
      console.log('Servidor encerrado.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Cria a janela e carrega config.html
const createConfigWindow = () => {
  configWindow = new BrowserWindow({
    width: 350,
    height: 300,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  configWindow.setMenuBarVisibility(false);

  const configPath = path.join(__dirname, 'config.html');
  configWindow.loadFile(configPath);

  // Quando a janela terminar de carregar, abre o navegador
  configWindow.webContents.on('did-finish-load', () => {
    openLocalURL();
  });

  configWindow.on('closed', () => {
    configWindow = null;
    stopServer();
  });
};

// Verifica se a porta está em uso
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

// Abre a URL local no navegador padrão
const openLocalURL = () => {
  const fileUrl = `http://localhost:3000/transmitter`;
  console.log(`Abrindo o arquivo HTML via servidor local: ${fileUrl}`);
  shell.openExternal(fileUrl);
};

// Evento principal
app.whenReady().then(() => {
  startServer();
  createConfigWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createConfigWindow();
  });
});

// Fecha todas as janelas
app.on('window-all-closed', () => {
  stopServer();
});

// Ctrl+C no terminal
process.on('SIGINT', () => {
  console.log('Encerrando o servidor devido a Ctrl+C...');
  stopServer();
});

// IPC para minimizar ou sair
ipcMain.on('app:minimize', () => {
  if (configWindow) {
    configWindow.minimize();
  }
});

ipcMain.on('app:quit', () => {
  stopServer();
});

app.on('before-quit', () => {
  stopServer();
});

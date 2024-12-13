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

// Função para iniciar o Live Server e obter a porta usada
const startLiveServer = (callback) => {
  console.log('Iniciando o Live Server...');
  let liveServerPort = 5500; // Porta padrão
   // Caminho para o binário do live-server dentro do node_modules
   const liveServerCommand = path.join(__dirname, '..', 'node_modules', '.bin', 'live-server');

  const liveServerProcess = exec(
    `${liveServerCommand} ./frontend/public --port=${liveServerPort} --open=html/transmitter.html`,
    (err, stdout, stderr) => {
      if (err) {
        console.error('Erro ao iniciar o Live Server:', err);
        return;
      }
    console.log('Live Server iniciado.');
    console.log(stdout);
  });

  liveServerProcess.stdout.on('data', (data) => {
    console.log(data.toString());
    // Detecta a porta se o Live Server escolher uma porta diferente
    const portMatch = data.toString().match(/Serving \"[^\"]*\" at http:\/\/127\.0\.0\.1:(\\d+)/);
    if (portMatch) {
      liveServerPort = portMatch[1];
      console.log(`Live Server está usando a porta ${liveServerPort}`);
    }
  });

  liveServerProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  // Espera um pequeno atraso para garantir que o servidor está iniciado
  setTimeout(() => callback(liveServerPort), 2000);
};

// Função para aguardar o Live Server estar ativo
const waitForServer = (port, callback, attempts = 10) => {
  const interval = 500; // Intervalo entre tentativas (ms)
  let tries = 0;

  const check = () => {
    if (tries >= attempts) {
      console.error(`Live Server não respondeu após ${attempts} tentativas.`);
      return;
    }

    tries += 1;
    console.log(`Tentativa ${tries}: verificando se o servidor está ativo na porta ${port}...`);

    isPortInUse(port, (inUse) => {
      if (inUse) {
        console.log(`Servidor ativo na porta ${port}.`);
        callback();
      } else {
        setTimeout(check, interval);
      }
    });
  };

  check();
};

// Cria a janela e abre o navegador
const createWindow = () => {
  const defaultPort = 5500;

  // Verifica se a porta do Live Server está em uso
  isPortInUse(defaultPort, (inUse) => {
    if (!inUse) {
      console.log(`Live Server não está em execução. Iniciando...`);
      startLiveServer((liveServerPort) => {
        createModal(); // Abre o modal após iniciar o navegador
         waitForServer(liveServerPort, () => {
          
        const url = `http://127.0.0.1:${liveServerPort}/frontend/public/html/transmitter.html`;
        findBrowserAndOpenURL(url); // Abre o navegador com a porta detectada
        createModal(); // Abre o modal após iniciar o navegador
      });
    });
    } else {
      const url = `http://127.0.0.1:${defaultPort}/frontend/public/html/transmitter.html`;
      console.log(`Live Server já está em execução na porta ${defaultPort}.`);
      findBrowserAndOpenURL(url); // Abre o navegador diretamente
      createModal(); // Abre o modal após iniciar o navegador
    }
  });
}

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
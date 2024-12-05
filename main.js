const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');
require('./server.js'); // Garante que o servidor inicie

const createWindow = () => {
  const url = 'http://localhost:3000/transmitter.html'; // URL do servidor

  // Função para buscar navegadores instalados
  const findBrowser = (callback) => {
    // Caminhos de navegadores para diferentes sistemas
    const browsers = {
      win32: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
        'C:\\Program Files\\Microsoft Edge\\Application\\msedge.exe'
      ],
      linux: [
        '/usr/bin/google-chrome',
        '/usr/bin/firefox',
        '/usr/bin/brave-browser'
      ],
      darwin: [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Firefox.app/Contents/MacOS/firefox',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
      ]
    };

    const platform = process.platform; // Verifica o sistema operacional
    const platformBrowsers = browsers[platform] || []; // Lista de navegadores para o SO atual

    // Itera sobre os navegadores possíveis e verifica se o executável existe
    for (const browser of platformBrowsers) {
      exec(`command -v "${browser}"`, (err) => {
        if (!err) {
          callback(browser);
          return;
        }
      });
    }

    // Caso não encontre nenhum, use o navegador padrão do sistema
    callback('default');
  };

  // Encontra o navegador e abre a URL
  findBrowser((browserPath) => {
    if (browserPath === 'default') {
      // Abre com o navegador padrão do sistema
      const command = process.platform === 'win32' ? `start ${url}`
                      : process.platform === 'darwin' ? `open ${url}`
                      : `xdg-open ${url}`;
      exec(command, (err) => {
        if (err) {
          console.error('Erro ao abrir o navegador padrão:', err);
          app.quit();
        }
      });
    } else {
      // Abre com o navegador encontrado
      exec(`"${browserPath}" --app=${url}`, (err) => {
        if (err) {
          console.error(`Erro ao abrir o navegador ${browserPath}:`, err);
          app.quit();
        }
      });
    }
  });
};

// Evento para iniciar o aplicativo
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Em sistemas macOS, recria a janela no app quando ativada
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Finaliza o app ao fechar todas as janelas
app.on('window-all-closed', () => {
  // Em sistemas não macOS, fecha o aplicativo ao fechar todas as janelas
  if (process.platform !== 'darwin') app.quit();
});

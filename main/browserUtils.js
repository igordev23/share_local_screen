const { exec } = require('child_process');
const { app } = require('electron');

const findBrowserAndOpenURL = (url) => {
  const findBrowser = (callback) => {
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

    const platform = process.platform;
    const platformBrowsers = browsers[platform] || [];
    
    const checkBrowser = (index) => {
      if (index >= platformBrowsers.length) {
        callback('default');
        return;
      }
      
      const browser = platformBrowsers[index];
      exec(`[ -x "${browser}" ] && echo "found"`, (err, stdout) => {
        if (!err && stdout.trim() === 'found') {
          callback(browser);
        } else {
          checkBrowser(index + 1);
        }
      });
    };
    
    checkBrowser(0);
  };

  findBrowser((browserPath) => {
    if (browserPath === 'default') {
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
      exec(`"${browserPath}" --app=${url}`, (err) => {
        if (err) {
          console.error(`Erro ao abrir o navegador ${browserPath}:`, err);
          app.quit();
        }
      });
    }
  });
};

module.exports = { findBrowserAndOpenURL };

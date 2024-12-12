const { ipcRenderer } = require('electron');

// Botão da barra superior para minimizar
document.getElementById('minimizeApp').addEventListener('click', () => {
  ipcRenderer.send('app:minimize'); // Evento para minimizar
});

// Botão da barra superior para fechar
document.getElementById('closeApp').addEventListener('click', () => {
  ipcRenderer.send('app:quit'); // Evento para encerrar
});

// Botão de confirmação para encerrar o aplicativo
document.getElementById('confirmCloseApp').addEventListener('click', () => {
  ipcRenderer.send('app:quit'); // Evento para encerrar
});

// Botão de cancelamento para permanecer no aplicativo
document.getElementById('cancelCloseApp').addEventListener('click', () => {
    ipcRenderer.send('app:minimize');
    console.log('Encerramento cancelado'); // Apenas um exemplo, pode ser substituído por outra lógica
});

// websocket.js

export const initWebSocket = (serverIP, preview, startButton, startVideoStream) => {
  const socket = new WebSocket(`ws://${serverIP}:3000/transmitter`);

  let isCursorOverPreview = false; // Flag para saber se o cursor está sobre o preview

  socket.onopen = () => {
    console.log("Conexão WebSocket estabelecida.");
  };

  socket.onerror = (err) => {
    console.error("Erro no WebSocket:", err);
  };

  socket.onclose = () => {
    console.log("Conexão WebSocket encerrada.");
  };

  // Detectar se o cursor está sobre o elemento preview
  preview.addEventListener('mouseenter', () => {
    isCursorOverPreview = true;
  });
  preview.addEventListener('mouseleave', () => {
    isCursorOverPreview = false;
  });

  startButton.addEventListener('click', async () => {
    
    startButton.textContent = 'Iniciar nova transmissão';
    // Chama a função que lida com a captura de tela e envio de frames
    const { sendFrames } = await startVideoStream(preview, socket);

    // Inicia o envio de frames, passando a flag isCursorOverPreview
    sendFrames(isCursorOverPreview);
  });
};

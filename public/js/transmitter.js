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
    ipDisplay.textContent = `Assista a trasnmisão no Link: http://${serverIP}:3000/viewer.html`;
    console.log(`IP do servidor obtido: ${serverIP}`);
  } catch (error) {
    console.error('Erro ao obter o IP do servidor:', error);
    ipDisplay.textContent = 'Erro ao obter IP do servidor';
  }
};

// Inicializa a conexão WebSocket com o servidor após obter o IP
const initWebSocket = () => {
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
    try {
      // Captura toda a tela do usuário
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 }, // Resolução 1080p
          height: { ideal: 1080 },
          frameRate: { ideal: 60, max: 60 } // FPS ajustado
        }
      });

      // Mostra a transmissão na visualização local
      preview.srcObject = stream;

      const videoTrack = stream.getVideoTracks()[0];

      // Criando um canvas para capturar quadros contínuos
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const videoElement = document.createElement('video');

      videoElement.srcObject = stream;
      videoElement.play();

      const sendFrames = async () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Desenha o vídeo no canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Converte o canvas em Blob e envia via WebSocket
        canvas.toBlob(
          (blob) => {
            if (blob) {
              blob.arrayBuffer()
                .then((buffer) => {
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(buffer);
                  }
                })
                .catch((err) => {
                  console.error("Erro ao converter Blob para ArrayBuffer:", err);
                });
            } else {
              console.error("Falha ao criar Blob.");
            }
          },
          "image/jpeg",
          0.9
        );

        // Ajusta o FPS com base na posição do cursor
        const frameInterval = isCursorOverPreview ? 16 : 100; // ~30 FPS com cursor, ~10 FPS sem cursor

        if (stream.active) {
          setTimeout(sendFrames, frameInterval);
        }
      };

      sendFrames();
    } catch (err) {
      console.error("Erro ao iniciar a transmissão:", err);
    }
  });
};

// Inicializa o fluxo
fetchServerIP().then(() => {
  if (serverIP) {
    initWebSocket(); // Inicia o WebSocket apenas após obter o IP
  }
});

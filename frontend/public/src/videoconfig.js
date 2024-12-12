// videoConfig.js

export const videoConfig = {
  video: {
    width: { ideal: 1920 },  // Resolução 1080p
    height: { ideal: 1080 },
    frameRate: { ideal: 60, max: 60 } // FPS ajustado
  }
};

export const frameRateWithCursor = 16;  // ~60 FPS com o cursor
export const frameRateWithoutCursor = 100;  // ~10 FPS sem o cursor

export const startVideoStream = async (preview, socket) => {
  let stream;
  try {
    // Captura toda a tela do usuário com a configuração de vídeo
    stream = await navigator.mediaDevices.getDisplayMedia(videoConfig);
  } catch (err) {
    console.error("Erro ao capturar a tela do usuário:", err);
    return;
  }

  try {
    // Mostra a transmissão na visualização local
    preview.srcObject = stream;
  } catch (err) {
    console.error("Erro ao configurar o preview da transmissão:", err);
    return;
  }

  let videoTrack, canvas, ctx, videoElement;
  try {
    videoTrack = stream.getVideoTracks()[0];

    // Criando um canvas para capturar quadros contínuos
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    videoElement = document.createElement("video");

    videoElement.srcObject = stream;
    await videoElement.play();
  } catch (err) {
    console.error("Erro ao configurar o canvas ou o elemento de vídeo:", err);
    return;
  }

  const sendFrames = async (isCursorOverPreview) => {
    try {
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
      const frameInterval = isCursorOverPreview ? frameRateWithCursor : frameRateWithoutCursor;

      if (stream.active) {
        setTimeout(() => sendFrames(isCursorOverPreview), frameInterval);
      }
    } catch (err) {
      console.error("Erro durante o envio de quadros:", err);
    }
  };

  return { sendFrames };
};

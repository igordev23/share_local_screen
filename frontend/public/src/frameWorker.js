self.onmessage = async (e) => {
    const { videoTrack, socket, frameInterval } = e.data;
    
    const videoStream = new MediaStream([videoTrack]);
    const videoElement = new OffscreenCanvas(1920, 1080); // Canvas Offscreen
    const ctx = videoElement.getContext("2d");
  
    const video = document.createElement("video");
    video.srcObject = videoStream;
    await video.play();
  
    const sendFrame = () => {
      videoElement.width = video.videoWidth;
      videoElement.height = video.videoHeight;
  
      ctx.drawImage(video, 0, 0, videoElement.width, videoElement.height);
  
      videoElement.convertToBlob({ type: "image/jpeg", quality: 0.7 }).then((blob) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(blob);
        }
      });
    };
  
    setInterval(sendFrame, frameInterval); // Envia quadros em intervalos constantes
  };
  
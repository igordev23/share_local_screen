const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const socket = new WebSocket(`ws://${window.location.hostname}:3000/viewer`);

socket.onmessage = async (event) => {
  const blob = new Blob([event.data], { type: "image/jpeg" });
  const imageBitmap = await createImageBitmap(blob);

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imageBitmap, 0, 0);
};


socket.onopen = () => {
  console.log("Conexão com o servidor estabelecida.");
};

socket.onerror = (err) => {
  console.error("Erro no WebSocket:", err);
};

socket.onclose = () => {
  console.log("Conexão com o servidor encerrada.");
};

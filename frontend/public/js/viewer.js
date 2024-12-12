const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const socket = new WebSocket(`ws://${window.location.hostname}:3000/viewer`);

// Obtendo o botão de tela cheia
const fullscreenButton = document.getElementById('fullscreenButton');

// Lógica do WebSocket
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

// Função para alternar tela cheia
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { // Firefox
      canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari e Opera
      canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
      canvas.msRequestFullscreen();
    }
    fullscreenButton.style.display = 'none'; // Esconde o botão quando entrar em tela cheia
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari e Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
    fullscreenButton.style.display = 'block'; // Exibe o botão quando sair de tela cheia
  }
};

// Adiciona o evento ao botão para alternar entre tela cheia e normal
fullscreenButton.addEventListener('click', toggleFullScreen);

// Evento para detectar quando o modo de tela cheia for fechado com a tecla ESC
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.fullscreenElement) {
    fullscreenButton.style.display = 'block'; // Exibe o botão ao pressionar ESC
  }
});

// Detecta quando o modo de tela cheia é ativado ou desativado para esconder/exibir o botão
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenButton.style.display = 'block'; // Exibe o botão ao sair do modo de tela cheia
  }
});

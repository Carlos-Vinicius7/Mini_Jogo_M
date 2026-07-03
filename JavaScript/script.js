const mario = document.querySelector('.mario:not(.mario-dead)');
const marioDead = document.getElementById('mario-dead');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelector('.nuvens');
const currentScoreDisplay = document.getElementById('current-score');
const highScoreDisplay = document.getElementById('high-score-display');
const gameOverScreen = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// Criar os objetos de áudio (certifique-se que estão na pasta ./Audio/)
const jumpSound = new Audio('./Audio/jump.wav');
const gameOverSound = new Audio('./Audio/game-over.mp3');
const bgMusic = new Audio('./Audio/music.mp3');

// Configurar música de fundo
bgMusic.loop = true;
bgMusic.volume = 0.5;

// Função para iniciar o áudio na primeira interação
const startAudio = () => {
    bgMusic.play().catch(e => console.log("Aguardando interação do usuário"));
    document.removeEventListener('keydown', startAudio);
    document.removeEventListener('click', startAudio);
};

document.addEventListener('keydown', startAudio);
document.addEventListener('click', startAudio);

// Variáveis de estado
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let loop;

highScoreDisplay.innerText = `Recorde: ${highScore}`;

const jump = () => {
    if (isGameOver) return;

    mario.classList.add('jump');
    jumpSound.currentTime = 0; // Reinicia o som caso ele já esteja tocando
    jumpSound.play();
    
    setTimeout(() => {
        mario.classList.remove('jump');
    }, 500);
}

const loopGame = () => {
    clearInterval(loop); // garante que nunca fique mais de um loop rodando ao mesmo tempo

    loop = setInterval(() => {
        if (isGameOver) { // trava extra: se o jogo já acabou, esse loop não faz mais nada
            clearInterval(loop);
            return;
        }

        const pipePosition = pipe.offsetLeft;
        const cloudsPosition = clouds.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

        // Pontuação
        score++;
        currentScoreDisplay.innerText = `Pontuação: ${Math.floor(score / 10)}`;

        // Detecção de colisão baseada na posição real dos elementos na tela,
        // então funciona igual em qualquer tamanho de .game-box (celular, tablet, desktop)
        const marioRect = mario.getBoundingClientRect();
        const pipeRect = pipe.getBoundingClientRect();
        // No celular o Mario e o cano ficam bem menores, então uma margem maior
        // é necessária pra não parecer injusto (senão quase todo "quase toque" conta como batida)
        const margem = window.matchMedia('(max-width: 480px), (max-height: 500px) and (orientation: landscape)').matches ? 22 : 10;

        const colidiu =
            marioRect.right - margem > pipeRect.left &&
            marioRect.left + margem < pipeRect.right &&
            marioRect.bottom - margem > pipeRect.top;

        if (colidiu) {
            isGameOver = true;

            // Parar animações
            pipe.style.animation = 'none';
            pipe.style.left = `${pipePosition}px`;

            clouds.style.animation = 'none';
            clouds.style.left = `${cloudsPosition}px`;

            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;

            mario.style.display = 'none';
            marioDead.style.bottom = `${marioPosition}px`;
            marioDead.classList.add('active');

            // Salvar recorde
            let finalScore = Math.floor(score / 10);
            if (finalScore > highScore) {
                highScore = finalScore;
                localStorage.setItem('dinoHighScore', highScore);
                highScoreDisplay.innerText = `Recorde: ${highScore}`;
            }

            // Gerenciamento de áudio pós-derrota
            bgMusic.pause();
            gameOverSound.currentTime = 0;
            gameOverSound.play();

            gameOverScreen.style.display = 'block';
            clearInterval(loop);
        }
    }, 10);
};

const restartGame = () => {
    gameOverScreen.style.display = 'none';

    // Cancela o som de game over (caso ainda esteja tocando) antes de tudo
    gameOverSound.pause();
    gameOverSound.currentTime = 0;

    // Resetar posições e animações
    pipe.style.animation = 'pipe-animation 1.5s linear infinite';
    pipe.style.left = '';
    clouds.style.animation = 'nuvens-animation 10s linear infinite';
    clouds.style.left = '';
    mario.style.animation = '';
    mario.style.bottom = '0';
    mario.style.display = '';
    marioDead.classList.remove('active');

    // Resetar variáveis
    score = 0;
    isGameOver = false;
    currentScoreDisplay.innerText = 'Pontuação: 0';

    // Reiniciar trilha sonora
    bgMusic.currentTime = 0;
    bgMusic.play();

    loopGame();
};

// Função auxiliar para controlar cliques duplos
let lastClickTime = 0;
const handleJumpClick = () => {
    const now = Date.now();
    // Evita pular duas vezes com um clique
    if (now - lastClickTime > 100) {
        lastClickTime = now;
        jump();
    }
};

// Eventos
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }
});

// Permite pular ao clicar na tela
document.addEventListener('click', (e) => {
    // Não pula se clicar no botão de restart (ele já tem seu próprio listener)
    if (e.target !== restartButton && !isGameOver) {
        handleJumpClick();
    }
});

// Permite reiniciar ao clicar em qualquer lugar da tela de game over
gameOverScreen.addEventListener('click', restartGame);
restartButton.addEventListener('click', (e) => {
    e.stopPropagation(); // evita que o clique "borbulhe" e dispare o restartGame da div também
    restartGame();
});

// Iniciar jogo pela primeira vez
loopGame();
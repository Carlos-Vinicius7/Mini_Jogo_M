const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelector('.nuvens');
const currentScoreDisplay = document.getElementById('current-score');
const highScoreDisplay = document.getElementById('high-score-display');
const gameOverScreen = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

// Variáveis de estado
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let loop; // Variável global para armazenar o intervalo

highScoreDisplay.innerText = `Recorde: ${highScore}`;

const jump = () => {
    if (isGameOver) return;

    mario.classList.add('jump');
    setTimeout(() => {
        mario.classList.remove('jump');
    }, 500);
}

const loopGame = () => {
    loop = setInterval(() => {
        const pipePosition = pipe.offsetLeft;
        const cloudsPosition = clouds.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

        // Pontuação
        score++;
        currentScoreDisplay.innerText = `Pontuação: ${Math.floor(score / 10)}`;

        // Detecção de colisão
        if (pipePosition <= 90 && pipePosition > 0 && marioPosition < 80) {
            isGameOver = true;

            // Parar animações
            pipe.style.animation = 'none';
            pipe.style.left = `${pipePosition}px`;

            clouds.style.animation = 'none';
            clouds.style.left = `${cloudsPosition}px`;

            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;

            mario.src = './Img/game-over.png';
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';

            // Salvar recorde
            let finalScore = Math.floor(score / 10);
            if (finalScore > highScore) {
                highScore = finalScore;
                localStorage.setItem('dinoHighScore', highScore);
                highScoreDisplay.innerText = `Recorde: ${highScore}`;
            }

            gameOverScreen.style.display = 'block';
            clearInterval(loop);
        }
    }, 10);
};

const restartGame = () => {
    gameOverScreen.style.display = 'none';

    // Resetar posições e animações
    pipe.style.animation = 'pipe-animation 1.5s linear infinite';
    pipe.style.left = '';

    clouds.style.animation = 'nuvens-animation 10s linear infinite';
    clouds.style.left = '';

    mario.style.animation = '';
    mario.style.bottom = '0';
    mario.src = './Img/mario.gif';
    mario.style.width = '150px';
    mario.style.marginLeft = '0';

    // Resetar variáveis
    score = 0;
    isGameOver = false;
    currentScoreDisplay.innerText = 'Pontuação: 0';

    loopGame();
};

// Eventos
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jump();
    }
});

restartButton.addEventListener('click', restartGame);

// Iniciar jogo pela primeira vez
loopGame();
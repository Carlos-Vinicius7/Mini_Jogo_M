const mario = document.querySelector('.mario');

const jump = () => {
    mario.classList.add('jump-animation');

    setTimeout(() => {
        mario.classList.remove('jump-animation');
    }, 500);
}

document.addEventListener('keydown', jump);
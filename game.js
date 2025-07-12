const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const tricks = {
    'A': { name: 'Jump', points: 100, color: '#fdcb6e' },
    'S': { name: 'Spin', points: 200, color: '#00b894' },
    'D': { name: 'Flip', points: 300, color: '#0984e3' },
    'F': { name: 'Combo', points: 500, color: '#e17055' }
};

let score = 0;
let trickQueue = [];
let trickAnim = null;
let gameActive = true;

// Animation state
let animating = false;
let animationFrame = 0;
let animationType = null;
let animationDuration = 40; // frames
let animationCallback = null;

function drawWindsurferAnim({ y = 0, rot = 0, flip = 1, text = null, color = '#000' } = {}) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw water
    ctx.fillStyle = '#74b9ff';
    ctx.fillRect(0, 320, 600, 80);
    // Draw board
    ctx.save();
    ctx.translate(300, 335 + y);
    ctx.rotate(rot);
    ctx.scale(1, flip);
    ctx.fillStyle = '#636e72';
    ctx.fillRect(-30, -5, 60, 10);
    // Draw sail
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(20, -80);
    ctx.lineTo(10, -5);
    ctx.closePath();
    ctx.fillStyle = '#fdcb6e';
    ctx.fill();
    // Draw windsurfer (stick figure)
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -15, 12, 0, Math.PI * 2); // Head
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 25); // Body
    ctx.moveTo(0, 12);
    ctx.lineTo(-15, 22); // Left leg
    ctx.moveTo(0, 12);
    ctx.lineTo(15, 22); // Right leg
    ctx.moveTo(0, 2);
    ctx.lineTo(-10, -8); // Left arm
    ctx.moveTo(0, 2);
    ctx.lineTo(10, -8); // Right arm
    ctx.stroke();
    ctx.restore();
    // Trick effect text
    if (text) {
        ctx.save();
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = color;
        ctx.fillText(text, 220, 70);
        ctx.restore();
    }
}

drawWindsurferAnim();

document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    const key = e.key.toUpperCase();
    if (tricks[key]) {
        performTrick(key);
    }
});

function performTrick(key) {
    score += tricks[key].points;
    scoreElem.textContent = score;
    trickQueue.push(key);
    if (!animating) animateTrick();
}

function animateTrick() {
    if (trickQueue.length === 0) {
        animating = false;
        drawWindsurferAnim();
        return;
    }
    const key = trickQueue.shift();
    animationType = key;
    animationFrame = 0;
    animating = true;
    requestAnimationFrame(animateFrame);
}

function animateFrame() {
    let progress = animationFrame / animationDuration;
    let y = 0, rot = 0, flip = 1, text = null, color = tricks[animationType].color;
    text = tricks[animationType].name + '!';
    switch (animationType) {
        case 'A': // Jump
            y = -60 * Math.sin(Math.PI * progress);
            break;
        case 'S': // Spin
            rot = 2 * Math.PI * progress;
            break;
        case 'D': // Flip
            flip = Math.cos(Math.PI * progress) > 0 ? 1 : -1;
            rot = Math.PI * progress;
            break;
        case 'F': // Combo (jump + spin + flip)
            y = -40 * Math.sin(Math.PI * progress);
            rot = 2 * Math.PI * progress;
            flip = Math.cos(2 * Math.PI * progress) > 0 ? 1 : -1;
            break;
    }
    drawWindsurferAnim({ y, rot, flip, text, color });
    animationFrame++;
    if (animationFrame < animationDuration) {
        requestAnimationFrame(animateFrame);
    } else {
        animating = false;
        setTimeout(() => {
            drawWindsurferAnim();
            animateTrick();
        }, 250);
    }
}

// End game after 60 seconds
setTimeout(() => {
    gameActive = false;
    ctx.save();
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#e17055';
    ctx.fillText('Time Up!', 220, 200);
    ctx.restore();
    restartBtn.style.display = 'inline-block';
}, 60000);

restartBtn.addEventListener('click', () => {
    score = 0;
    scoreElem.textContent = score;
    gameActive = true;
    restartBtn.style.display = 'none';
    drawWindsurfer();
    setTimeout(() => {
        gameActive = false;
        ctx.save();
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#e17055';
        ctx.fillText('Time Up!', 220, 200);
        ctx.restore();
        restartBtn.style.display = 'inline-block';
    }, 60000);
});

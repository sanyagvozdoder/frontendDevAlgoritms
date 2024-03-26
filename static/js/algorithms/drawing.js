const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
let isPainting = false;
function startPainting() {
    isPainting = true;
}
function stopPainting() {
    isPainting = false;
}
function draw(event) {
    if (!isPainting) return;
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    context.fillRect(x, y, 1, 1);
}
canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mousedown', draw);

const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")
const clear = document.getElementById('clear')

let isPaint = false
let prevX = null
let prevY = null


context.strokeStyle = "black"
context.lineWidth = 1
context.lineCap = 'round'

clear.addEventListener('click',(e)=>{
    context.clearRect(0,0,500,500)
})

canvas.addEventListener('mousedown',e =>{
    isPaint = true
})

window.addEventListener('mouseup',e=>{
    isPaint = false
})

canvas.addEventListener('mousemove',e=>{
    console.log("work")
    const offsetX = canvas.getBoundingClientRect().left;
    const offsetY = canvas.getBoundingClientRect().top;

    if(!isPaint || prevX == null || prevY == null){
        prevX = e.clientX
        prevY = e.clientY
        return;
    }

    context.beginPath()
    context.moveTo(prevX - canvas.offsetLeft,prevY - canvas.offsetTop)
    context.lineTo(e.clientX - canvas.offsetLeft,e.clientY - canvas.offsetTop)
    context.closePath()
    context.stroke()

    prevX = e.clientX
    prevY = e.clientY
})




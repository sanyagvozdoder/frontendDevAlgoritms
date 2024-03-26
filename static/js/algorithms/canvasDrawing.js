const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")
const clear = document.getElementById('clear')

let isPaint = false
let prevX = null
let prevY = null


context.strokeStyle = "black"
context.lineWidth = 10
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

    if(!isPaint || prevX == null || prevY == null){
        prevX = e.clientX
        prevY = e.clientY
        return;
    }

    let currentX = e.clientX
    let currentY = e.clientY

    context.beginPath()
    context.moveTo(prevX - canvas.offsetLeft,prevY - canvas.offsetTop)
    context.lineTo(currentX - canvas.offsetLeft,currentY - canvas.offsetTop)
    context.stroke()

    prevX = currentX
    prevY = currentY
})




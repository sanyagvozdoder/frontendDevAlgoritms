const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")
const clear = document.getElementById('clear')
const get = document.getElementById('get')

let isPaint = false
let prevX = null
let prevY = null


context.strokeStyle = "black"
context.lineWidth = 6
context.lineCap = 'round'
context.fillStyle = "white";
context.fillRect(0,0,50,50)

clear.addEventListener('click',(e)=>{
    context.fillRect(0,0,50,50)
})

get.addEventListener('click',e=>{
    const pic = context.getImageData(0,0,50,50)

    console.log(JSON.stringify(pic.data))

    $.ajax({
        url:"/data_from_canvas",
        type:"POST",
        dataType:"json",
        contentType:"application/json",
        data:JSON.stringify(pic.data),
        success:response=>{
            console.log("response")
        }
    })
    $.ajax({
        url:'/data_to_js',
        type:"GET",
        success:response=>{
            let labelOuput = document.getElementById('output')
            labelOuput.innerHTML = "Ваша цифра: " + response
        }
    })
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




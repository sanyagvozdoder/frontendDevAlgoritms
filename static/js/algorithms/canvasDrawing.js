const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")
const clear = document.getElementById('clear')
const get = document.getElementById('get')

let isPaint = false
let prevX = null
let prevY = null


context.strokeStyle = "black"
context.lineWidth = 15
context.lineCap = 'round'
context.fillStyle = "white"
context.fillRect(0,0,500,500)

clear.addEventListener('click',(e)=>{
    context.fillRect(0,0,500,500)

    let labelOuput = document.getElementById('output')
    labelOuput.innerHTML = ""
})

function postPic(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url:"/data_from_canvas",
            type:"POST",
            dataType:"json",
            contentType:"application/json",
            data:JSON.stringify(data),
            success: (response) => {
                resolve(response)
            },
            error: (response) => {
                reject(response)
            }
        })
    })
}

function getAns() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url:'/data_to_js',
            type:"GET",
            success: (response) => {
                let labelOutput = document.getElementById('output')
                labelOutput.innerHTML = "" + response
                resolve(response)
            },
            error: (response) => {
                reject(response)
            }
        })
    })
}


async function requestToServer(){
    const pic = context.getImageData(0,0,500,500)
    console.log(pic.data)

    await postPic(pic.data).then().catch(e=> console.log(e))
    
    await getAns().then().catch(e=> console.log(e))
}


get.addEventListener('click',requestToServer)

canvas.addEventListener('mousedown',e =>{
    isPaint = true
})

window.addEventListener('mouseup',e=>{
    isPaint = false
})

canvas.addEventListener('mousemove',e=>{

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




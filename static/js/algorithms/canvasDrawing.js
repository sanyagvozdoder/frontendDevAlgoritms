const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")
const clear = document.getElementById('clear')
const get = document.getElementById('get')

let isPaint = false
let isBrush = true
let prevX = null
let prevY = null

let labelbrush = document.getElementById("brushsizelabel")
let brushsize = document.getElementById("brushsize")
labelbrush.textContent = brushsize.value
context.lineWidth = labelbrush.textContent

brushsize.addEventListener("input", (event) => {
    labelbrush.textContent = event.target.value
    context.lineWidth = labelbrush.textContent
})


function switcher(){
    isBrush = !isBrush

    if(isBrush){
        btnSwitch.innerHTML = "Переключиться на ластик"
        context.strokeStyle = "black"
    }
    else{
        btnSwitch.innerHTML = "Переключиться на кисть"
        context.strokeStyle = "white"
    }
}

let btnSwitch = document.getElementById('switcher')
btnSwitch.addEventListener('click',switcher)

context.strokeStyle = "black"
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
                labelOutput.innerHTML = "" + response["digits"][0]

                let digit1 = document.getElementById("digit1")
                let percent1  =document.getElementById("percent1")

                digit1.innerHTML = response["digits"][0]
                percent1.innerHTML = response["percent"][0] + "%"

                let digit2 = document.getElementById("digit2")
                let percent2  =document.getElementById("percent2")

                digit2.innerHTML = response["digits"][1]
                percent2.innerHTML = response["percent"][1] + "%"

                let digit3 = document.getElementById("digit3")
                let percent3  =document.getElementById("percent3")

                digit3.innerHTML = response["digits"][2]
                percent3.innerHTML = response["percent"][2] + "%"

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

    document.querySelector('#controls').insertAdjacentHTML('beforeend','<div id="loading"><div class="load" id="load"></div></div>')
    
    document.getElementById('controls').style.opacity = "0.4"

    await postPic(pic.data).then().catch(e=> console.log(e))
    
    await getAns().then().catch(e=> console.log(e))

    document.getElementById('controls').style.opacity = "1"

    document.getElementById('load').parentNode.removeChild(document.getElementById('load'))
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




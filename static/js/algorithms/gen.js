const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")

let points = []
let isTerminate = false
let isStop = false

context.strokeStyle = "black"
context.lineWidth = 5
context.lineCap = 'round'
const vertexSize = 10

context.fillStyle = "white"
context.fillRect(0,0,1000,750)

let labelmut = document.getElementById("mutationlabel")
let mutrate = document.getElementById("mutationrate")
labelmut.textContent = mutrate.value

mutrate.addEventListener("input", (event) => {
    labelmut.textContent = event.target.value
})

let labelgen = document.getElementById("gensizelabel")
let gensize = document.getElementById("gensize")
labelgen.textContent = gensize.value

gensize.addEventListener("input", (event) => {
    labelgen.textContent = event.target.value
})

let labelstop = document.getElementById("stopsizelabel")
let stopsize = document.getElementById("stopsize")
labelstop.textContent = stopsize.value

stopsize.addEventListener("input", (event) => {
    labelstop.textContent = event.target.value
})

function distanceBetween(pointA, pointB)
{
    const dx = pointA.x - pointB.x
    const dy = pointA.y - pointB.y
    return Math.sqrt(dx * dx + dy * dy)
}

function draw(event)
{
    if(canvas.dataset.disable == "false"){
        const x = event.clientX - canvas.offsetLeft
        const y = event.clientY - canvas.offsetTop
        
        context.fillStyle = "black"
        context.beginPath()
        context.arc(x, y, 10, 0, Math.PI * 2);
        context.fill()

        context.strokeStyle = "rgba(0, 0, 0, 1)"

        points.forEach(point=>{
            context.beginPath()
            context.moveTo(point.x,point.y)
            context.lineTo(x,y)
            context.stroke()
        })

        points.push({ x, y })

        let vertState = document.getElementById("numVertexes")
        let edgesState = document.getElementById("numEdges")

        vertState.innerHTML = "Количество вершин: " + points.length
        edgesState.innerHTML = "Количество ребер: " + points.length*(points.length-1)/2
    }
}

canvas.addEventListener('click', draw);

function getRandomInt() {
    return Math.floor(Math.random() * points.length);
}

function fillingRand(){
    let path = []

    for(let i = 0;i<points.length;i++){
        let rand = getRandomInt()

        if($.inArray(rand, path) != -1){
            i--
            continue
        }
        else{
            path.push(rand)
        }
    }

    path.push(path[0])

    return path
}

function pickRandomProb(prob){
    let ind = Math.floor(Math.random(1) * prob.length)
    let rand = Math.random(1)
    let prevInd = 0

    while(rand>0){
        rand -= prob[ind]
        prevInd = ind
        ind = Math.floor(Math.random(1) * prob.length)
    }

    return prevInd
}

function drawPath(bestPath){
    for (let i = 0; i < bestPath.length - 1; i++) {
        context.beginPath()
        context.moveTo(points[bestPath[i]].x,points[bestPath[i]].y)
        context.lineTo(points[bestPath[i+1]].x,points[bestPath[i+1]].y)
        context.stroke()
    }
}

function mutate(path){
    if(Math.random(1) > 1 - parseInt(labelgen.textContent)){
        let index1 = Math.floor(Math.random() * (path.length - 2) + 1)

        let index2 = 0

        while(true){
            index2 = Math.floor(Math.random() * (path.length - 2) + 1) 

            if(index2 != index1){
                break
            }
        }

        let temp = path[index1]

        path[index1] = path[index2]
        path[index2] = temp
    }

    return path
}

class Individ{
    path
    distance
    fitness

    constructor(path){
        this.path = path

        this.distance = 0

        for(let i = 0; i < this.path.length-1; i++){
            this.distance += distanceBetween(points[this.path[i]],points[this.path[i+1]])
        }

        this.fitness = 1 / (Math.pow(this.distance,8) + 1)
    }

    makeChild(other) {
        let arr = []

        let start = Math.floor(Math.random(points.length) * this.path.length)

        if(start == 0){
            start++
        }

        for (let i = 0; i < start; i++) {
            arr.push(this.path[i])
        }

        arr[this.path.length-1] = arr[0]

        for (let j = start; j < arr.length - 1; j++) {
            if($.inArray(other.path[j], arr) != -1){
                for (let i = start; i < this.path.length; i++) {
                    if(!arr.includes(this.path[i])){
                      arr[j] = this.path[i]
                      break
                    }
                }
            }
            else{
                arr[j] = other.path[j]
            }
        }

        return arr
    }
}

class Generation{
    arrOfInds
    bestInd
    bestDist

    constructor(arr){
        this.arrOfInds = arr

        let sum = 0
        let bestFit = 0

        for(let i = 0; i < this.arrOfInds.length; i++){
            sum += this.arrOfInds[i].fitness
        }

        for(let i = 0; i < this.arrOfInds.length; i++){
            this.arrOfInds[i].fitness = this.arrOfInds[i].fitness / sum

            if(bestFit < this.arrOfInds[i].fitness){
                this.bestDist = this.arrOfInds[i].distance
                this.bestInd = this.arrOfInds[i].path
                bestFit = this.arrOfInds[i].fitness
            }
        }
    }
}

async function waitState() {

    return new Promise(resolve=>{
        let timer = setInterval(checkState, 10)
    
        function checkState() {
            if (isStop == false) {
                clearInterval(timer)
                resolve(!isStop)
            }
        }
    })
}

async function start(){
    canvas.dataset.disable = "true"

    let bestState = document.getElementById("stateBest")
    let algoState = document.getElementById("stateWorking")
    algoState.innerHTML = 'Состояние алгоритма:<br> работает'

    let arr = []

    for(let i = 0;i<parseInt(labelgen.textContent);i++){
        let ph = fillingRand()
        let ind = new Individ(ph)

        arr.push(ind)
    }

    let counterForEsc = 0

    let curGen = new Generation(arr)
    let bestIndivid = curGen.bestInd
    let bestIndDist = curGen.bestDist

    while(counterForEsc<parseInt(labelstop.textContent) && !isTerminate){
        context.strokeStyle = "rgba(175, 175, 175, 1)"

        for (let i = 0; i < points.length-1; i++) {
            for (let j = i+1; j < points.length; j++) {
                context.beginPath()
                context.moveTo(points[i].x,points[i].y)
                context.lineTo(points[j].x,points[j].y)
                context.stroke()
            }
        }

        context.strokeStyle = "rgba(0, 175, 255, 1)"

        drawPath(curGen.bestInd)

        for (let pnt = 0; pnt < points.length; pnt++) {
            context.fillStyle = "black"
            context.beginPath()
            context.arc(points[pnt].x, points[pnt].y, 10, 0, Math.PI * 2);
            context.fill()
        }

        await new Promise(r => setTimeout(r, 1))

        let arrInds = []

        for (let i = 0; i < curGen.arrOfInds.length; i++) {

            let pathA = curGen.arrOfInds[pickRandomProb(curGen.arrOfInds.map(ind=>{return ind.fitness}))]
            let pathB = curGen.arrOfInds[pickRandomProb(curGen.arrOfInds.map(ind=>{return ind.fitness}))]

            let child = pathA.makeChild(pathB)
            
            let mutatedChild = new Individ(mutate(child))
            arrInds.push(mutatedChild)
        }

        curGen = new Generation(arrInds)

        if(bestIndDist > curGen.bestDist){
            bestIndDist = curGen.bestDist
            bestIndivid = curGen.bestInd
            counterForEsc = 0
        }
        else{
            counterForEsc++
        }

        bestState.innerHTML = "Лучшая дистанция: " + Math.floor(bestIndDist)

        if(isStop){
            algoState.innerHTML = "Состояние алгоритма: <br>приостановлен"
            let state = await waitState()
            algoState.innerHTML = "Состояние алгоритма: <br>работает"
        }
    }

    context.strokeStyle = "rgba(175, 175, 175, 1)"

    for (let i = 0; i < points.length-1; i++) {
        for (let j = i+1; j < points.length; j++) {
            context.beginPath()
            context.moveTo(points[i].x,points[i].y)
            context.lineTo(points[j].x,points[j].y)
            context.stroke()
        }
        
    }

    context.strokeStyle = "rgba(0, 175, 255, 1)"

    drawPath(bestIndivid)

    for (let pnt = 0; pnt < points.length; pnt++) {
        context.fillStyle = "black"
        context.beginPath()
        context.arc(points[pnt].x, points[pnt].y, 10, 0, Math.PI * 2);
        context.fill()
    }

    algoState.innerHTML = "Состояние алгоритма: <br>завершился"
    bestState.innerHTML = "Итоговый рузельтат: " + Math.floor(bestIndDist)
}

function reset(){
    isTerminate = true
    isStop = false

    let btnStop = document.getElementById('stop')
    btnStop.innerHTML = "Приостановить"

    canvas.dataset.disable = "false"
    points = []

    let algoState = document.getElementById("stateWorking")
    algoState.innerHTML = "Состояние алгоритма: <br>спит"

    let bestState = document.getElementById("stateBest")
    bestState.innerHTML = "Лучшая дистанция: "

    let vertState = document.getElementById("numVertexes")
    let edgesState = document.getElementById("numEdges")

    vertState.innerHTML = "Количество вершин:"
    edgesState.innerHTML = "Количество ребер:"

    context.fillStyle = "white"
    context.fillRect(0,0,1000,750)

    isTerminate = false
}

async function stopping() {
    isStop = !isStop

    if(isStop){
        let btnStop = document.getElementById('stop')
        btnStop.innerHTML = "Продолжить"
    }
    else{
        btnStop.innerHTML = "Приостановить"
    }
}

let btnStart = document.getElementById("start")
btnStart.addEventListener('click',start)

let btnReset = document.getElementById("reset")
btnReset.addEventListener('click',reset)

let btnStop = document.getElementById('stop')
btnStop.addEventListener('click',stopping)


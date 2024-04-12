const canvas = document.getElementById('canvas')
const context = canvas.getContext("2d")

let points = []

context.strokeStyle = "black"
context.lineWidth = 4
context.lineCap = 'round'
const vertexSize = 10

function distanceBetween(pointA, pointB)
{
    const dx = pointA.x - pointB.x
    const dy = pointA.y - pointB.y
    return Math.sqrt(dx * dx + dy * dy)
}

function draw(event)
{
    const x = event.clientX - canvas.offsetLeft
    const y = event.clientY - canvas.offsetTop
    
    context.fillStyle = "black"
    context.fillRect(x, y, vertexSize, vertexSize)

    points.forEach(point=>{
        context.beginPath()
        context.moveTo(point.x+vertexSize/2,point.y+vertexSize/2)
        context.lineTo(x + vertexSize/2,y + vertexSize/2)
        context.stroke()
    })

    points.push({ x, y });
}
canvas.addEventListener('click', draw);

/*function clear(context)
{
    points = []
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
}*/

let btn = document.getElementById("start")

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
    let ind = 0
    let rand = Math.random()

    while(rand>0){
        rand -= prob[ind]
        ind++
    }

    return --ind
}

function drawPath(bestPath){
    for (let i = 0; i < bestPath.length - 1; i++) {
        context.beginPath()
        context.moveTo(points[bestPath[i]].x + vertexSize/2,points[bestPath[i]].y + vertexSize/2)
        context.lineTo(points[bestPath[i+1]].x + vertexSize/2,points[bestPath[i+1]].y + vertexSize/2)
        context.stroke()
    }
}

function mutate(path){
    if(Math.random(1) > 0.1){
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

async function start(){
    let arr = []

    for(let i = 0;i<points.length * 2;i++){
        let ph = fillingRand()
        let ind = new Individ(ph)

        arr.push(ind)
    }

    let counterForEsc = 0

    let curGen = new Generation(arr)
    let bestIndivid = curGen.bestInd
    let bestIndDist = curGen.bestDist

    while(counterForEsc<1000){
        context.strokeStyle = "rgba(175, 175, 175, 1)"

        for (let i = 0; i < points.length-1; i++) {
            for (let j = i+1; j < points.length; j++) {
                context.beginPath()
                context.moveTo(points[i].x + vertexSize/2,points[i].y + vertexSize/2)
                context.lineTo(points[j].x + vertexSize/2,points[j].y + vertexSize/2)
                context.stroke()
            }
            
        }

        context.strokeStyle = "rgba(255, 138, 0, 1)"

        drawPath(curGen.bestInd)

        await new Promise(resolve => setTimeout(resolve, 1))

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
    }

    context.strokeStyle = "rgba(175, 175, 175, 1)"

        for (let i = 0; i < points.length-1; i++) {
            for (let j = i+1; j < points.length; j++) {
                context.beginPath()
                context.moveTo(points[i].x + vertexSize/2,points[i].y + vertexSize/2)
                context.lineTo(points[j].x + vertexSize/2,points[j].y + vertexSize/2)
                context.stroke()
            }
            
        }

    context.strokeStyle = "rgba(255, 138, 0, 1)"

    drawPath(bestIndivid)

    console.log("END")
}


btn.addEventListener('click',start)



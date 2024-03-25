import { PriorityQueue } from "./priorityQueue.js"

let map = []
let currentPos = [0, 0]
let spawnPos = [0, 0]

let tool = 0

class GraphNode
{
    constructor(x, y)
    {
        this.x = x
        this.y = y
        this.adjacents = []
        this.locked = false
        this.uiCell = null

        this.lock = () => 
        {
            this.locked = true
            this.uiCell.classList.add('blocked')
        }

        this.unlock = () => 
        {
            this.locked = false
            this.uiCell.classList.remove('blocked')
        }
    }
}

function setCurrentPos(x, y)
{
    map[currentPos[0]][currentPos[1]].uiCell.classList.remove("current")
    currentPos = [x, y]
    map[x][y].uiCell.classList.add("current")
}

function setSpawnPos(x, y)
{
    map[spawnPos[0]][spawnPos[1]].uiCell.classList.remove("spawn")
    spawnPos = [x, y]
    map[x][y].uiCell.classList.add("spawn")
}

function clearTravelUI()
{
    for(let row of map)
    {
        for(let elem of row)
        {
            elem.uiCell.classList.remove('visited')
            elem.uiCell.classList.remove('seen')
        }
    }
}

function respawn()
{
    clearTravelUI()
    setCurrentPos(spawnPos[0], spawnPos[1])
}

let distanceBetween = (a, b) => 
{
    let dx = Math.abs(a.x - b.x)
    let dy = Math.abs(a.y - b.y)
    return dx + dy // manhattan distance
    //return Math.max(dx, dy) // Chebyshev's distance
    //return Math.sqrt(dx * dx + dy + dy) // Euclidean's distance
}

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) 
{ 
    return new Promise(resolve => setTimeout(resolve, ms))
}

function findPath(start, goal, map)
{
    let used = []
    let parent = {}
    let queue = new PriorityQueue()
    let g = {}
    let fValues = []
    let pathFound = false

    parent[[start.x, start.y]] = null
    g[start] = 0
    queue.enqueue(start, distanceBetween(start, goal))

    while (queue.isEmpty() == false)
    {
        let current = queue.dequeue().element

        if(current == goal)
        {    
            pathFound = true
            break
        }
        
        used.push(current)

        for(let coords of current.adjacents)
        {
            let v = map[coords[0]][coords[1]]
            if(v.locked) continue;

            let score = g[current] // + cost(current, v)
            if (used.includes(v) && score >= g[v])
            {
                continue
            }
            else
            {
                parent[[v.x, v.y]] = [current.x, current.y]
                g[v] = score
                let f = g[v] + distanceBetween(v, goal)
                fValues.push([v.x, v.y, f])
                queue.enqueue(v, f)
            }
        }
    }

    if(pathFound == false)
        return []

    let path = [goal]
    let current = parent[[goal.x, goal.y]]
    while (parent[[current[0], current[1]]] != null)
    {
        path.push(map[current[0]][current[1]])
        current = parent[[current[0], current[1]]]
    }
    path.push(map[current[0]][current[1]])

    return [path, fValues]
}

async function onCellClick(event)
{
    clearTravelUI()

    let btn = event.currentTarget
    let x = btn.getAttribute("data-x")
    let y = btn.getAttribute("data-y")

    let clickedNode = map[x][y]

    if(tool == 1)
    {
        if(clickedNode.locked)
        {
            clickedNode.unlock()
        }
        else
        {
            clickedNode.lock()
        }
    }

    if(tool == 0)
    {
        let currentNode = map[currentPos[0]][currentPos[1]]
        let pathInfo = findPath(currentNode, clickedNode, map)

        if(pathInfo.length == 0)
        {
            alert("path not found")
            return
        }

        let p = pathInfo[0]
        let f = pathInfo[1]

        let showSeenCells = document.getElementById("show-path-toggle").checked;
        let useAnim = document.getElementById("use-anim-toggle").checked;

        if(showSeenCells)
        {
            for(let data of f)
            {
                let step = map[data[0]][data[1]]
                step.uiCell.classList.add("seen")
                step.uiCell.innerHTML = data[2]

                if(useAnim) await sleep(10)
            }
        }

        p = p.reverse()

        for(let step of p)
        {
            step.uiCell.classList.add("visited")
            if(useAnim) await sleep(20)
        }

        for(let step of p)
        {
            setCurrentPos(step.x, step.y)
            if(useAnim) await sleep(30)
        }
    }

    if(tool == 2)
    {
        setSpawnPos(x, y)
    }
}

let showMap = (map) =>
{
    let mapDiv = document.getElementById("map")
    mapDiv.innerHTML = ""
    let tbl = document.createElement("table")
    mapDiv.appendChild(tbl)

    for(let row of map)
    {
        let uiRow = document.createElement("tr")
        tbl.appendChild(uiRow)
        for(let elem of row)
        {
            let cell = document.createElement("td")
            uiRow.appendChild(cell)
            cell.innerHTML = '0'
            cell.setAttribute("data-x", elem.x)
            cell.setAttribute("data-y", elem.y)

            elem.uiCell = cell

            cell.addEventListener("click", onCellClick)
        }
    }

    map[currentPos[0]][currentPos[1]].uiCell.classList.add("current")
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) 
{
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex > 0)
    {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

// https://habr.com/ru/articles/537630/
function generateMaze()
{
    let useAnim = document.getElementById("use-anim-toggle").checked;

    let size = parseInt(document.getElementById("map-size").value);
    console.log(size)
    let start = [0, 0]
    let finish = [Math.floor(Math.random() * size / 2) * 2 + 1, Math.floor(Math.random() * size / 2) * 2 + 1]

    for(let row of map)
    {
        for(let cell of row)
        {
            cell.lock()
        }
    }

    //map[start[0]][start[1]].locked = false
    map[finish[0]][finish[1]].unlock()

    let x = finish[0]
    let y = finish[1]
    let check = []

    if (y - 2 >= 0) check.push([x, y - 2])
    if (y + 2 < size) check.push([x, y + 2])
    if (x - 2 >= 0) check.push([x - 2, y])
    if (x + 2 < size) check.push([x + 2, y])

    while(check.length > 0)
    {
        let idx = Math.floor(Math.random() * check.length)
        let coords = check[idx]
        x = coords[0]
        y = coords[1]
        map[x][y].unlock()
        check.splice(idx, 1)

        let dirs = [[0, -1], [-1, 0], [1, 0], [0, 1]]
        dirs = shuffle(dirs)

        while(dirs.length > 0)
        {
            //let dirIndex = 0//Math.floor(Math.random() * dirs.length)
            //console.log(dirs, dirIndex)
            let dir = dirs.pop()//dirs[dirIndex]

            let x2 = x + dir[0]
            let y2 = y + dir[1]
            //dirs.splice(dirIndex, 1)

            if (x2 + dir[0] < 0) continue
            if (x2 + dir[0] >= size) continue
            if (y2 + dir[1] < 0) continue
            if (y2 + dir[1] >= size) continue
            if(map[x2 + dir[0]][y2 + dir[1]].locked) continue

            map[x2][y2].unlock()
            start = [x2, y2]
            break
        }

        if (y - 2 >= 0 && map[x][y - 2].locked) check.push([x, y - 2])
        if (y + 2 < size && map[x][y + 2].locked) check.push([x, y + 2])
        if (x - 2 >= 0 && map[x - 2][y].locked) check.push([x - 2, y])
        if (x + 2 < size && map[x + 2][y].locked) check.push([x + 2, y])
        
        //if(useAnim) await sleep(1)
    }

    for (let x = 0; x < size; ++x)
    {
        let flag = false
        for (let y = 0; y < size; ++y)
        {
            let node = map[x][y]
            if(node.locked == false)
            {
                setSpawnPos(x, y)
                flag = true
                break
            }
        }
        if(flag) break
    }
    respawn()
}

function makeMap()
{
    let size = parseInt(document.getElementById("map-size").value);

    map = []

    for (let x = 0; x < size; ++x)
    {
        map[x] = []
        for (let y = 0; y < size; ++y)
        {
            let node = new GraphNode(x, y)
            map[x][y] = node
        }
    }

    for (let x = 0; x < size; ++x)
    {
        for (let y = 0; y < size; ++y)
        {
            let node = map[x][y]
            if(x > 0) node.adjacents.push([x - 1, y])
            if(x < size - 1) node.adjacents.push([x + 1, y])
            if(y > 0) node.adjacents.push([x, y - 1])
            if(y < size - 1) node.adjacents.push([x, y + 1])
        }
    }

    //await sleep(10)

    currentPos = [0, 0]

    showMap(map)
    setSpawnPos(0, 0)

    if(document.getElementById('maze-toggle').checked) generateMaze()
}

document.getElementById("generate-btn").addEventListener("click", (e) => { makeMap(); })

document.getElementById("clear-btn").addEventListener("click", clearTravelUI)
document.getElementById("respawn-btn").addEventListener("click", respawn)

document.getElementById("tool-select").addEventListener("change", (e) => {
    tool = e.currentTarget.value
})

tool = document.getElementById("tool-select").value

makeMap()
respawn()


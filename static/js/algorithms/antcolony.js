let homeX = 0;
let homeY = 0;
let homePlaced = false;


const ants = [];
const grid = [];
let foodSources = []

const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');

function placeHome(event) {
    const x = Math.floor((event.clientX - canvas.offsetLeft) / 5);
    const y = Math.floor((event.clientY - canvas.offsetTop) / 5);

    if (!homePlaced) {
        homeX = x;
        homeY = y;
        homePlaced = true;
        context.fillStyle = "red";
        context.fillRect(x, y, 15, 15)
    }
    else {
        alert("Вы уже разместили муравейник");
        return;
    }
}

function placeFood(event) {
    const x = Math.floor((event.clientX - canvas.offsetLeft) / 5);
    const y = Math.floor((event.clientY - canvas.offsetTop) / 5);

    homeX = x;
    homeY = y;
    context.fillStyle = "green";
    context.fillRect(x, y, 10, 10);
    foodSources.push({ x, y });

}


class Ant {


    constructor() {
        this.x = homeX;
        this.y = homeY;
        this.goingHome = false;
    }
}


class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.homePheromone = 0;
        this.foodPheromone = 0;
        this.foodAmount = 0;
        this.obstacle = false;

        this.xCoord = this.x * 5;
        this.yCoord = this.y * 5;
    }
}

function getNeighbors(cell) {
    let neighbors = [];
    if (cell.x > 0) {
        neighbors.push(grid[cell.x - 1][cell.y]);
    }
    if (cell.x < columns - 1) {
        neighbors.push(grid[cell.x + 1][cell.y]);
    }

    if (cell.y > 0) {
        neighbors.push(grid[cell.x][cell.y - 1]);
    }
    if (cell.y < rows - 1) {
        neighbors.push(grid[cell.x][cell.y + 1]);
    }

    neighbors = neighbors.filter(cell => !cell.obstacle);

    return neighbors;
}

function stepCell(cell) {
    cell.homePheromone *= evaporation;
    cell.homePheromone = constrain(cell.homePheromone, minPheromone, maxPheromone);

    cell.foodPheromone *= evaporation;
    cell.foodPheromone = constrain(cell.foodPheromone, minPheromone, maxPheromone);
}

function drawCell(context, cell) {
    let cellColor;

    if (cell.homePheromone > cell.foodPheromone) {
        cellColor = lerpColor(color(255), color(0, 255, 0),
            cell.homePheromone / maxPheromone);
    } else {
        cellColor = lerpColor(color(255), color(0, 0, 255),
            cell.foodPheromone / maxPheromone);
    }


    context.fillStyle = cellColor;
    context.fillRect(cell.xCoord, cell.yCoord, 5, 5);

    if (cell.x == homeX && cell.y == homeY) {
        context.fillStyle = "red";
        context.fillRect(cell.xCoord, cell.yCoord, 5, 5)
    }

    if (cell.foodAmount > 0) {

        context.fillStyle = "green";
        context.fillRect(cell.xCoord, cell.yCoord, 5, 5)

    }

    if (cell.obstacle) {
        context.fillStyle = "grey";
        context.fillRect(cell.xCoord, cell.yCoord, 5, 5);
    }
}





function stepAnt(ant) {

    const neighbors = [];
    let totalChance = 0;
    let maxNeighborFoodPheromone = 0;
    let maxNeighborHomePheromone = 0;

    console.log(ant.y);


    for (const cell of getNeighbors(grid[ant.x][ant.y])) {
        const chance = pow(ant.goingHome ? cell.homePheromone : cell.foodPheromone, trailStrength);

        neighbors.push({ chance, cell });
        totalChance += chance;

        if (cell.homePheromone > maxNeighborHomePheromone) {
            maxNeighborHomePheromone = cell.homePheromone;
        }

        if (cell.foodPheromone > maxNeighborFoodPheromone) {
            maxNeighborFoodPheromone = cell.foodPheromone;
        }
    }

    const cell = grid[ant.x][ant.y];

    if (ant.x == homeX && ant.y == homeY) {
        ant.goingHome = false;
        cell.homePheromone = maxPheromone;
    }
    else {
        cell.homePheromone = maxNeighborHomePheromone * dropoff;
    }

    if (cell.foodAmount > 0) {
        ant.goingHome = true;
        cell.foodPheromone = maxPheromone;
    }
    else {
        cell.foodPheromone = maxNeighborFoodPheromone * dropoff;
    }

    const chance = random(totalChance);
    let currentChance = 0;

    for (const cell of neighbors) {
        currentChance += cell.chance;
        if (chance < currentChance) {
            ant.x = cell.cell.x;
            ant.y = cell.cell.y;
            break;
        }
    }
}

function drawAnt(context, ant) {
    const x = ant.x * 5 + 5 / 2;
    const y = ant.x * 5 + 5 / 2;

    if (ant.goingHome) {
        context.fillStyle = "green"
    }
    else {
        context.fillStyle = "red"
    }

    context.fillRect(x, y, 3, 3);
}


const columns = context.width / 5;
const rows = context.height / 5;

const maxAnts = 25;

const minPheromone = 1;
const maxPheromone = 100;
const evaporation = 0.85;
const dropoff = 0.85;
const trailStrength = 5;
const antFrameRate = 60;




for (let x = 0; x < columns; x++) {
    grid.push([]);
    for (let y = 0; y < rows; y++) {
        grid[x].push(new Cell(x, y));
        console.log(grid[x])
    }
}

for (let food in foodSources) {
    grid[food.x][food.y].foodAmount = 10;
}

for (let i = 0; i < maxAnts; i++) {
    ants.push(new Ant());
}

function placeObstacle(event, grid) {
    const x = Math.floor((event.clientX - canvas.offsetLeft) / 5);
    const y = Math.floor((event.clientY - canvas.offsetTop) / 5);

    context.fillStyle = "grey";
    context.fillRect(x, y, 5, 5);
    grid[x][y].obstacle = true;

}

let frameCount = 0;

function draw(context) {

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            if (frameCount % Math.floor(60 / antFrameRate) == 0) {
                stepAnt(grid[c][r]);
            }
            drawCell(context, grid[c][r]);
            frameCount++;
        }
    }

    for (let ant of ants) {
        if (frameCount % Math.floor(60 / antFrameRate) == 0) {
            stepAnt(ant);
        }
        drawAnt(context, ant);
    }

    if (mouseIsPressed) {
        canvas.addEventListener('click', placeObstacle);
    }

}


function emulate(context) {
    while (1) {
        draw(context);
    }
}

canvas.addEventListener('click', emulate);
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


let cities = [];
let pheromones = [];
let ants = [];
let bestTour = [];
let stopped = false;
let placingAnts = true;
let cleared = false;

let numAnts;
const alpha = 1;
const beta = 2;
const evaporationRate = 0.1;
const Q = 1;
let maxIterations;
let animating = false;

let labeltime = document.getElementById("timeoutlabel")
let speeed = document.getElementById("speed")
labeltime.textContent = speeed.value

speeed.addEventListener("input", (event) => {
    labeltime.textContent = event.target.value
})

let labelant = document.getElementById("antlabel")
let antsize = document.getElementById("antAmount")
labelant.textContent = antsize.value

antsize.addEventListener("input", (event) => {
    labelant.textContent = event.target.value
})


let labeliter = document.getElementById("iterationslabel")
let iteram = document.getElementById("iterationsAmount")
labeliter.textContent = iteram.value

iteram.addEventListener("input", (event) => {
    labeliter.textContent = event.target.value
    if (!animating) {
        maxIterations = parseInt(iteram.value);
    }
})

canvas.addEventListener('click', function (event) {
    if (placingAnts) {
        ctx.fillStyle = 'red';
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        cities.push({ x: x, y: y });

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
});

async function waitState() {

    return new Promise(resolve => {
        let timer = setInterval(checkState, 10)

        function checkState() {
            if (stopped == false) {
                clearInterval(timer)
                resolve(!stopped)
            }
        }
    })
}


function initPheromones() {
    for (let i = 0; i < cities.length; i++) {
        pheromones.push(new Array(cities.length).fill(1));
    }
}


function resetData() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pheromones = [];
    initPheromones();
    numAnts = parseInt(document.getElementById("antAmount").value)
    ants = [];
    for (let i = 0; i < numAnts; i++) {
        ants.push({
            tour: [],
            tourLength: 0,
            visited: new Array(cities.length).fill(false),
        });
    }
    draw();
}


function addCity(x, y) {
    cities.push({ x: x, y: y });
}

function stopStart() {
    if (stopped) {
        stopped = false;
    }
    else {
        stopped = true;
    }
}

function calculateDistance(city1, city2) {
    return Math.sqrt(Math.pow(city1.x - city2.x, 2) + Math.pow(city1.y - city2.y, 2));
}


function calculateDistanceBetweenCities(tour) {
    let distance = 0;
    for (let i = 0; i < tour.length - 1; i++) {
        distance += calculateDistance(cities[tour[i]], cities[tour[i + 1]]);
    }
    distance += calculateDistance(cities[tour[tour.length - 1]], cities[tour[0]]);
    return distance;
}



function updatePheromones() {
    pheromones = pheromones.map(row => row.map(val => val * (1 - evaporationRate)));
    for (let ant of ants) {
        for (let i = 0; i < ant.tour.length - 1; i++) {
            const city1 = ant.tour[i];
            const city2 = ant.tour[i + 1];
            pheromones[city1][city2] += Q / ant.tourLength;
            pheromones[city2][city1] += Q / ant.tourLength;
        }
    }
}


function chooseNextCity(antIndex) {
    const ant = ants[antIndex];
    const currentCity = ant.tour.length === 0 ? 0 : ant.tour[ant.tour.length - 1];
    const unvisitedCities = ant.visited.map((visited, index) => visited ? -1 : index);
    const probabilities = unvisitedCities.map(city => {
        if (city === -1) return 0;
        const pheromone = Math.pow(pheromones[currentCity][city], alpha);
        const attractiveness = 1 / calculateDistance(cities[currentCity], cities[city]);
        return pheromone * attractiveness;
    });
    const sum = probabilities.reduce((a, b) => a + b, 0);
    const selectedCity = selectRandomWithProbability(probabilities, sum);
    ant.tour.push(selectedCity);
    ant.visited[selectedCity] = true;
    ant.tourLength += calculateDistance(cities[currentCity], cities[selectedCity]);
}

function selectRandomWithProbability(probabilities, sum) {
    const threshold = Math.random() * sum;
    let total = 0;
    for (let i = 0; i < probabilities.length; i++) {
        total += probabilities[i];
        if (total >= threshold) {
            return i;
        }
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    cities.forEach((city) => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });



    ctx.strokeStyle = 'green';
    ants.forEach(ant => {
        ctx.beginPath();
        ant.tour.forEach(cityIndex => {
            const city = cities[cityIndex];
            ctx.lineTo(city.x, city.y);
        });
        ctx.stroke();
    });
    updatePheromones();
}

function drawBest() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.beginPath();
    bestTour.forEach((cityIndex) => {
        const city = cities[cityIndex];
        ctx.lineTo(city.x, city.y);
    });
    ctx.closePath();
    ctx.stroke();


    ctx.fillStyle = 'red';
    cities.forEach((city) => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

}


async function antColonyOptimization() {

    if (cities.length == 0) {
        alert("Вы не ввели ни одной вершины");
        return;
    }

    if (animating) {
        alert("Алгоритм уже запущен");
        return;
    }

    if (placingAnts) {
        placingAnts = false;
        resetData();
    }
    animating = true;
    bestTour = [];

    maxIterations = parseInt(iteram.value);

    for (let i = 0; i < maxIterations; i++) {

        if (stopped) {
            document.getElementById("stop").innerText = "Продолжить";
            let state = await waitState();
        }
        document.getElementById("stop").innerText = "Приостановить";
        ants.forEach((ant, index) => {
            if (ant.tour.length <= cities.length) {
                chooseNextCity(index);
            } else {
                ant.tourLength += calculateDistance(cities[ant.tour[cities.length - 1]], cities[ant.tour[0]]);

                ants[index] = {
                    tour: [],
                    tourLength: 0,
                    visited: new Array(cities.length).fill(false),
                };
            }
        });


        if (!bestTour.length || ants[0].tourLength < calculateDistanceBetweenCities(bestTour)) {
            if (ants[0].tour.length == cities.length + 1)
                bestTour = ants[0].tour;
        }

        if (cleared) {
            cleared = false;
            break;
        }

        draw();
        await new Promise(resolve => setTimeout(resolve, parseInt(document.getElementById("speed").value)));
    }
    drawBest();
    maxIterations = parseInt(iteram.value);
    placingAnts = true;
    animating = false;
    stopped = false;

}

function clear() {
    if (!cleared) {
        cleared = true;
    }
    if (cleared) {
        cleared = false;
    }
    maxIterations = parseInt(iteram.value);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ants = [];
    pheromones = [];
    cities = [];
    bestTour = [];
    stopped = false;
    placingAnts = true;
    animating = false;
}


document.getElementById("goslingCSS").addEventListener('click', () => { antColonyOptimization() });
document.getElementById("stop").addEventListener('click', () => { stopStart() });
document.getElementById("clear").addEventListener('click', () => { clear() });

const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
let points = [];

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[getRandomNumber(0, 15)];
    }
    return color;
}

function distance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function draw(event) {
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    points.push({ x, y });

    context.fillStyle = "black";
    context.fillRect(x, y, 15, 15);

}
canvas.addEventListener('click', draw);

function clear(context) {
    points = []
    context.fillStyle = "white"
    context.clearRect(0, 0, canvas.width, canvas.height);
}


function chooseCentroids(points, amount) {
    const centroids = [];
    for (let i = 0; i < amount; i++) {
        let indx = Math.floor(Math.random() * points.length);
        while (centroids.includes(points[indx])) {
            indx = Math.floor(Math.random() * points.length);
        }
        centroids.push(points[indx]);
    }
    return centroids;
}

function kMeanClusterization(points, amount) {
    let centroids = chooseCentroids(points, amount)
    let clusters = [];

    for (let i = 0; i < amount; ++i) {
        clusters.push([])
    }

    for (let i = 0; i < 100; i++) {
        for (let k = 0; k < amount; k++) {
            clusters[k] = [];
        }

        for (let j = 0; j < points.length; j++) {
            let minDistance = Infinity;
            let closestCluster = 0;
            for (let n = 0; n < amount; n++) {
                const dist = distance(centroids[n], points[j]);

                if (dist < minDistance) {
                    minDistance = dist;
                    closestCluster = n;
                }
            }
            clusters[closestCluster].push(points[j]);
        }

        let newCentroids = [];
        for (let m = 0; m < amount; m++) {
            if (clusters[m].length > 0) {
                const sumX = clusters[m].reduce((acc, point) => acc + point.x, 0);
                const sumY = clusters[m].reduce((acc, point) => acc + point.y, 0);
                const centroidX = sumX / clusters[m].length;
                const centroidY = sumY / clusters[m].length;
                newCentroids.push({ x: centroidX, y: centroidY });
            }
            else {
                newCentroids.push(centroids[m]);
            }
        }
        if (centroids[0] == newCentroids[0] & centroids[1] == newCentroids[1] & centroids[1] == newCentroids[1]) {
            break;
        }

        centroids = newCentroids;

    }
    return clusters;
}

function kMeanClusterizationOnCanvas(points, context) {

    let size = parseInt(document.getElementById("clustersAmount").value);
    if (size >  points.length)
    {
        alert(`Вы поствили меньше ${size} точек`);
        return;
    }
    let color;
    let clusters = kMeanClusterization(points, size);

    for (let i = 0; i < size; i++)
    {
        color = generateRandomHexColor();
        for (let j = 0; j < clusters[i].length; j++) {
            context.fillStyle = color;
            context.fillRect(clusters[i][j].x, clusters[i][j].y, 15, 5);
        }
    }
}

function hierarchicalClusterization(points, amount) {
    let clusters = points.map(points => [points]);
    while (clusters.length != amount) {
        let dist = [];
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                let distanciya = Math.min(...clusters[i].map(pointA => Math.min(...clusters[j].map(pointB => distance(pointA, pointB)))));
                dist.push({ i, j, distanciya });
            }
        }

        let minDist = Math.min(...dist.map(dt => dt.distanciya));

        let newClusters = dist.filter(k => k.distanciya == minDist)[0];
        let newCluster = [...clusters[newClusters.i], ...clusters[newClusters.j]];

        clusters.splice(newClusters.j, 1);
        clusters.splice(newClusters.i, 1);

        clusters.push(newCluster);
    }

    return clusters;
}

function hierarchicalClusterizationOnCanvas(points, context) {
    let size = parseInt(document.getElementById("clustersAmount").value);
    if (size >  points.length)
    {
        alert(`Вы поствили меньше ${size} точек`)
        return;
    }

    let color;
    let clusters = hierarchicalClusterization(points, size);

    for (let i = 0; i < size; i++)
    {
        color = generateRandomHexColor();
        for (let j = 0; j < clusters[i].length; j++) {
            context.fillStyle = color;
            context.fillRect(clusters[i][j].x, clusters[i][j].y + 5, 15, 5);
        }
    }
}

function chooseMedoids(points, amount) {
    const medoids = [];
    for (let i = 0; i < amount; i++) {
        let indx = Math.floor(Math.random() * points.length);
        while (medoids.includes(points[indx])) {
            indx = Math.floor(Math.random() * points.length)
        }
        medoids.push(points[indx]);
    }
    return medoids;
}

function kMedoidsClusterization(points, amount) {
    let medoids = chooseMedoids(points, amount)
    let clusters = [];
    

    for (let i = 0; i < amount; ++i) {
        clusters.push([])
    }

    for (let i = 0; i < 100; i++) {
        for (let k = 0; k < amount; k++) {
            clusters[k] = [];
        }

        for (let j = 0; j < points.length; j++) {
            let minDistance = Infinity;
            let closestCluster = 0;
            for (let n = 0; n < amount; n++) {
                const dist = distance(medoids[n], points[j]);

                if (dist < minDistance) {
                    minDistance = dist;
                    closestCluster = n;
                }
            }
            clusters[closestCluster].push(points[j]);
        }

        let newMedoids = [];
        for (let m = 0; m < amount; m++) {
            const cluster = clusters[m];
            let minDist = Infinity;
            let newMedoid = 0;

            for (let k = 0; k < cluster.length; k++) {
                const potential = cluster[k];
                const dist = cluster.reduce((acc, point) => acc + distance(point, potential), 0);
                if (dist < minDist) {
                    minDist = dist;
                    newMedoid = potential;
                }
            }
            newMedoids.push(newMedoid);
        }
        if (medoids[0] == newMedoids[0] & medoids[1] == newMedoids[1] & medoids[1] == newMedoids[1]) {
            break;
        }

        medoids = newMedoids;

    }
    return clusters;
}

function kMedoidsClusterizationOnCanvas(points, context) {

    let size = parseInt(document.getElementById("clustersAmount").value);

    if (size >  points.length)
    {
        alert(`Вы поствили меньше ${size} точек`)
        return;
    }
    let color;
    let clusters = kMedoidsClusterization(points, size);


    for (let i = 0; i < size; i++)
    {
        color = generateRandomHexColor();
        for (let j = 0; j < clusters[i].length; j++) {
            context.fillStyle = color;
            context.fillRect(clusters[i][j].x, clusters[i][j].y + 10, 15, 5);
        }
    }
}


document.getElementById("kMeansActivate").addEventListener('click', () => { kMeanClusterizationOnCanvas(points, context) });
document.getElementById("hierarchicalActivate").addEventListener('click', () => { hierarchicalClusterizationOnCanvas(points, context) });
document.getElementById("kMedoidsActivate").addEventListener('click', () => { kMedoidsClusterizationOnCanvas(points, context) });

document.getElementById("goslingCSS").addEventListener('click', () => { clear(context) });

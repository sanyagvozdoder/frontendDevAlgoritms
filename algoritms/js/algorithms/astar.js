
mapUI = document.getElementById("map")
mapSizeInput = document.getElementById("map-size")

map = []

generateFun = () =>
{
    let size = parseInt(document.getElementById("map-size").getAttribute('value'));
    
    for (let i = 0; i < size; ++i)
    {
        map[i] = []
        for (let j = 0; j < size; ++j)
        {
            map[i][j] = 0
        }
    }

    console.log(map)
}

document.getElementById("generate-btn").addEventListener("click", generateFun)

generateFun()


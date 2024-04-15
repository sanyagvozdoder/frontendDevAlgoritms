function openSideBar(){
    document.getElementById('side-nav').style.width = "275px"
    document.getElementById('main-container').style.marginLeft = "275px"
    document.getElementById('main-container').style.opacity = "0.4"
}
function closeSideBar(){
    document.getElementById('side-nav').style.width = "50px"
    document.getElementById('main-container').style.marginLeft = "210px"
    document.getElementById('main-container').style.opacity = "1"
}

var sideBar = document.getElementById("side-nav")
sideBar.onmouseover = openSideBar
sideBar.onmouseleave = closeSideBar
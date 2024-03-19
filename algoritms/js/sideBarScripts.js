function openSideBar(){
    document.getElementById('side-nav').style.width = "275px"
    document.getElementById('main-container').style.marginLeft = "275px"
    document.getElementById('main-container').style.opacity = "0.4"
}
function closeSideBar(){
    document.getElementById('side-nav').style.width = "0px"
    document.getElementById('main-container').style.marginLeft = "210px"
    document.getElementById('main-container').style.opacity = "1"

}

var openButton = document.getElementById("openbutton")
openButton.onmouseover = openSideBar
var sidebar = document.getElementById('side-nav')
sidebar.onmouseleave = closeSideBar
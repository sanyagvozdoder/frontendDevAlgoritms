//TODO:add opacity to main colors

function openSideBar(){
    document.getElementById('side-nav').style.width = "275px"
    document.getElementById('main-container').style.marginLeft = "275px"
}
function closeSideBar(){
    document.getElementById('side-nav').style.width = "0px"
    document.getElementById('main-container').style.marginLeft = "210px"

}

var openButton = document.getElementById("openbutton")
openButton.onmouseover = openSideBar
var sidebar = document.getElementById('side-nav')
sidebar.onmouseleave = closeSideBar
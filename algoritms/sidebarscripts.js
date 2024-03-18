function openSideBar(){
    document.getElementById('side-nav').style.width = "275px"
}
function closeSideBar(){
    document.getElementById('side-nav').style.width = "0px"
}

var openButton = document.getElementById("openbutton")
openButton.onmouseover = openSideBar
var sidebar = document.getElementById('side-nav')
sidebar.onmouseleave = closeSideBar
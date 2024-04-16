function openTab(e, tab)
{
    let btn = e.currentTarget
    let btns = btn.parentNode
    let elem = document.getElementById(tab)
    let parent = elem.parentNode

    for (const child of parent.children) 
    {
        child.style.display = "none";
    }

    for (const child of btns.children) 
    {
        child.classList.remove("active");
    }

    elem.style.display = "block";
    btn.classList.add("active");
} 
async function getFileContent(url){
    let response = await fetch(url)

    if(response.status != 200){
        throw new Error()
    }

    let content = await response.text()

    return content
}

async function loadPage(url){
    let block = document.querySelector("#content-block")
    try {
        block.classList.remove("op-1-sm")
        block.innerHTML = ""
		let data = await getFileContent(url)
		block.innerHTML = data
        block.classList.add("op-1-sm")
	}
	catch(e) {
		alert(e.message)
	}
}

let body = document.body;

let scriptsList = []

function makeScript(url)
{
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    body.appendChild(script)
    scriptsList.push(script)
}

function removeCustomScripts()
{
    while(scriptsList.length > 0)
    {
        scriptsList.pop().remove()
    }
}

let homePage = "../html/pages/home.html"

document.querySelectorAll('[data-loadpage]').forEach(btn => {
    btn.addEventListener('click', async function(event) { 
        removeCustomScripts()
        let tg = event.currentTarget;
        await loadPage(tg.getAttribute('data-loadpage'))
        if(tg.hasAttribute('data-loadscript'))
        {makeScript(tg.getAttribute('data-loadscript'))}
    })
});

// by default load home.html
loadPage(homePage)
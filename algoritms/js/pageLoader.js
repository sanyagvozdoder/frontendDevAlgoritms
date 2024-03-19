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

let homePage = "../html/pages/home.html"

document.querySelectorAll('[data-loadpage]').forEach(btn => {
    btn.addEventListener('click', event => { 
        loadPage(event.currentTarget.getAttribute('data-loadpage')); 
    })
});

// by default load home.html
loadPage(homePage)
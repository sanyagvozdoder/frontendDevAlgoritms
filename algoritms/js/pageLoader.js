async function getFileContent(url){
    let response = await fetch(url)

    if(response.status != 200){
        throw new Error()
    }

    let content = await response.text()

    return content
}

async function loadPage(url){
    try {
		let data = await getFileContent(url)
		document.querySelector("#content-block").innerHTML = data
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
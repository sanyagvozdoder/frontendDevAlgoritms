async function getFileContent(url){
    let response = await fetch(url)

    if(response.status != 200){
        throw new Error()
    }

    let content = await response.text()

    return content
}

document.querySelector("#load").addEventListener('click', async function() {
	try {
		let text_data = await getFileContent("../html/pages/test.html");
		document.querySelector("#content-block").innerHTML = text_data;
	}
	catch(e) {
		alert(e.message);
	}
});
setInterval(() => {
	if(document.body.style.backgroundPosition == "") document.body.style.backgroundPosition = "0px 0px";
	else {
		const prev = Number(document.body.style.backgroundPosition.match(/\d{1,2}/g)[0]);
		if(prev >= 79) document.body.style.backgroundPosition = "0px 0px";
		else document.body.style.backgroundPosition = (prev + 1) + "px " + (prev + 1) + "px";
	}
}, 33);
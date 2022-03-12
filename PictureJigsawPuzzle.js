const puzzleImage = new Image(); //パズルに使用する画像を保持する。
puzzleImage.addEventListener("load", () => {
	const puzzleImageElement = document.getElementById("puzzle_image");
	const puzzleDivideCanvas = document.getElementById("puzzle_divide_canvas");
	const imageRatio = puzzleImage.naturalWidth / puzzleImage.naturalHeight;
	puzzleImageElement.src = puzzleImage.src;
	document.getElementById("puzzle_area").classList.remove("hidden");
	if(imageRatio >= 16 / 9) {
		puzzleImageElement.style.width = "800px"; 
		puzzleImageElement.style.height = "";
		puzzleDivideCanvas.width = 800;
		puzzleDivideCanvas.height = 800 / imageRatio;
	}
	else {
		puzzleImageElement.style.width = ""; 
		puzzleImageElement.style.height = "450px"; 
		puzzleDivideCanvas.width = 450 * imageRatio;
		puzzleDivideCanvas.height = 450;
	}
});

function selectImage() {
	//画像選択ウィンドウを開けて、画像を選択し、画像を表示させる処理
	const fileInput = document.createElement("INPUT");
	fileInput.type = "file";
	fileInput.accept = "image/*";
	fileInput.addEventListener("change", (event) => {
		const acceptFileType = ["png", "jpg", "jpeg"];
		console
		if(acceptFileType.indexOf(fileInput.value.split(".").slice(-1)[0]) >= 0) {
			//ファイルの形式が正しい場合の処理
			const reader = new FileReader();
			reader.addEventListener("load", (event) => {
				puzzleImage.src = event.target.result;
			});
			reader.readAsDataURL(event.target.files[0]);
		}
		else alert("選択したファイルの拡張子が正しくありません。\n使用できる拡張子は " + acceptFileType.join(", ") + " です。");
	});
	fileInput.click();
}

setInterval(() => {
	if(document.body.style.backgroundPosition == "") document.body.style.backgroundPosition = "0px 0px";
	else {
		const prev = Number(document.body.style.backgroundPosition.match(/\d{1,2}/g)[0]);
		if(prev >= 79) document.body.style.backgroundPosition = "0px 0px";
		else document.body.style.backgroundPosition = (prev + 1) + "px " + (prev + 1) + "px";
	}
}, 33);
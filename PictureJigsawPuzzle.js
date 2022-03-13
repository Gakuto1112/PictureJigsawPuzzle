const puzzleImage = new Image(); //パズルに使用する画像を保持する。
puzzleImage.addEventListener("load", () => {
	const puzzleImageElement = document.getElementById("puzzle_image");
	const puzzleDivideCanvas = document.getElementById("puzzle_divide_canvas");
	const imageRatio = puzzleImage.naturalWidth / puzzleImage.naturalHeight;
	const puzzleArea = document.getElementById("puzzle_area");
	puzzleImageElement.src = puzzleImage.src;
	puzzleArea.style.width = "824px";
	puzzleArea.style.height = "474px";
	puzzleArea.classList.remove("puzzle_frame", "puzzle_area_empty");
	puzzleImageElement.classList.add("puzzle_frame");
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
	document.getElementById("cannot_start_message").children.item(0).classList.add("hidden");
	const column = document.getElementById("puzzle_column_division");
	const row = document.getElementById("puzzle_row_division");
	if(!column.classList.contains("text_box_invalid") && !row.classList.contains("text_box_invalid")) drawDivisionLine(column.value, row.value);
	startCheck();
});

function swapClass(element, classOut, classIn) {
	//要素のクラスの入れ替え
	element.classList.remove(classOut);
	element.classList.add(classIn);
}

function fadeOutElement(element, transition) {
	//要素をフェードアウトさせる。トランジションは秒。
	element.style.transition = "opacity " + transition + "s";
	element.style.opacity = 0;
	element.addEventListener("transitionend", () => {
		element.style.transition = "";
		element.style.opacity = 1;
		element.classList.add("hidden");
	}, { once: true });
}

function selectImage() {
	//画像選択ウィンドウを開けて、画像を選択し、画像を表示させる処理
	const fileInput = document.createElement("INPUT");
	fileInput.type = "file";
	fileInput.accept = "image/*";
	fileInput.addEventListener("change", (event) => {
		const acceptFileType = ["png", "jpg", "jpeg"];
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

function divisionInputCheck() {
	//分割数入力が正しいか検証
	const column = document.getElementById("puzzle_column_division");
	const row = document.getElementById("puzzle_row_division");
	const pieceCount = document.getElementById("piece_count");
	const start = document.getElementById("start");
	const cannotStartMessage = document.getElementById("cannot_start_message");
	startCheck();
	if(column.value == 1 && row.value == 1) {
		column.classList.add("text_box_invalid");
		row.classList.add("text_box_invalid");
		pieceCount.innerText = 1;
		cannotStartMessage.children.item(1).classList.remove("hidden");
		cannotStartMessage.children.item(2).classList.add("hidden");
		cannotStartMessage.children.item(3).classList.add("hidden");
		start.classList.add("button_disabled");
	}
	else {
		cannotStartMessage.children.item(1).classList.add("hidden");
		if(column.value < 1 || column.value % 1 != 0) {
			column.classList.add("text_box_invalid");
			cannotStartMessage.children.item(2).classList.remove("hidden");
			start.classList.add("button_disabled");
		}
		else {
			column.classList.remove("text_box_invalid");
			cannotStartMessage.children.item(2).classList.add("hidden");
			startCheck();
		}
		if(row.value < 1 || row.value % 1 != 0) {
			row.classList.add("text_box_invalid");
			cannotStartMessage.children.item(3).classList.remove("hidden");
			start.classList.add("button_disabled");
		}
		else {
			row.classList.remove("text_box_invalid");
			cannotStartMessage.children.item(3).classList.add("hidden");
			startCheck();
		}
	}
	if(!column.classList.contains("text_box_invalid") && !row.classList.contains("text_box_invalid")) {
		if(document.getElementById("puzzle_image").src != "") drawDivisionLine(column.value, row.value);
		pieceCount.innerText = (column.value * row.value).toLocaleString();
	}
	else pieceCount.innerText = "??";
}

function drawDivisionLine(column, row) {
	//プレビューの分割線を描画
	const divisionLineCanvas = document.getElementById("puzzle_divide_canvas");
	const canvasWidth = divisionLineCanvas.width;
	const canvasHeight = divisionLineCanvas.height;
	const context = divisionLineCanvas.getContext("2d");
	context.clearRect(0, 0, 900, 450);
	for(let i = 0; i < row; i++) {
		for(let j = 0; j < column; j++) {
			context.strokeStyle = "solid 1px dimgrey";
			context.strokeRect(canvasWidth / column * j, canvasHeight / row * i, canvasWidth / column, canvasHeight / row);
		}
	}
}

function startCheck() {
	//スタートできるかチェックし、ボタンの有効化/無効化
	if(!Array.prototype.slice.call(document.getElementById("cannot_start_message").children).find((message) => !message.classList.contains("hidden"))) {
		document.getElementById("start").classList.remove("button_disabled");
	}
}

function start(buttonElement) {
	//ゲーム開始
	if(!buttonElement.classList.contains("button_disabled")) {
		document.getElementById("puzzle_column_division").disabled = true;
		document.getElementById("puzzle_row_division").disabled = true;
		buttonElement.classList.add("button_disabled");
		swapClass(document.body, "background_blue", "background_green");
		swapClass(document.getElementById("header"), "header_blue", "header_green");
		fadeOutElement(document.getElementById("puzzle_division_settings"), 1.5);
		fadeOutElement(document.getElementById("puzzle_piece_count"), 1.5);
		fadeOutElement(document.getElementById("start"), 1.5);
		fadeOutElement(document.getElementById("cannot_start_message"), 1.5);
	}
}

//以下main
//ブラウザがキャンバス描画に対応している確認
const canvasForCheck = document.createElement("CANVAS");
if(canvasForCheck.getContext) document.getElementById("message_canvas_not_available").remove();
else {
	document.getElementById("puzzle_area").remove();
	document.getElementById("puzzle_division_settings").remove();
}
delete canvasForCheck;
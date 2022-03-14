const puzzleImage = new Image(); //パズルに使用する画像を保持する。
puzzleImage.addEventListener("load", () => {
	const puzzleImageElement = document.getElementById("puzzle_image");
	const puzzleDivideCanvas = document.getElementById("puzzle_divide_canvas");
	const puzzleBackground = document.getElementById("puzzle_background");
	const imageRatio = puzzleImage.naturalWidth / puzzleImage.naturalHeight;
	const puzzleArea = document.getElementById("puzzle_area");
	puzzleImageElement.src = puzzleImage.src;
	puzzleArea.style.width = "824px";
	puzzleArea.style.height = "474px";
	puzzleArea.classList.remove("puzzle_frame");
	puzzleDivideCanvas.classList.add("puzzle_frame");
	document.getElementById("puzzle_empty_text").classList.add("hidden");
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
	puzzleBackground.style.width = puzzleDivideCanvas.width + "px";
	puzzleBackground.style.height = puzzleDivideCanvas.height + "px";
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

function fadeInElement(element, transition, callback) {
	//要素をフェードインさせる。トランジションは秒。
	element.style.animationDuration = transition + "s";
	element.classList.add("fade_in");
	element.classList.remove("hidden");
	element.addEventListener("animationend", () => {
		element.classList.remove("fade_in");
		if(typeof callback == "function") callback();
	}, { once: true });
}

function fadeOutElement(element, transition, callback) {
	//要素をフェードアウトさせる。トランジションは秒。
	element.style.transition = "opacity " + transition + "s";
	element.style.opacity = 0;
	element.addEventListener("transitionend", () => {
		element.style.transition = "";
		element.style.opacity = 1;
		element.classList.add("hidden");
		if(typeof callback == "function") callback();
	}, { once: true });
}

function selectImage(clickElement) {
	//画像選択ウィンドウを開けて、画像を選択し、画像を表示させる処理
	if(clickElement.classList.contains("puzzle_area_image_select")) {
		const fileInput = document.createElement("INPUT");
		fileInput.type = "file";
		fileInput.accept = "image/*";
		fileInput.addEventListener("change", (event) => {
			const acceptFileType = ["png", "jpg", "jpeg"];
			if(acceptFileType.indexOf(fileInput.value.split(".").slice(-1)[0].toLowerCase()) >= 0) {
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

function start(clickElement) {
	//ゲーム開始
	if(!clickElement.classList.contains("button_disabled")) {
		document.getElementById("puzzle_column_division").disabled = true;
		document.getElementById("puzzle_row_division").disabled = true;
		clickElement.classList.add("button_disabled");
		document.getElementById("puzzle_area").classList.remove("puzzle_area_image_select");
		swapClass(document.body, "background_blue", "background_green");
		swapClass(document.getElementById("header"), "header_blue", "header_green");
		fadeOutElement(document.getElementById("puzzle_division_settings"), 1.5);
		fadeOutElement(document.getElementById("puzzle_piece_count"), 1.5);
		fadeOutElement(document.getElementById("cannot_start_message"), 1.5);
		fadeOutElement(clickElement, 1.5, () => {
			const pieceSelectArea = document.getElementById("piece_select_area");
			pieceSelectArea.classList.add("piece_select_area_slide_in");
			pieceSelectArea.classList.remove("hidden");
			pieceSelectArea.addEventListener("animationend", () => {
				pieceSelectArea.classList.remove("piece_select_area_slide_in");
				//画像の分割
				const puzzleImageCanvas = document.getElementById("puzzle_divide_canvas");
				const column = document.getElementById("puzzle_column_division").value;
				const row = document.getElementById("puzzle_row_division").value;	
				const puzzlePieceArea = document.getElementById("puzzle_piece_area");
				const pieceArray = [];
				let puzzlePieceFadeOutCount = 0;
				let puzzlePieceFadeInCount = 0;
				puzzlePieceArea.style.gridTemplateColumns = "repeat(" + column + ", 1fr)";
				puzzlePieceArea.style.gridTemplateRows = "repeat(" + row + ", 1fr)";
				for(let i = 0; i < row; i++) {
					for(let j = 0; j < column; j++) {
						const puzzlePiece = document.createElement("CANVAS");
						puzzlePiece.setAttribute("data-piece-column", j);
						puzzlePiece.setAttribute("data-piece-row", i);
						puzzlePiece.width = puzzleImageCanvas.width / column;
						puzzlePiece.height = puzzleImageCanvas.height / row;
						puzzlePiece.getContext("2d").drawImage(puzzleImage, puzzleImage.naturalWidth / column * j, puzzleImage.naturalHeight / row * i, puzzleImage.naturalWidth / column, puzzleImage.naturalHeight / row, 0, 0, puzzlePiece.width, puzzlePiece.height);
						puzzlePieceArea.appendChild(puzzlePiece);
						const puzzlePieceClone = document.createElement("CANVAS");
						puzzlePieceClone.classList.add("hidden");
						puzzlePieceClone.setAttribute("data-piece-column", j);
						puzzlePieceClone.setAttribute("data-piece-row", i);
						puzzlePieceClone.width = puzzlePiece.width;
						puzzlePieceClone.height = puzzlePiece.height;
						puzzlePieceClone.getContext("2d").drawImage(puzzlePiece, 0, 0);
						pieceArray.push(puzzlePieceClone);
					}
				}
				
				//ピースの並び替え
				const randomPieceArray = [];
				while(pieceArray.length > 0) {
					const target = Math.floor(Math.random() * pieceArray.length);
					randomPieceArray.push(pieceArray[target]);
					pieceArray.splice(target, 1);
				}
				randomPieceArray.forEach((piece) => pieceSelectArea.appendChild(piece));

				//ピース消滅アニメーション
				document.getElementById("puzzle_image").classList.add("hidden");
				const puzzlePieceFadeOutInterval = setInterval(() => {
					puzzlePieceArea.children.item(puzzlePieceFadeOutCount).classList.add("puzzle_piece_fade_out");
					puzzlePieceArea.children.item(puzzlePieceFadeOutCount).addEventListener("animationend", (event) => event.target.style.opacity = 0, { once: true });
					if(puzzlePieceFadeOutCount < column * row - 1) puzzlePieceFadeOutCount++;
					else {
						puzzlePieceArea.children.item(puzzlePieceFadeOutCount).addEventListener("animationend", () => {
							while(puzzlePieceArea.firstElementChild) puzzlePieceArea.firstElementChild.remove();
							setTimeout(() => {
								//ピース出現アニメーション
								pieceSelectArea.style.paddingBottom = puzzleImageCanvas.height / row / 2 + 10 + "px";
								const puzzlePieceFadeInInterval = setInterval(() => {
									pieceSelectArea.children.item(puzzlePieceFadeInCount).classList.add("puzzle_piece_fade_in");
									pieceSelectArea.children.item(puzzlePieceFadeInCount).classList.remove("hidden");
									pieceSelectArea.scrollTo({ top: Math.floor(pieceSelectArea.scrollHeight / (puzzleImageCanvas.height / row + 20) - 1) * (puzzleImageCanvas.height / row + 20), left: 0 });
									if(puzzlePieceFadeInCount < column * row -1) puzzlePieceFadeInCount++;
									else {
										pieceSelectArea.style.paddingBottom = "0px";
										setTimeout(() => {
											pieceSelectArea.scrollTo({ top: 0, left: 0, behavior: "smooth"});
											setTimeout(() => {
												const startDisplay = document.getElementById("start_display_text");
												startDisplay.classList.add("start_display_animation");
												startDisplay.addEventListener("animationend", () => startDisplay.classList.remove("start_display_animation"));
											}, 1000);
										}, 1000);
										clearInterval(puzzlePieceFadeInInterval);
									}
								}, 3000 / (column * row));
							}, 1000);
						}, { once: true });
						clearInterval(puzzlePieceFadeOutInterval);
					}
				}, 3000 / (column * row));
			}, { once: true });
		});
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
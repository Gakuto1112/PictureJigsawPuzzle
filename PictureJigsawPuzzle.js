class GameTimer {
	constructor() {
		this.gameTimerInterval;
		this.gameTimeCount = 0;
		this.isTimerCounting = false;
	}

	startTimer() {
		this.gameTimerInterval = setInterval(() => {
			this.gameTimeCount++;
			document.getElementsByName("game_timer_minute").forEach((element) => element.innerText = Math.floor(this.gameTimeCount / 60));
			document.getElementsByName("game_timer_second").forEach((element) => element.innerText = ("0" + Math.floor(this.gameTimeCount % 60)).slice(-2));
		}, 1000);
		this.isTimerCounting = true;
	}

	stopTimer() {
		clearInterval(this.gameTimerInterval);
		this.isTimerCounting = false;
	}
}

class AudioPlayer {
	constructor(audioList, volume) {
		this.audios = audioList;
		this.audioLoop;
		this.volume = Math.min(Math.max(volume, -1), 1);
		Object.keys(this.audios).forEach((key) => this.audios[key].load());
	}

	play(audioName) {
		const audioTmp = new Audio(this.audios[audioName].src);
		audioTmp.volume = this.volume;
		audioTmp.play();	
	}

	playLoop(audioName) {
		this.audioLoop = new Audio(this.audios[audioName].src);
		this.audioLoop.volume = this.volume;
		this.audioLoop.loop = true;
		this.audioLoop.play();
	}

	setVolume(newVolume) {
		this.volume = Math.min(Math.max(newVolume, -1), 1);
		if(this.audioLoop) this.audioLoop.volume = this.volume;
	}
}

const music = new AudioPlayer({ "main": new Audio("Music/" + Math.floor(Math.random() * 3 + 1).toString() + ".mp3") }, document.getElementsByClassName("music_volume")[0].value);
const sound = new AudioPlayer({ buttonPush: new Audio("Sounds/ButtonPush.mp3"), startPush: new Audio("Sounds/StartPush.mp3"), pieceAnimation: new Audio("Sounds/PieceAnimation.mp3"), startSound: new Audio("Sounds/StartSound.mp3"), pieceSelect: new Audio("Sounds/PieceSelect.mp3"), pieceMove: new Audio("Sounds/PieceMove.mp3"), puzzleComplete: new Audio("Sounds/PuzzleComplete.mp3") }, document.getElementsByClassName("sound_volume")[0].value); //サウンドを保持する変数
const puzzleImage = new Image(); //パズルに使用する画像を保持する。
let gameTimer; //ゲームタイマー
let selectedPiece; //選択したパズルピース
let puzzlePieceAreaEvent; //puzzle_piece_areaのイベント変数
let musicFlag = false; //音楽を再生する用のフラグ

puzzleImage.addEventListener("load", () => {
	const puzzleImageElement = document.getElementById("puzzle_image");
	const puzzleDivideCanvas = document.getElementById("puzzle_divide_canvas");
	const puzzleBackground = document.getElementById("puzzle_background");
	const imageShowImage = document.querySelector("#image_show_area > div > img");
	const imageRatio = puzzleImage.naturalWidth / puzzleImage.naturalHeight;
	const puzzleArea = document.getElementById("puzzle_area");
	puzzleImageElement.src = imageShowImage.src = puzzleImage.src;
	puzzleArea.style.width = "824px";
	puzzleArea.style.height = "474px";
	puzzleArea.classList.remove("puzzle_frame");
	puzzleDivideCanvas.classList.add("puzzle_frame");
	document.getElementById("puzzle_empty_text").classList.add("hidden");
	if(imageRatio >= 16 / 9) {
		puzzleImageElement.style.width = imageShowImage.style.width = "800px"; 
		puzzleImageElement.style.height = imageShowImage.style.height = "";
		puzzleDivideCanvas.width = 800;
		puzzleDivideCanvas.height = 800 / imageRatio;
	}
	else {
		puzzleImageElement.style.width = imageShowImage.style.width = ""; 
		puzzleImageElement.style.height = imageShowImage.style.height = "450px"; 
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

function fadeInElement(element, duration, callback) {
	//要素をフェードインさせる。トランジションは秒。
	element.style.animationDuration = duration + "s";
	element.classList.add("fade_in");
	element.classList.remove("hidden");
	element.addEventListener("animationend", () => {
		element.style.animationDuration = "";
		element.classList.remove("fade_in");
		if(typeof callback == "function") callback();
	}, { once: true });
}

function fadeOutElement(element, duration, callback) {
	//要素をフェードアウトさせる。トランジションは秒。
	element.style.animationDuration = duration + "s";
	element.classList.add("fade_out");
	element.addEventListener("animationend", () => {
		element.style.animationDuration = "";
		element.classList.remove("fade_out");
		element.classList.add("hidden");
		if(typeof callback == "function") callback();
	}, { once: true });
}

function cloneCanvasElement(canvasToClone, attributes) {
	//キャンバスを複製する。
	const clonedCanvas = document.createElement("CANVAS");
	clonedCanvas.width = canvasToClone.width;
	clonedCanvas.height = canvasToClone.height;
	if(attributes) Object.keys(attributes).forEach((key) => clonedCanvas.setAttribute(key, attributes[key]));
	clonedCanvas.getContext("2d").drawImage(canvasToClone, 0, 0);
	return clonedCanvas;
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
	const puzzleImageElement = document.getElementById("puzzle_image");
	const column = document.getElementById("puzzle_column_division");
	const row = document.getElementById("puzzle_row_division");
	const pieceCount = document.getElementsByName("piece_count");
	const start = document.getElementById("start");
	const cannotStartMessage = document.getElementById("cannot_start_message");
	startCheck();
	if(column.value == 1 && row.value == 1) {
		if(puzzleImageElement.src != "") drawDivisionLine(1, 1);
		column.classList.add("text_box_invalid");
		row.classList.add("text_box_invalid");
		pieceCount.forEach((element) => element.innerText = 1);
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
		if(puzzleImageElement.src != "") drawDivisionLine(column.value, row.value);
		pieceCount.forEach((element) => element.innerText = (column.value * row.value).toLocaleString());
	}
	else if(column.value != 1 || row.value != 1) pieceCount.forEach((element) => element.innerText = "??");
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
		const pieceSelectArea = document.getElementById("piece_select_area");
		document.getElementById("puzzle_column_division").disabled = true;
		document.getElementById("puzzle_row_division").disabled = true;
		clickElement.classList.add("button_disabled");
		document.getElementById("puzzle_area").classList.remove("puzzle_area_image_select");
		swapClass(document.body, "background_blue", "background_green");
		swapClass(document.getElementById("header"), "header_blue", "header_green");
		pieceSelectArea.classList.add("piece_select_area_slide_in");
		pieceSelectArea.classList.remove("hidden");
		sound.play("startPush");
		music.setVolume(music.volume / 2);
		pieceSelectArea.addEventListener("animationend", () => {
			document.getElementById("main_menu").classList.add("hidden");
			pieceSelectArea.classList.remove("piece_select_area_slide_in");
			//画像の分割
			const puzzleImageCanvas = document.getElementById("puzzle_divide_canvas");
			const column = document.getElementById("puzzle_column_division").value;
			const row = document.getElementById("puzzle_row_division").value;	
			const puzzlePieceArea = document.getElementById("puzzle_piece_area");
			const pieceArray = [];
			let puzzlePieceFadeOutCount = 0;
			let puzzlePieceFadeInCount = 0;
			puzzlePieceArea.style.width = puzzleImageCanvas.width + "px";
			puzzlePieceArea.style.height = puzzleImageCanvas.height + "px";
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
					const puzzlePieceClone = cloneCanvasElement(puzzlePiece);
					puzzlePieceClone.classList.add("hidden");
					puzzlePieceClone.setAttribute("data-piece-column", j);
					puzzlePieceClone.setAttribute("data-piece-row", i);
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
				sound.play("pieceAnimation");
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
								sound.play("pieceAnimation");
								pieceSelectArea.children.item(puzzlePieceFadeInCount).addEventListener("animationend", (event) => event.target.classList.remove("puzzle_piece_fade_in"), { once: true });
								pieceSelectArea.scrollTo({ top: Math.floor(pieceSelectArea.scrollHeight / (puzzleImageCanvas.height / row + 20) - 1) * (puzzleImageCanvas.height / row + 20), left: 0 });
								if(puzzlePieceFadeInCount < column * row -1) puzzlePieceFadeInCount++;
								else {
									pieceSelectArea.style.paddingBottom = "0px";
									setTimeout(() => {
										pieceSelectArea.scrollTo({ top: 0, left: 0, behavior: "smooth"});
										setTimeout(() => {
											const popupDisplay = document.getElementById("popup_display_text");
											popupDisplay.innerText = "START";
											popupDisplay.classList.add("popup_display_animation");
											setTimeout(() => sound.play("startSound"), 900);
											popupDisplay.addEventListener("animationend", () => {
												popupDisplay.innerText = "";
												popupDisplay.classList.remove("popup_display_animation");
												document.getElementById("game_timer_area").classList.remove("hidden");
												document.getElementById("piece_moving_area").classList.remove("hidden");
												fadeInElement(document.getElementById("pause_button"), 0.3);
												music.setVolume(music.volume * 2);										
												randomPieceArray.forEach((piece) => piece.addEventListener("click", () => pieceClick(piece)));
												puzzlePieceAreaEvent = (event) => puzzlePieceAreaClick(event.offsetX, event.offsetY);
												puzzlePieceArea.addEventListener("click", puzzlePieceAreaEvent);
												gameTimer = new GameTimer();
												gameTimer.startTimer();
											}, { once: true });
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
	}
}

function pieceClick(pieceElement) {
	//ピースをクリックしたときの処理
	if(pieceElement == selectedPiece) {
		sound.play("pieceSelect");
		selectedPiece.classList.remove("piece_selecting");
		selectedPiece = null;
	}
	else if(!pieceElement.classList.contains("piece_used")) {
		if(selectedPiece) selectedPiece.classList.remove("piece_selecting");
		sound.play("pieceSelect")
		selectedPiece = pieceElement;
		selectedPiece.classList.add("piece_selecting");
	}
}

function puzzlePieceAreaClick(offsetX, offsetY) {
	//ピースエリアをクリックしたときの処理
	if(gameTimer.isTimerCounting) {
		const puzzlePieceArea = document.getElementById("puzzle_piece_area");
		const puzzlePieceAreaRect = puzzlePieceArea.getBoundingClientRect();
		const pieceSelectArea = document.getElementById("piece_select_area");
		const pieceWidth = Number(/\d+/.exec(puzzlePieceArea.style.width)) / Number(/\d+/.exec(puzzlePieceArea.style.gridTemplateColumns));
		const pieceHeight = Number(/\d+/.exec(puzzlePieceArea.style.height)) / Number(/\d+/.exec(puzzlePieceArea.style.gridTemplateRows));
		const clickColumn = Math.floor(offsetX / pieceWidth);
		const clickRow = Math.floor(offsetY / pieceHeight);
		const targetPlaceElement = Array.prototype.slice.call(puzzlePieceArea.children).find((piece) => Number(/\d+/.exec(piece.style.gridColumn)) - 1 == clickColumn && Number(/\d+/.exec(piece.style.gridRow)) - 1 == clickRow);
		if(selectedPiece && !document.getElementById("piece_moving_area").firstElementChild) {
			switch(selectedPiece.parentElement.id) {
				case "puzzle_piece_area":
					if(targetPlaceElement) {
						if(selectedPiece.style.gridColumn == targetPlaceElement.style.gridColumn && selectedPiece.style.gridRow == targetPlaceElement.style.gridRow) {
							const pieceInSelectArea = Array.prototype.slice.call(pieceSelectArea.children).find((piece) => piece.getAttribute("data-piece-column") == targetPlaceElement.getAttribute("data-piece-column") && piece.getAttribute("data-piece-row") == targetPlaceElement.getAttribute("data-piece-row"));
							const pieceInSelectAreaRect = pieceInSelectArea.getBoundingClientRect();
							pieceMovingAnimation(targetPlaceElement, null, pieceInSelectAreaRect.left + window.scrollX, pieceInSelectAreaRect.top + window.scrollY, 0.3, true, () => pieceInSelectArea.classList.remove("piece_used"));
							sound.play("pieceMove");
							targetPlaceElement.remove();	
						}
						else {
							const selectedPieceColumn = selectedPiece.style.gridColumn;
							const selectedPieceRow = selectedPiece.style.gridRow;
							const selectedPieceRect = selectedPiece.getBoundingClientRect();
							pieceMovingAnimation(selectedPiece, "hidden", puzzlePieceAreaRect.left + window.scrollX + pieceWidth * clickColumn, puzzlePieceAreaRect.top + window.scrollY + pieceHeight * clickRow, 0.3, false, (piece) => piece.classList.remove("hidden"));
							pieceMovingAnimation(targetPlaceElement, "hidden", selectedPieceRect.left + window.scrollX, selectedPieceRect.top + window.scrollY, 0.3, false, (piece) => {
								piece.classList.remove("hidden");
								completeCheck();
							});
							sound.play("pieceMove");
							selectedPiece.style.gridColumn = targetPlaceElement.style.gridColumn;
							selectedPiece.style.gridRow = targetPlaceElement.style.gridRow;
							targetPlaceElement.style.gridColumn = selectedPieceColumn;
							targetPlaceElement.style.gridRow = selectedPieceRow;
						}
						selectedPiece.classList.remove("piece_selecting");
						selectedPiece = null;
					}
					else {
						pieceMovingAnimation(selectedPiece, "hidden", puzzlePieceAreaRect.left + window.scrollX + pieceWidth * clickColumn, puzzlePieceAreaRect.top + window.scrollY + pieceHeight * clickRow, 0.3, false, (piece) => piece.classList.remove("hidden"));
						sound.play("pieceMove");
						selectedPiece.style.gridColumn = clickColumn + 1;
						selectedPiece.style.gridRow = clickRow + 1;
						selectedPiece.classList.remove("piece_selecting");
						selectedPiece = null;
					}
					break;
				case "piece_select_area":
					if(targetPlaceElement) {
						const pieceInSelectArea = Array.prototype.slice.call(pieceSelectArea.children).find((piece) => piece.getAttribute("data-piece-column") == targetPlaceElement.getAttribute("data-piece-column") && piece.getAttribute("data-piece-row") == targetPlaceElement.getAttribute("data-piece-row"));
						const pieceInSelectAreaRect = pieceInSelectArea.getBoundingClientRect();
						pieceMovingAnimation(targetPlaceElement, null, pieceInSelectAreaRect.left + window.scrollX, pieceInSelectAreaRect.top + window.scrollY, 0.3, true, () => pieceInSelectArea.classList.remove("piece_used"));
						targetPlaceElement.remove();
					}
					const clonedPiece = cloneCanvasElement(selectedPiece, { "data-piece-column": selectedPiece.getAttribute("data-piece-column"), "data-piece-row": selectedPiece.getAttribute("data-piece-row") });
					clonedPiece.style.gridColumn = clickColumn + 1;
					clonedPiece.style.gridRow = clickRow + 1;
					pieceMovingAnimation(selectedPiece, "piece_used", puzzlePieceAreaRect.left + window.scrollX + pieceWidth * clickColumn, puzzlePieceAreaRect.top + window.scrollY + pieceHeight * clickRow, 0.3, false, () => {
						puzzlePieceArea.appendChild(clonedPiece);
						if(!targetPlaceElement) completeCheck();
					});
					sound.play("pieceMove");
					selectedPiece.classList.remove("piece_selecting");
					selectedPiece = null;
					break;
			}
		}
		else if(targetPlaceElement) {
			sound.play("pieceSelect");
			selectedPiece = targetPlaceElement;
			selectedPiece.classList.add("piece_selecting");
		}
	}
}

function pieceMovingAnimation(pieceToMove, classAddedOriginalPiece, destinationX, destinationY, duration, fadeOut, callback) {
	const clientRect = pieceToMove.getBoundingClientRect();
	const clonedPiece = cloneCanvasElement(pieceToMove);
	clonedPiece.style.top = clientRect.top + "px";
	clonedPiece.style.left = clientRect.left + "px";
	if(classAddedOriginalPiece) pieceToMove.classList.add(classAddedOriginalPiece);
	document.getElementById("piece_moving_area").appendChild(clonedPiece);
	clonedPiece.style.transition = duration + "s ease";
	clonedPiece.style.transform = "translate(" + (destinationX - clientRect.left - window.scrollX) + "px, " + (destinationY - clientRect.top - window.scrollY) + "px)";
	if(fadeOut) clonedPiece.style.opacity = 0;
	clonedPiece.addEventListener("transitionend", () => {
		clonedPiece.remove();
		if(typeof callback == "function") callback(pieceToMove); 
	}, { once: true });
}

function completeCheck() {
	//パズルが完成したか確認する。
	const puzzlePieceArea = document.getElementById("puzzle_piece_area");
	if(puzzlePieceArea.children.length == Number(/\d+/.exec(puzzlePieceArea.style.gridTemplateColumns)) * Number(/\d+/.exec(puzzlePieceArea.style.gridTemplateRows))) {
		if(!Array.prototype.slice.call(puzzlePieceArea.children).find((piece) => Number(/\d+/.exec(piece.style.gridColumn)) - 1 != piece.getAttribute("data-piece-column") || Number(/\d+/.exec(piece.style.gridRow)) - 1 != piece.getAttribute("data-piece-row"))) {
			const puzzleDivideCanvas = document.getElementById("puzzle_divide_canvas");
			const popupDisplay = document.getElementById("popup_display_text");
			const pieceSelectArea = document.getElementById("piece_select_area");
			gameTimer.stopTimer();
			puzzlePieceArea.removeEventListener("click", puzzlePieceAreaEvent);
			document.getElementById("puzzle_image").classList.add("puzzle_frame");
			puzzleDivideCanvas.classList.remove("puzzle_frame");		
			document.getElementById("puzzle_image").classList.remove("hidden");
			fadeOutElement(document.getElementById("pause_button"), 0.3);
			while(puzzlePieceArea.firstElementChild) puzzlePieceArea.firstElementChild.remove();
			pieceSelectArea.classList.add("piece_select_area_slide_out");
			sound.play("puzzleComplete");
			music.setVolume(music.volume / 2);	
			pieceSelectArea.addEventListener("transitionend", () => {
				pieceSelectArea.classList.add("hidden");
				pieceSelectArea.classList.remove("piece_select_area_slide_out");
			}, { once: true });
			fadeOutElement(puzzleDivideCanvas, 1.5, () => {
				popupDisplay.innerText = "PUZZLE COMPLETE!";
				popupDisplay.classList.add("popup_display_animation");
				popupDisplay.addEventListener("animationend", () => {
					popupDisplay.classList.remove("popup_display_animation");
					popupDisplay.innerText = "";
					document.getElementById("end_menu").classList.remove("hidden");
					music.setVolume(music.volume * 2);			
				}, { once: true });	
			});
		}
	}
}

function syncVolumeBar() {
	//ボリュームバーの実際の音量に合わせる。
	Array.prototype.slice.call(document.getElementsByClassName("music_volume")).forEach((element) => element.value = music.volume);
	Array.prototype.slice.call(document.getElementsByClassName("sound_volume")).forEach((element) => element.value = sound.volume);
}

function pause() {
	//ゲームを一時停止する。
	const pieceSelectArea = document.getElementById("piece_select_area");
	const pauseMenu = document.getElementById("pause_menu");
	if(gameTimer.isTimerCounting) {
		gameTimer.stopTimer();
		syncVolumeBar();
		if (selectedPiece) {
			selectedPiece.classList.remove("piece_selecting");
			selectedPiece = null;
		}
		pieceSelectArea.classList.add("piece_select_area_slide_out");
		pauseMenu.classList.remove("hidden");
		pieceSelectArea.addEventListener("transitionend", () => {
			pieceSelectArea.classList.add("hidden");
			pieceSelectArea.classList.remove("piece_select_area_slide_out");
		}, { once: true });
	}
	else {
		gameTimer.startTimer();
		pieceSelectArea.classList.add("piece_select_area_slide_in");
		pieceSelectArea.classList.remove("hidden");
		pieceSelectArea.addEventListener("animationend", () => pauseMenu.classList.add("hidden"), { once: true });
	}
}

function newGame() {
	//現在のゲームを放棄し、メインメニューに戻る
	const puzzleImage = document.getElementById("puzzle_image");
	const puzzleDivideCanvas = document.getElementById("puzzle_divide_canvas");
	const puzzlePieceArea = document.getElementById("puzzle_piece_area");
	const pieceSelectArea = document.getElementById("piece_select_area");
	const pauseMenu = document.getElementById("pause_button");
	puzzlePieceArea.removeEventListener("click", puzzlePieceAreaEvent);
	while(pieceSelectArea.firstElementChild) pieceSelectArea.firstElementChild.remove();
	syncVolumeBar();
	pieceSelectArea.classList.add("piece_select_area_slide_in");
	pieceSelectArea.classList.remove("hidden");
	pieceSelectArea.addEventListener("animationend", () => {
		pieceSelectArea.classList.remove("piece_select_area_slide_in");
		document.getElementById("pause_menu").classList.add("hidden");
		document.getElementById("end_menu").classList.add("hidden");
		document.getElementById("main_menu").classList.remove("hidden");
		document.getElementById("game_timer_area").classList.add("hidden");
		document.getElementById("puzzle_column_division").disabled = false;
		document.getElementById("puzzle_row_division").disabled = false;
		document.getElementById("start").classList.remove("button_disabled");
		document.getElementById("puzzle_area").classList.add("puzzle_area_image_select");
		puzzleDivideCanvas.classList.add("puzzle_frame");
		puzzleDivideCanvas.classList.remove("hidden");
		puzzleImage.classList.remove("puzzle_frame");		
		puzzleImage.classList.remove("hidden");
		while(puzzlePieceArea.firstElementChild) puzzlePieceArea.firstElementChild.remove();
		if(!pauseMenu.classList.contains("hidden")) fadeOutElement(pauseMenu, 0.3);
		swapClass(document.body, "background_green", "background_blue");
		swapClass(document.getElementById("header"), "header_green", "header_blue");
		document.body.addEventListener("transitionend", () => {
			pieceSelectArea.classList.add("piece_select_area_slide_out");
			pieceSelectArea.addEventListener("transitionend", () => {
				pieceSelectArea.classList.remove("piece_select_area_slide_out");
				pieceSelectArea.classList.add("hidden");
			}, { once: true });
		}, { once: true });
	}, { once: true });
}

function playMusic(element) {
	music.setVolume(element.value);
	if(!musicFlag) {
		music.playLoop("main");
		musicFlag = true;
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
Array.prototype.slice.call(document.getElementsByClassName("button")).forEach((element) => {
	if(element.id != "start") element.addEventListener("click", () => sound.play("buttonPush"));
});
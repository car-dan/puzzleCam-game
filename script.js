let VIDEO = null;
let CANVAS = null;
let CONTEXT = null;
let SCALER = 0.6;
let SIZE = { x: 0, y: 0, width: 0, height: 0, rows: 3, columns: 3 };
let PIECES = [];
let SELECTED_PIECE = null;
let START_TIME = null;
let END_TIME = null;

let POP_SOUND = new Audio("sound.mp3");
POP_SOUND.volume = 0.1;

let AUDIO_CONTEXT = new (AudioContext ||
	wbekitAudioContext ||
	window.webkitAudioContext)();

let keys = {
	DO: 261.6,
	RE: 293.7,
	MI: 329.6,
};

function main() {
	CANVAS = document.getElementById("myCanvas");
	CONTEXT = CANVAS.getContext("2d");
	addEventListeners();

	let promise = navigator.mediaDevices.getUserMedia({
		video: true,
	});
	promise
		.then(function (signal) {
			VIDEO = document.createElement("video");
			VIDEO.srcObject = signal;
			VIDEO.play();

			VIDEO.onloadeddata = function () {
				handleResize();
				//window.addEventListener('resize',handleResize);
				initializePieces(SIZE.rows, SIZE.columns);
				updateGame();
			};
		})
		.catch(function (err) {
			alert("Camera error: " + err);
		});
}

function setDifficulty() {
	let diff = document.getElementById("difficulty").value;
	switch (diff) {
		case "easy":
			initializePieces(3, 3);
			break;
		case "medium":
			initializePieces(5, 5);
			break;
		case "hard":
			initializePieces(10, 10);
			break;
		case "insane":
			initializePieces(40, 25);
			break;
	}
}

function restart() {
	START_TIME = new Date().getTime();
	END_TIME = null;
	randomizePieces();
	document.getElementById("menuItems").style.display = "none";
}

function updateTime() {
	let now = new Date().getTime();
	if (START_TIME != null) {
		if (END_TIME != null) {
			document.getElementById("time").innerHTML = formatTime(
				END_TIME - START_TIME
			);
		} else {
			document.getElementById("time").innerHTML = formatTime(now - START_TIME);
		}
	}
}

function isComplete() {
	for (let i = 0; i < PIECES.length; i++) {
		if (PIECES[i].correct == false) {
			return false;
		}
	}
	return true;
}

function formatTime(milliseconds) {
	let seconds = Math.floor(milliseconds / 1000);
	let s = Math.floor(seconds % 60);
	let m = Math.floor((seconds % (60 * 60)) / 60);
	let h = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));

	let formattedTime = h.toString().padStart(2, "0");
	formattedTime += ":";
	formattedTime += m.toString().padStart(2, "0");
	formattedTime += ":";
	formattedTime += s.toString().padStart(2, "0");

	return formattedTime;
}

function addEventListeners() {
	CANVAS.addEventListener("mousedown", onMouseDown);
	CANVAS.addEventListener("mousemove", onMouseMove);
	CANVAS.addEventListener("mouseup", onMouseUp);
	CANVAS.addEventListener("touchstart", onTouchStart);
	CANVAS.addEventListener("touchmove", onTouchMove);
	CANVAS.addEventListener("touchend", onTouchEnd);
}

function onTouchStart(evt) {
	let loc = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
	onMouseDown(loc);
}
function onTouchMove(evt) {
	let loc = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
	onMouseMove(loc);
}
function onTouchEnd() {
	onMouseUp();
}

function onMouseDown(evt) {
	SELECTED_PIECE = getPressedPiece(evt);
	if (SELECTED_PIECE != null) {
		const index = PIECES.indexOf(SELECTED_PIECE);
		if (index > -1) {
			PIECES.splice(index, 1);
			PIECES.push(SELECTED_PIECE);
		}
		SELECTED_PIECE.offset = {
			x: evt.x - SELECTED_PIECE.x,
			y: evt.y - SELECTED_PIECE.y,
		};
		SELECTED_PIECE.correct = false;
	}
}

function onMouseMove(evt) {
	if (SELECTED_PIECE != null) {
		SELECTED_PIECE.x = evt.x - SELECTED_PIECE.offset.x;
		SELECTED_PIECE.y = evt.y - SELECTED_PIECE.offset.y;
	}
}

function onMouseUp() {
	if (SELECTED_PIECE.isClose()) {
		SELECTED_PIECE.snap();
		if (isComplete() && END_TIME == null) {
			let now = new Date().getTime();
			END_TIME = now;
			setTimeout(playMelody, 500);
			showEndScreen();
		}
	}
	SELECTED_PIECE = null;
}

function getPressedPiece(loc) {
	for (let i = PIECES.length - 1; i >= 0; i--) {
		if (
			loc.x > PIECES[i].x &&
			loc.x < PIECES[i].x + PIECES[i].width &&
			loc.y > PIECES[i].y &&
			loc.y < PIECES[i].y + PIECES[i].height
		) {
			return PIECES[i];
		}
	}
	return null;
}

function handleResize() {
	CANVAS.width = window.innerWidth;
	CANVAS.height = window.innerHeight;

	let resizer =
		SCALER *
		Math.min(
			window.innerWidth / VIDEO.videoWidth,
			window.innerHeight / VIDEO.videoHeight
		);
	SIZE.width = resizer * VIDEO.videoWidth;
	SIZE.height = resizer * VIDEO.videoHeight;
	SIZE.x = window.innerWidth / 2 - SIZE.width / 2;
	SIZE.y = window.innerHeight / 2 - SIZE.height / 2;
}

function updateGame() {
	CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);

	CONTEXT.globalAlpha = 0.5;
	CONTEXT.drawImage(VIDEO, SIZE.x, SIZE.y, SIZE.width, SIZE.height);
	CONTEXT.globalAlpha = 1;

	for (let i = 0; i < PIECES.length; i++) {
		PIECES[i].draw(CONTEXT);
	}

	updateTime();
	window.requestAnimationFrame(updateGame);
}

function initializePieces(rows, cols) {
	SIZE.rows = rows;
	SIZE.columns = cols;

	PIECES = [];
	for (let i = 0; i < SIZE.rows; i++) {
		for (let j = 0; j < SIZE.columns; j++) {
			PIECES.push(new Piece(i, j));
		}
	}
}

function randomizePieces() {
	for (let i = 0; i < PIECES.length; i++) {
		let loc = {
			x: Math.random() * (CANVAS.width - PIECES[i].width),
			y: Math.random() * (CANVAS.height - PIECES[i].height),
		};
		PIECES[i].x = loc.x;
		PIECES[i].y = loc.y;
		PIECES[i].correct = false;
	}
}

class Piece {
	constructor(rowIndex, colIndex) {
		this.rowIndex = rowIndex;
		this.colIndex = colIndex;
		this.x = SIZE.x + (SIZE.width * this.colIndex) / SIZE.columns;
		this.y = SIZE.y + (SIZE.height * this.rowIndex) / SIZE.rows;
		this.width = SIZE.width / SIZE.columns;
		this.height = SIZE.height / SIZE.rows;
		this.xCorrect = this.x;
		this.yCorrect = this.y;
		this.correct = true;
	}
	draw(context) {
		context.beginPath();

		context.drawImage(
			VIDEO,
			(this.colIndex * VIDEO.videoWidth) / SIZE.columns,
			(this.rowIndex * VIDEO.videoHeight) / SIZE.rows,
			VIDEO.videoWidth / SIZE.columns,
			VIDEO.videoHeight / SIZE.rows,
			this.x,
			this.y,
			this.width,
			this.height
		);

		context.rect(this.x, this.y, this.width, this.height);
		context.stroke();
	}
	isClose() {
		if (
			distance(
				{ x: this.x, y: this.y },
				{ x: this.xCorrect, y: this.yCorrect }
			) <
			this.width / 3
		) {
			return true;
		}
		return false;
	}
	snap() {
		this.x = this.xCorrect;
		this.y = this.yCorrect;
		this.correct = true;
		POP_SOUND.play();
	}
}

function distance(p1, p2) {
	return Math.sqrt(
		(p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
	);
}

function playNote(key, duration) {
	let osc = AUDIO_CONTEXT.createOscillator();
	osc.frequency.value = key;
	osc.start(AUDIO_CONTEXT.currentTime);
	osc.stop(AUDIO_CONTEXT.currentTime + duration / 1000);

	let envelope = AUDIO_CONTEXT.createGain();
	osc.connect(envelope);
	osc.type = "triangle";
	envelope.connect(AUDIO_CONTEXT.destination);
	envelope.gain.setValueAtTime(0, AUDIO_CONTEXT.currentTime);
	envelope.gain.linearRampToValueAtTime(0.5, AUDIO_CONTEXT.currentTime + 0.1);
	envelope.gain.linearRampToValueAtTime(
		0,
		AUDIO_CONTEXT.currentTime + duration / 1000
	);

	setTimeout(function () {
		osc.disconnect();
	}, duration);
}

function playMelody() {
	playNote(keys.DO, 300);
	setTimeout(function () {
		playNote(keys.RE, 300);
	}, 300);
	setTimeout(function () {
		playNote(keys.MI, 300);
	}, 600);
}

function showEndScreen() {
	const time = END_TIME - START_TIME;
	document.querySelector("#scoreValue").innerHTML = "Score: " + time;
	document.querySelector("#endScreen").style.display = "block";
}

function showMenu() {
	document.querySelector("#endScreen").style.display = "none";
	document.querySelector("#menuItems").style.display = "block";
}

function showScores() {
	document.querySelector("#endScreen").style.display = "none";
	document.querySelector("#scoresScreen").style.display = "block";
	document.querySelector("#scoresContainer").innerHTML = "Loading....";
	getScores();
}

function getScores() {
	fetch("server.php").then(function (response) {
		response.json().then(function (data) {
			console.log(data);
			// document.querySelector("#scoresContainer").innerHTML = formatScores(data);
		});
	});
}

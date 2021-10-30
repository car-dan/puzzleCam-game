let VIDEO = null;
let CANVAS = null;
let CONTEXT = null;
// let SCALER = 1;
// let SIZE = { x: 0, y: 0, width: 0, heigth: 0 };



function main() {
    console.log("main")
    CANVAS = document.querySelector(".myCanvas");
    CONTEXT = CANVAS.getContext("2d");
    CANVAS.width = window.innerWidth;
    CANVAS.heigth = window.innerHeight;

    console.log(CANVAS.width);
    console.log(CANVAS.heigth);

    let promise = navigator.mediaDevices.getUserMedia({ video: true });
    promise.then(function (signal) {
        VIDEO = document.createElement("video");
        VIDEO.srcObject = signal;
        VIDEO.play();

        VIDEO.onloadeddata = function () {
            // let resizer = SCALER *
            //     Math.min(
            //         window.innerWidth / VIDEO.videoWidth,
            //         window.innerHeight / VIDEO.videoHeight
            //     );
           // SIZE.width = resizer * VIDEO.videoWidth;
            //SIZE.heigth = resizer * VIDEO.videoHeight;
            //SIZE.x = window.innerWidth / 2 - SIZE.width / 2;
            //SIZE.y = window.innerHeight / 2 - SIZE.heigth / 2;
            updateCanvas();
        }
        
    })
        .catch(function (err) {
        alert("Camera error: " + err);
    });
}

function updateCanvas() {
    CONTEXT.drawImage(VIDEO, 0,0);
    window.requestAnimationFrame(updateCanvas);
}
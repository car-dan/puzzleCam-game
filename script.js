let video = null;
let canvas = null;
let context = null; 



function main() {
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.heigth = window.innerHeight;

    let promise = navigator.mediaDevices.getUserMedia({ vide: true });
    promise.then(function (signal) {
        video = document.createElement("video");
        video.srcObject = signal;
        video.play();

        video.onloadeddata = function () {
            updateCanvas();
        }
        
    })
        .catch(function (err) {
        alert("Camera error: " + err);
    });
}

function updateCanvas() {
    context.drawImage(video, 0, 0);
    window.requestAnimationFrame(updateCanvas);
}
/**
 * Created by Fabian on 29.06.2015.
 */

function init() {
    var canvas = document.getElementById("canvas_1");
    var width = window.innerWidth;

    var height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 10;
            ctx.strokeRect(0,0,canvas.width, canvas.height);
        }
    }
    canvas.addEventListener("mousedown", doTouchStart, false);
    canvas.addEventListener("touchstart", doTouchStart, false);
}

function doTouchStart(event) {
    event.preventDefault();

    var canvas_x1, canvas_y1, canvas_x2, canvas_y2;
    if (event.targetTouches === undefined) {
        canvas_x1 = event.screenX;
        canvas_y1 = event.screenY;
    } else if (event.targetTouches.length == 1) {
        canvas_x1 = event.targetTouches[0].pageX;
        canvas_y1 = event.targetTouches[0].pageY;
    } else if (event.targetTouches.length == 2) {
        canvas_x1 = event.targetTouches[0].pageX;
        canvas_y1 = event.targetTouches[0].pageY;

        canvas_x2 = event.targetTouches[1].pageX;
        canvas_y2 = event.targetTouches[1].pageY;
    }

    var canvas = document.getElementById("canvas_1");
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 10;
            ctx.strokeRect(0,0,canvas.width, canvas.height);
            ctx.font="30px Verdana";
            ctx.fillStyle = "#000000";
            ctx.fillText("X= " + canvas_x1,10,50);
            ctx.fillText("Y= " + canvas_y1,10,90);
            ctx.fillText("X= " + canvas_x2,20,200);
            ctx.fillText("Y= " + canvas_y2,20,240);
        }
    }
}
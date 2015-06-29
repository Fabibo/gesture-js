/**
 * Created by Fabian on 29.06.2015.
 */
function init() {
    var canvas = document.getElementById("canvas_1");
    canvas.addEventListener("mousedown", doTouchStart, false);
}

function doTouchStart(event) {
    event.preventDefault();

    var canvas_x, canvas_y;
    if (event.targetTouches === undefined) {
        canvas_x = event.screenX;
        canvas_y = event.screenY;
    } else {
        canvas_x = event.targetTouches[0].pageX;
        canvas_y = event.targetTouches[0].pageY;
    }

    alert("X=" + canvas_x + " Y=" + canvas_y);
    //alert("List Size: event.targetTouches");
}
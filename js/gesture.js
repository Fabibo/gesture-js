/**
 * Created by Fabian on 29.06.2015.
 *
 * Angelehnt an Beispiel von: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
 */

var ongoingTouches = new Array();
var resultProtonString = "";
var lastItem = "";

var MOVE_DIFFERENCE = 40;

/**
 * Set Size of Canvas.
 * Init the Listeners on the Canvas.
 */
function startup() {
    var canvas = document.getElementsByTagName("canvas")[0];
    var width = window.innerWidth;
    var height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    canvas.addEventListener("touchstart", handleStart, false);
    canvas.addEventListener("touchend", handleEnd, false);
    canvas.addEventListener("touchcancel", handleCancel, false);
    canvas.addEventListener("touchleave", handleEnd, false);
    canvas.addEventListener("touchmove", handleMove, false);
}

function handleStart(evt) {
    evt.preventDefault();

    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");

    var onlyNull = true;
    for (var i = 0; i < ongoingTouches.length; i++) {
        if (ongoingTouches[i].identifier != -1) {
            onlyNull = false;
        }
    }
    if (onlyNull) {
        ongoingTouches = new Array();
        resultProtonString = "";
        lastItem = "";
        printStringOnCanvas(resultProtonString);
    }

    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));

        var downToAdd = " D"+ (ongoingTouches.length-1);
        lastItem = downToAdd;
        resultProtonString = resultProtonString + " D"+ (ongoingTouches.length-1);
        printStringOnCanvas(resultProtonString);

        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fill();
    }
}

function handleMove(evt) {
    evt.preventDefault();
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {

            if ( touches[i].pageX > ongoingTouches[idx].pageX + MOVE_DIFFERENCE ||
                 touches[i].pageX < ongoingTouches[idx].pageX - MOVE_DIFFERENCE ||
                 touches[i].pageY > ongoingTouches[idx].pageY + MOVE_DIFFERENCE ||
                 touches[i].pageY < ongoingTouches[idx].pageY - MOVE_DIFFERENCE) {

                var stringToAdd = " M" + idx;

                if (lastItem == stringToAdd) {
                    resultProtonString = resultProtonString + "*";
                    lastItem = stringToAdd + "*";
                }
                else if (lastItem == (stringToAdd + "*")) {
                }
                else {
                    resultProtonString = resultProtonString + " M" + idx;
                    lastItem = stringToAdd;
                }
                printStringOnCanvas(resultProtonString);

                ctx.beginPath();
                ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                ctx.lineTo(touches[i].pageX, touches[i].pageY);
                ctx.lineWidth = 4;
                ctx.stroke();

                ongoingTouches[idx].identifier = touches[i].identifier;
                ongoingTouches[idx].pageX = touches[i].pageX;
                ongoingTouches[idx].pageY = touches[i].pageY;
            }
        }
    }
}

function handleEnd(evt) {
    evt.preventDefault();
    var el = document.getElementsByTagName("canvas")[0];
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            resultProtonString = resultProtonString + " U" + idx;
            lastItem = " U" + idx;
            printStringOnCanvas(resultProtonString);

            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);  // and a square at the end

            ongoingTouches[idx].identifier = -1;
        }
    }
}

function handleCancel(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches[idx] = -1;
    }
}

function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}


function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;

        if (id == idToFind) {
            return i;
        }
    }
    return -1;    // not found
}

function printStringOnCanvas(string) {
    var canvas = document.getElementsByTagName("canvas")[0];
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font="30px Verdana";
            ctx.fillStyle = "#000000";
            ctx.fillText(string ,10,50);
        }
    }
}
/**
 * Created by Fabian on 29.06.2015.
 *
 * Canvas drawing code based on: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
 */

/*
 * Settings:
 */
var MOVE_DIFFERENCE = 40; // in px, minimum Way needed to move to recognice the Movement.
var USE_MOVE_SIMPLIFY = false; // boolean, turn on function which simplifies the Movement Output.

/*
 *  Internal used variables.
 *
 *  DO NOT CHANGE!
 */
var ongoingTouches = new Array();
var resultProtonString = "";
var lastItem = "";

var canvas;
var outputDiv;

/**
 * Set Size of Canvas.
 * Init the Listeners on the Canvas.
 */
function startup() {
	// Adjust canvas size to match window size
	canvas = document.getElementsByTagName("canvas")[0];
	outputDiv = document.getElementById("output");
    var width = window.innerWidth;
    var height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
	// Register canvas for event listeners enable the canvas to react to finger touches and movements
    canvas.addEventListener("touchstart", handleStart, false);
    canvas.addEventListener("touchend", handleEnd, false);
    canvas.addEventListener("touchcancel", handleCancel, false);
    canvas.addEventListener("touchleave", handleEnd, false);
    canvas.addEventListener("touchmove", handleMove, false);
}

function handleStart(evt) {
    evt.preventDefault();
    var ctx = canvas.getContext("2d");

	// Elements in the ongoingTouches array will become invalid, once the according finger has been lifted from the surface (see below)
	// Use this knowledge to clear the output div once a "new session" (= finger(s) begin touch down again) has been started
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        printStringToOutputDiv(resultProtonString);
    }

	// Determine which touch points had contributed to this touch down event
    var touches = evt.changedTouches;
	// Loop over all touch points (= fingers involved into this event)
    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouches.push(copyTouch(touches[i]));
		// Prepare expression-encoded output of recognized touch down event
        var downToAdd = " D<sub>"+ (ongoingTouches.length-1) + "</sub>";
        lastItem = downToAdd;
        resultProtonString = resultProtonString + " D<sub>"+ (ongoingTouches.length-1) + "</sub>";
        printStringToOutputDiv(resultProtonString);
		// Draw a circle at the starting point (touch down point)
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 8, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function handleMove(evt) {
    evt.preventDefault();
    var ctx = canvas.getContext("2d");
    
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {

            if ( touches[i].pageX > ongoingTouches[idx].pageX + MOVE_DIFFERENCE ||
                 touches[i].pageX < ongoingTouches[idx].pageX - MOVE_DIFFERENCE ||
                 touches[i].pageY > ongoingTouches[idx].pageY + MOVE_DIFFERENCE ||
                 touches[i].pageY < ongoingTouches[idx].pageY - MOVE_DIFFERENCE) {

				// Prepare expression-encoded output of recognized movement event
                var stringToAdd = " M<sub>" + idx + "</sub>";

				// Check and register ongoing movements
                if (lastItem == stringToAdd) {
                    resultProtonString = resultProtonString + "*";
                    lastItem = stringToAdd + "*";
                }
                else if (lastItem == (stringToAdd + "*")) {
	                // Nothing to do
                }
                else {
                    resultProtonString = resultProtonString + " M<sub>" + idx + "</sub>";
                    lastItem = stringToAdd;
                }
                printStringToOutputDiv(resultProtonString);

				// Draw visualization of this movement event
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
    
    simplifyExpression();
}

function handleEnd(evt) {
    evt.preventDefault();
    var ctx = canvas.getContext("2d");
    
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            resultProtonString = resultProtonString + " U<sub>" + idx + "</sub>";
            lastItem = " U<sub>" + idx + "</sub>";
            printStringToOutputDiv(resultProtonString);
			// Draw a square at the ending point (touch up point)
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 15, 15);
            ctx.stroke();
			// Mark touch element as invalid to allow handleStart function to clear up the output
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

function printStringToOutputDiv(string) {
	outputDiv.innerHTML = string;
}

function simplifyExpression() {
    if (USE_MOVE_SIMPLIFY) {
        var regex = /((M<sub>([0-9])<\/sub>\sM<sub>([0-9])<\/sub>\s)|(\(.*\)\*)){1,}/g, result, indices = [];
        while ((result = regex.exec(resultProtonString))) {
            indices.push([result.index, result[0].length]);
        }

        for (c = 0; c < indices.length; c++) {
            var newString = "(";
            for (var i = 0; i < 10; i++) {
                var substring = resultProtonString.substring(indices[c][0], indices[c][1]);
                var count = (substring.match(new RegExp(i, 'g')) || []).length;
                if (count > 0) newString = newString + "M<sub>" + i + "</sub> | ";
            }
            newString = newString.substring(0, newString.length - 3) + ")* ";

            var prev = (c == 0) ? 0 : (c - 1);
            var next = (c == indices.length - 1) ? (resultProtonString.length + 1) : (c + 1);

            if (newString.length > 3) resultProtonString = resultProtonString.substring(prev, indices[c][0]) + newString + resultProtonString.substring(indices[c][0] + indices[c][1], next);
        }

        printStringToOutputDiv(resultProtonString);
    }
}
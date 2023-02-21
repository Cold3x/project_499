// helper functions to display gaze information and dot in browser.
import h337 from 'heatmap.js'

let gazeData = []

// show gaze information on screen.
function showGazeInfoOnDom(gazeInfo) {
  let gazeInfoDiv = document.getElementById("gazeInfo");
  gazeInfoDiv.innerText = `Gaze Information Below
                           \nx: ${gazeInfo.x}
                           \ny: ${gazeInfo.y}
                           `;
}

// show gaze dot on screen.
function showGazeDotOnDom(gazeInfo) {
  let canvas = document.getElementById("output");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF0000";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
  ctx.fill();
}


function hideUi() {
  document.getElementById("gazeheader").style.display = "none";
  document.getElementById("gazeInfo").style.display = "none";
  document.getElementById("calibrationButton").style.display = "none";
}

function showGaze(gazeInfo) {
  hideUi();
  showGazeInfoOnDom(gazeInfo);
//   showGazeDotOnDom(gazeInfo);
}

export default showGaze;
// helper functions to display gaze information and dot in browser.

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
  let canvas = document.getElementById("heatMap");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF0000";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
  ctx.fill();
}


function changeDOM() {
  // document.getElementById("gazeheader").style.display = "none";
  // document.getElementById("calibrationButton").style.display = "none";
  // document.getElementById("detail").style.display = "none";
  document.getElementById("heatMap").style.display = "block";
  document.getElementById("finBtn").style.display = "block";
  
}

function showGaze() {
  changeDOM();
  // showGazeDotOnDom(gazeInfo);
  // showGazeInfoOnDom(gazeInfo);
}

export default showGaze;
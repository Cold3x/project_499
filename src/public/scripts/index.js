import { create } from "heatmap.js";
import "regenerator-runtime/runtime";
import EasySeeSo from "seeso/easy-seeso";
import showGaze from "../showGaze";
import h337 from "heatmap.js";
import "html2canvas";
import html2canvas from "html2canvas";

const licenseKey = "dev_jtbhyyx8sw8v5xp64hftj9lqvs0t0pbw9smwopak";
const dataset = [];

var heatmapInstance = h337.create({
  container: document.getElementById("heatMap"),
  gradient: {
    ".25": "blue",
    ".5": "green",
    ".75": "yellow",
    ".9": "red",
  },
});

function createHeatmap(gazeInfo) {
  // console.log(gazeInfo);
  heatmapInstance.setDataMax(100);
  if (gazeInfo.trackingState < 2 && gazeInfo.eyemovementState < 3) {
    dataset.push({
      x: gazeInfo.x,
      y: gazeInfo.y,
      value: 25,
    });
  }
}
function createHM(gazeInfo) {
  heatmapInstance.setDataMax(100);
  if(gazeInfo.trackingState === 0 && gazeInfo.eyemovementState != 3){
    console.log(gazeInfo);
    heatmapInstance.addData({
      x: gazeInfo.x,
      y: gazeInfo.y,
      value: 25,
    });
  }
  // heatmapInstance.addData({
  //   x: gazeInfo.x,
  //   y: gazeInfo.y,
  //   value: 25,
  // });
}

function onClickCalibrationBtn() {
  const userId = "YOUR_USER_ID";
  // Next Page after calibration
  // const redirectUrl = "https://project-eyetrack.onrender.com";
  const redirectUrl = "http://localhost:8082/";
  const calibrationPoint = 5;
  EasySeeSo.openCalibrationPage(
    licenseKey,
    userId,
    redirectUrl,
    calibrationPoint
  );
  
}

function onClickFinishBtn() {
  console.log(dataset);
  heatmapInstance.setData({
    max: 100,
    min: 10,
    data: dataset,
  });
  // Show Btn
  document.getElementById("finBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "block";
  document.getElementById("compBtn").style.display = "block";
}

function onClickSave() {
  let screenshot = document.getElementById("heatMap");
  html2canvas(screenshot).then((canvas) => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download =
      "heatmap_" + new Date().toJSON().slice(0, 10) + "_screenshot.jpg";
    a.click();
  });
}
function onClickComp() {
  document.getElementById("instruction").style.display = "contents";
  location.href = "../";
}

// in redirected page
function parseCalibrationDataInQueryString() {
  const href = window.location.href;
  const decodedURI = decodeURI(href);
  const queryString = decodedURI.split("?")[1];
  if (!queryString) return undefined;
  const jsonString = queryString.slice(
    "calibrationData=".length,
    queryString.length
  );
  return jsonString;
}

// gaze callback.
function onGaze(gazeInfo) {
  // do something with gaze info.
  createHM(gazeInfo);
  createHeatmap(gazeInfo);
}

// debug callback.
function onDebug(FPS, latency_min, latency_max, latency_avg) {
  // do something with debug info.
}

async function main() {
  const calibrationData = parseCalibrationDataInQueryString();
  if (calibrationData) {
    showGaze();
    const seeSo = new EasySeeSo();
    await seeSo.init(
      licenseKey,
      async () => {
        await seeSo.setCalibrationData(calibrationData);
        await seeSo.startTracking(onGaze, onDebug);
      }, // callback when init succeeded.
      () => console.log("callback when init failed.") // callback when init failed.
    );
    const finButton = document.getElementById("finBtn");
    finButton.addEventListener("click", () => {
      console.log("stop tracking");
      onClickFinishBtn();
      seeSo.stopTracking();
    });
  } else {
    console.log("No calibration data given.");
    const calibrationButton = document.getElementById("calibrationButton");
    calibrationButton.addEventListener("click", onClickCalibrationBtn);
  }
  const saveButton = document.getElementById("saveBtn");
  saveButton.addEventListener("click", onClickSave);

  const compButton = document.getElementById("compBtn");
  compButton.addEventListener("click", onClickComp);
}

(async () => {
  await main();
})();


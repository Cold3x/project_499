import { create } from "heatmap.js";
import "regenerator-runtime/runtime";
import EasySeeSo from "seeso/easy-seeso";
import showGaze from "../showGaze";
import h337 from "heatmap.js";

const licenseKey = "dev_fbpjqcqmqji0bq6asinisgv2tzv6ybwaikbnzlw4";

var heatmapInstance = h337.create({
  container: document.getElementById("heatMap"),
});

function createHeatmap(gazeInfo) {
  console.log(gazeInfo);
  if (gazeInfo.x != NaN && gazeInfo.y != NaN && gazeInfo.x <= 1000 && gazeInfo.y <= 1000) {
    heatmapInstance.addData(
      {
        x: gazeInfo.x,
        y: gazeInfo.y,
        value: 1
      }
    )
  }
}

function onClickCalibrationBtn() {
  const userId = "YOUR_USER_ID";
  // Next Page after calibration
  const redirectUrl = "http://localhost:8082";
  const calibrationPoint = 1;
  EasySeeSo.openCalibrationPage(
    licenseKey,
    userId,
    redirectUrl,
    calibrationPoint
  );
}

function onClickNextBtn() {
  // location.href = 'eval.html'
  // createHeatmap();
  // hideImage()
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
  showGaze(gazeInfo);
  createHeatmap(gazeInfo);
}

// debug callback.
function onDebug(FPS, latency_min, latency_max, latency_avg) {
  // do something with debug info.
}

async function main() {
  const calibrationData = parseCalibrationDataInQueryString();

  if (calibrationData) {
    const seeSo = new EasySeeSo();
    await seeSo.init(
      licenseKey,
      async () => {
        await seeSo.startTracking(onGaze, onDebug);
        await seeSo.setCalibrationData(calibrationData);
      }, // callback when init succeeded.
      () => console.log("callback when init failed.") // callback when init failed.
    );
    const nextButton = document.getElementById("nextButton");
    nextButton.addEventListener("click", onClickNextBtn);
  } else {
    console.log("No calibration data given.");
    const calibrationButton = document.getElementById("calibrationButton");
    calibrationButton.addEventListener("click", onClickCalibrationBtn);
  }
}

(async () => {
  await main();
})();

function onClickNextBtn() {
  // do some thing
  location.href = 'eval.html'
    console.log("click!");
}

const nextButton = document.getElementById("nextButton");
nextButton.addEventListener("click", onClickNextBtn);

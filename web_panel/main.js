document.addEventListener("DOMContentLoaded", function () {
  let paraForm = document.getElementById("paraForm");
  let refreshBTN = document.getElementById("btn-reset");

  paraForm.addEventListener("submit", (e) => {
    let minDis = document.getElementById("inputMinDis").value;
    let maxDis = document.getElementById("inputMaxDis").value;
    let offset = document.getElementById("inputOffset").value;
    if (minDis.value == "" || maxDis.value == "" || offset.value == "") {
      alert("Form Error!!")
    } else {

      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/slider?value=" + minDis + "&maxdis=" + maxDis + "&offset=" + offset, true);
      xhr.send();
      var delayInMilliseconds = 2000; //1 second

      setTimeout(function() {
        refreshBTN.click();
      }, delayInMilliseconds);


    }

  });


  refreshBTN.addEventListener("onClick",(e)=>{
    location.reload();
  });



});
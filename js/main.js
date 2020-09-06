const input = document.querySelectorAll("input");

function focusFunc() {
  let parent = this.parentNode.parentNode;
  parent.classList.add("focus");
}

function blurFunc() {
  let parent = this.parentNode.parentNode;
  if (this.value == "") {
    parent.classList.remove("focus");
  }
}

input.forEach((input) => {
  input.addEventListener("focus", focusFunc);
  input.addEventListener("blur", blurFunc);
});

// index.pug
function searchData() {
  var input = document.getElementById("input");
  var saring = input.value.toUpperCase();
  var tbody = document.getElementsByTagName("tbody")[0];
  var tr = tbody.getElementsByTagName("tr");
  var status, td, i, j;

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td");
    for (j = 0; j < td.length; j++) {
      if (td[j].innerHTML.toUpperCase().indexOf(saring) > -1) {
        status = true;
      }
    }
    if (status) {
      tr[i].style.display = "";
      status = false;
    } else {
      tr[i].style.display = "none";
    }
  }
}

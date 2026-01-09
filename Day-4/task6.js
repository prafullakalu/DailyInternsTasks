 function checkFile() {
      let fileInput = document.getElementById("myfile");
      let result = document.getElementById("result");
      let file = fileInput.files[0];
      if (!file) {
        alert("No file selected");
        result.innerHTML = "No file selected";
        return false;
      }
      let allowedTypes = [
        "application/vnd.ms-excel", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ];
      if (allowedTypes.includes(file.type)) {
        result.innerHTML = "File is Excel";
      } else {
        alert("File is not Excel!");
        result.innerHTML = "Only Excel files are allowed";
        return false;
      }
      return false; 
    }
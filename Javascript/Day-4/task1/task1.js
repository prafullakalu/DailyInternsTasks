$(document).ready(function(){

  function getEmptyRow(){
    return {
      projectName:"",
      timeLogDate:"",
      phase:"",
      status:"",
      loggedHours:"",
      billableHours:"",
      notes:"",
      outOfStock:false,
      bcLink:"",
      bcDescription:""
    };
  }

 
  function validateRow(row, index){
    if(!row.projectName || !row.timeLogDate || !row.phase || !row.status ||
       row.loggedHours === "" || row.billableHours === "" ||
       !row.notes || !row.bcLink || !row.bcDescription){
      return `Row ${index+1}: All fields must be filled`;
    }
    if(Number(row.billableHours) > Number(row.loggedHours)){
      return `Row ${index+1}: Billable hours cannot exceed Logged hours`;
    }
    return "";
  }

 
  let timeLogData = JSON.parse(sessionStorage.getItem("timeLogData")) || [];

  const hot = new Handsontable(document.getElementById("hot"),{
    data: timeLogData.length ? timeLogData : [getEmptyRow()],
    stretchH:"all",
    rowHeaders:true,
    colHeaders:[
      "Project*","Date*","Phase*","Status*",
      "Logged hr*","Billable hr*","Notes*",
      "Out Of Stock*","BC Link*","BC Desc*"
    ],
    columns:[
      { data:"projectName", type:"text" },
      { data:"timeLogDate", type:"date", dateFormat:"YYYY-MM-DD", correctFormat:true },
      { data:"phase", type:"dropdown", source:["Communication","Development","Testing","Deployment"] },
      { data:"status", type:"dropdown", source:["Pending","In Progress","Completed"] },
      { data:"loggedHours", type:"numeric" },
      { data:"billableHours", type:"numeric" },
      { data:"notes", type:"text" },
      { data:"outOfStock", type:"checkbox" },
      { data:"bcLink", type:"text" },
      { data:"bcDescription", type:"text" }
    ],
    licenseKey:"non-commercial-and-evaluation",
    afterChange: function(changes, source){
      if(source === "loadData" || !changes) return;
      handleSave();
    }
  });

 
  function handleSave(){
    let data = hot.getSourceData();
    let errorMessage = "";

    let validRows = [];
    $.each(data, function(i, row){
      let validation = validateRow(row, i);
      if(validation === ""){
        validRows.push(row);
      } else if(i === 0 && !$("#summarySection").is(":visible")){
       
        errorMessage = validation;
      }
    });

    $("#errorBox").text(errorMessage);

  
    sessionStorage.setItem("timeLogData", JSON.stringify(validRows));

    if(validRows.length){
      renderSummaryTable(validRows);
      $("#summarySection").show(); 
    }
  }

  $("#addRowBtn").click(function(){
    let data = hot.getSourceData();
    data.push(getEmptyRow());
    hot.loadData(data);
  });

 
  $("#deleteRowBtn").click(function(){
    let storedData = JSON.parse(sessionStorage.getItem("timeLogData")) || [];
    if(!storedData.length){
      Swal.fire("Info", "No rows to delete in summary table", "info");
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "This will delete the last row from summary only!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if(result.isConfirmed){
        storedData.pop(); 
        sessionStorage.setItem("timeLogData", JSON.stringify(storedData));
        renderSummaryTable(storedData);

        if(!storedData.length){
          $("#summarySection").hide();
        }

        Swal.fire("Deleted!", "Last summary row has been deleted.", "success");
      }
    });
  });

  function renderSummaryTable(data){
    let tbody = $("#summaryBody");
    tbody.empty();

    $.each(data,function(index,row){
      tbody.append(`
        <tr>
          <td>${index+1}</td>
          <td>${row.projectName}</td>
          <td>${row.timeLogDate}</td>
          <td>${row.phase}</td>
          <td>${row.status}</td>
          <td>${row.loggedHours}</td>
          <td>${row.billableHours}</td>
          <td>${row.notes}</td>
          <td>${row.outOfStock ? "Yes" : "No"}</td>
          <td>${row.bcLink}</td>
          <td>${row.bcDescription}</td>
        </tr>
      `);
    });
  }

  
  handleSave(); 

});

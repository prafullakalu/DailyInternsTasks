

$(document).ready(function () {

    const cityArray = [
    "Mumbai","Pune","Delhi","New Delhi","Bengaluru","Chennai","Hyderabad","Kolkata",
    "Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar",
    "Indore","Bhopal","Jabalpur","Gwalior","Ujjain","Ratlam",
    "Jaipur","Udaipur","Jodhpur","Kota","Ajmer","Alwar","Bikaner",
    "Noida","Greater Noida","Gurgaon","Faridabad","Ghaziabad","Meerut",
    "Lucknow","Kanpur","Varanasi","Prayagraj","Agra","Mathura",
    "Patna","Ranchi","Gaya","Bhagalpur",
    "Chandigarh","Mohali","Panchkula",
    "Amritsar","Ludhiana","Jalandhar","Patiala",
    "Dehradun","Haridwar","Rishikesh","Roorkee",
    "Shimla","Solan","Mandi",
    "Srinagar","Jammu",
    "Raipur","Bilaspur","Durg","Korba",
    "Bhubaneswar","Cuttack","Rourkela",
    "Guwahati","Dibrugarh","Silchar",
    "Imphal","Aizawl","Shillong","Agartala","Kohima","Itanagar",
    "Visakhapatnam","Vijayawada","Guntur","Tirupati","Nellore",
    "Coimbatore","Madurai","Salem","Tiruchirappalli","Erode","Vellore",
    "Kochi","Ernakulam","Thrissur","Kozhikode","Kannur","Thiruvananthapuram",
    "Mangaluru","Udupi","Hubballi","Dharwad","Belagavi","Kalaburagi",
    "Kolhapur","Satara","Sangli","Solapur","Nashik","Aurangabad","Jalgaon",
    "Panaji","Margao",
    "Gangtok",
    "Port Blair"
];

    $(".hoverDropdown").hover(
        function () { $(this).find(".dropdown-menu").stop(true, true).fadeIn(150); },
        function () { $(this).find(".dropdown-menu").stop(true, true).fadeOut(150); }
    );

   
    $("#cityInput").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $("#cityList").empty();

        if (value.length < 2) return;

        cityArray.forEach(city => {
            if (city.toLowerCase().includes(value)) {
                $("#cityList").append(`<li class="list-group-item cityItem">${city}</li>
                    
                    
                    `);
            }
        });
    });

    $(document).on("click", ".cityItem", function () {
        $("#cityInput").val($(this).text());
        $("#cityList").empty();
    });

    
    function loadRecords() {
        let records = JSON.parse(localStorage.getItem("staffRecords")) || [];
        $("#recordTable").html("");
        
        records.forEach(r => {
            $("#recordTable").append(`<tr><td>${r.patientName}</td><td>${r.mobileNumber}</td><td>${r.serviceDate}</td></tr>`);
        });
    }

   
    $("#staffForm").validate({
        rules: {
            patientName: "required",
            mobileNumber: { required: true, digits: true, minlength: 10, maxlength: 10 },
            serviceDate: "required",
            staffCount: { required: true, digits: true },
            city: "required",
            address: "required"
        },
        submitHandler: function () {
            let record = {
                patientName: $("input[name='patientName']").val(),
                mobileNumber: $("input[name='mobileNumber']").val(),
                serviceDate: $("input[name='serviceDate']").val()
            };

            let records = JSON.parse(localStorage.getItem("staffRecords")) || [];
            records.push(record);
            localStorage.setItem("staffRecords", JSON.stringify(records));

            Swal.fire("Success", "Staff Booked Successfully", "success");
            $("#staffForm")[0].reset();
            $("#cityList").empty();
            loadRecords();
        }
    });

  
    $("#clearBtn").click(function () {
        localStorage.removeItem("staffRecords");
        $("#recordTable").html("");
        $("#staffForm")[0].reset();
        $("#cityList").empty();
    });

    loadRecords();
});

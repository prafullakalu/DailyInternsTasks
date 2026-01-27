$(document).ready(function () {

    function loadPage(page) {
        $("#contentBox").hide();
        $("#loader").show();
        setTimeout(function () {
            $.ajax({
                url: page,
                type: "GET",
                dataType: "html",
                success: function (response) {
                    $("#contentBox").html(response);
                },
                error: function (xhr) {
                    $("#contentBox").html(
                        "<h4>Error loading page</h4><p>" + xhr.status + "</p>"
                    );
                },
                complete: function () {
                    $("#loader").hide();
                    $("#contentBox").fadeIn();
                }
            });

        }, 700); 
    }
    loadPage("home.html");  
    $(document).on("click", ".ajaxLink", function (e) {
        e.preventDefault();

        $(".ajaxLink").removeClass("active");
        $(this).addClass("active");

        let page = $(this).data("page");
        loadPage(page);
    });

});

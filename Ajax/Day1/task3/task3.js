$(document).ready(function () {

    function toggleSections(method) {
        if (method === "POST" || method === "PUT" || method === "PATCH") {
            $("#bodySection, #headerSection").removeClass("hidden");
        } else {
            $("#bodySection, #headerSection").addClass("hidden");
        }
    }

    $("#method").on("change", function () {
        toggleSections(this.value);
    });

    function resetValidation() {
        $(".inputError").removeClass("inputError");
        $(".errorText").remove();
    }

    function showError(inputSelector, message) {
        $(inputSelector)
            .addClass("inputError")
            .after(`<div class="errorText">${message}</div>`);
    }

    $("#sendBtn").on("click", function () {

        resetValidation();
        $("#responseBox").text("Loading...");

        let url = $("#url").val().trim();
        let method = $("#method").val();
        let bodyData = $("#bodyInput").val();
        let headerData = $("#headerInput").val();

        if (!url) {
            showError("#url", "URL is required");
            $("#responseBox").text("");
            return;
        }

        let headers = {};
        if (!$("#headerSection").hasClass("hidden")) {
            try {
                headers = JSON.parse(headerData);
            } catch {
                showError("#headerInput", "Headers must be Entered in valid JSON format");
                $("#responseBox").text("");
                return;
            }
        }

        let dataToSend = null;
        if (!$("#bodySection").hasClass("hidden")) {
            try {
                JSON.parse(bodyData);
                dataToSend = bodyData;
            } catch {
                showError("#bodyInput", "Body must be valid JSON");
                $("#responseBox").text("");
                return;
            }
        }
        $.ajax({
            url: url,
            type: method,
            data: dataToSend,
            headers: headers,
            success: function (data,  xhr) {
                $("#responseBox").html(
                    "Status: " + xhr.status + "\n\n" +
                    JSON.stringify(data, null, 4)
                );
            },
            error: function (xhr) {
                $("#responseBox").html(
                    "Status: " + xhr.status + "\n\n" +
                    xhr.responseText
                );
            }
        });
    });

});

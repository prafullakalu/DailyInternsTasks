$(document).ready(function () {

    const countrySelect = $("#countrySelect");
    const stateSelect = $("#stateSelect");
    const citySelect = $("#citySelect");

    $.ajax({
        url: "https://countriesnow.space/api/v0.1/countries/positions",
        method: "GET",
        success: function (response) {
            response.data.forEach(function (item) {
                countrySelect.append(
                    $("<option>", {
                        value: item.name,
                        text: item.name
                    })
                );
            });
        },
        error: function () {
            alert("Failed to load countries");
        }
    });

    countrySelect.on("change", function () {

        stateSelect.prop("disabled", true).html('<option value="">Select State</option>');
        citySelect.prop("disabled", true).html('<option value="">Select City</option>');

        let selectedCountry = $(this).val();
        if (!selectedCountry) return;

        $.ajax({
            url: "https://countriesnow.space/api/v0.1/countries/states",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ country: selectedCountry }),
            success: function (response) {
                response.data.states.forEach(function (state) {
                    stateSelect.append(
                        $("<option>", {
                            value: state.name,
                            text: state.name
                        })
                    );
                });
                stateSelect.prop("disabled", false);
            },
            error: function () {
                alert("Failed to load states");
            }
        });
    });

    stateSelect.on("change", function () {

        citySelect.prop("disabled", true).html('<option value="">Select City</option>');

        let selectedCountry = countrySelect.val();
        let selectedState = $(this).val();
        if (!selectedState) return;

        $.ajax({
            url: "https://countriesnow.space/api/v0.1/countries/state/cities",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                country: selectedCountry,
                state: selectedState
            }),
            success: function (response) {
                response.data.forEach(function (city) {
                    citySelect.append(
                        $("<option>", {
                            value: city,
                            text: city
                        })
                    );
                });
                citySelect.prop("disabled", false);
            },
            error: function () {
                alert("Failed to load cities");
            }
        });
    });

});
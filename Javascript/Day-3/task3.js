$(document).ready(function () {

  let selectedSlot = null;
  let selectedEvent = null;
  let modal = new bootstrap.Modal($('#bookingModal')[0]);


  $('#patientName').on('input', function () {
    this.value = this.value.replace(/[^a-zA-Z ]/g, '');
  });

  $('#mobileNumber').on('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  let calendar = new FullCalendar.Calendar($('#calendar')[0], {
    initialView: 'timeGridWeek',
    selectable: true,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    select: function (info) {
      selectedSlot = info;
      selectedEvent = null;
      clearForm();

      $('#modalTitle').text('Book Appointment');
      $('#deleteBooking').addClass('d-none');
      modal.show();
    },

    eventClick: function (info) {
      selectedEvent = info.event;
      selectedSlot = null;

      let data = selectedEvent.title.match(/(.*) \((.*)\)/);
      $('#patientName').val(data[1]);
      $('#mobileNumber').val(data[2]);

      $('#modalTitle').text('Edit Appointment');
      $('#deleteBooking').removeClass('d-none');
      modal.show();
    }
  });

  calendar.render();


  $('#confirmBooking').click(function () {
    let name = $('#patientName').val().trim();
    let mobile = $('#mobileNumber').val().trim();
    let valid = true;

    $('.error').text('');

    if (name === '') {
      $('#nameError').text('Patient name is required');
      valid = false;
    }

    if (mobile.length !== 10) {
      $('#mobileError').text('Mobile number must be 10 digits');
      valid = false;
    }

    if (!valid) return;

    if (selectedEvent) {
      selectedEvent.setProp('title', `${name} (${mobile})`);
    } else {
      calendar.addEvent({
        title: `${name} (${mobile})`,
        start: selectedSlot.start,
        end: selectedSlot.end
      });
    }

    modal.hide();
    clearForm();
  });


  $('#deleteBooking').click(function () {
    if (selectedEvent && confirm('Delete this appointment?')) {
      selectedEvent.remove();
      modal.hide();
      clearForm();
    }
  });

  function clearForm() {
    $('#patientName').val('');
    $('#mobileNumber').val('');
    $('.error').text('');
  }

});
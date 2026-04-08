
$(document).ready(() => {
  try {
    new EmployeeTable();
  } catch (error) {
    console.error('Error initializing application:', error);
    alert('Failed to initialize the application. Please check the console for details.');
  }
});
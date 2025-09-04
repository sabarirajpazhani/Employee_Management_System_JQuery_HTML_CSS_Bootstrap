$(document).ready(async function () {
  API_LINK_EMPLOYEES = "http://localhost:3000/employees";
  API_LINK_DEPARTMENT = "http://localhost:3000/departments";

  function showToast() {
    const toast = new bootstrap.Toast($("#showToast"));
    toast.show();
  }

  function showToastSuccess() {
    const toast = new bootstrap.Toast($("#showToastSucess"));
    toast.show();
  }

  const ResultTable = $("#ResultTable");
  async function getAllEmployee() {
    const departmentFetch = await fetch(API_LINK_DEPARTMENT);
    const DeptData = await departmentFetch.json();

    const departmentMap = {};
    DeptData.forEach((d) => {
      departmentMap[d.id] = d.name;
    });

    const employeesFetch = await fetch(API_LINK_EMPLOYEES);
    const EmpData = await employeesFetch.json();
    // console.log(EmpData)

    EmpData.forEach((emp) => {
      const tableRow = $("<tr>").addClass("tableRow");
      const tableData1 = $("<td>").attr("scope", "row").text(`${emp.name}`);
      const tableData2 = $("<td>").attr("scope", "row").text(`${emp.email}`);
      const tableData3 = $("<td>")
        .attr("scope", "row")
        .text(`${departmentMap[emp.departmentId]}`);
      const tableData4 = $("<td>")
        .attr("scope", "row")
        .text(`${emp.joiningDate.substring(0, 10)}`);
      const tableData5 = $("<td>").attr("scope", "row").text(`${emp.salary}`);
      const tableData6 = $("<td>")
        .attr("scope", "row")
        .addClass("d-flex justify-content-evenly");

      const update = $("<button>")
        .addClass("update_btn")
        .text("Update")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          window.location.href = `EmployeeForm.html?id=${emp.id}`;
          // $("#Emp_name").val(emp.name);
          // $("#Emp_email").val(emp.email);
          // $("#Emp_department").val(emp.departmentId);
          // $("#Emp_joiningDate").val(
          //   new Date(emp.joiningDate).toISOString().split("T")[0]
          // );
          // $("#Emp_Salary").val(emp.salary);

          // const model = new bootstrap.Modal(document.getElementById("modalId"));
          // model.show();
        });

      const idD = Number(emp.id);
      const Delete = $("<button>")
        .addClass("update_del")
        .text("Delete")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          $.ajax({
            type: "DELETE",
            url: `${API_LINK_EMPLOYEES}/${idD}`,
            success: function (response) {
              $("#success_message").text("Deleted Successfully");
              showToastSuccess();
            },
          });
        });

      tableData6.append(update, Delete);
      tableRow.append(
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        tableData5,
        tableData6
      );

      ResultTable.append(tableRow);
    });
  }

  $("#Emp_form").submit(async function (e) {
    e.preventDefault();
    const employeesFetch = await fetch(API_LINK_EMPLOYEES);
    const EmpData = await employeesFetch.json();
    const lastId =
      EmpData.length > 0 ? Math.max(...EmpData.map((e) => Number(e.id))) : 0;

    const id = String(lastId + 1);

    const name = $("#Emp_name").val().trim();
    const nameRegex = /[a-zA-Z]{3,}/;
    const email = $("#Emp_email").val().trim();
    const emailRegex = /^[\w\S]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    const departmentId = String($("#Emp_department").val());
    console.log(departmentId);

    const joiningDateStr = $("#Emp_joiningDate").val();
    let joiningDate = new Date(joiningDateStr);
    let joiningDate1 = new Date(joiningDateStr);

    const salary = Number($("#Emp_Salary").val().trim());
    console.log(typeof salary);

    if (!id || !name || !email || !departmentId || !joiningDate) {
      $("#error_message").text("Enter the required Filed !");
      showToast();
      return;
    } else {
      if (!nameRegex.test(name)) {
        $("#error_message").text("Name length should be greater than 3!");
        showToast();
        return;
      }

      if (!emailRegex.test(email)) {
        $("#error_message").text("Invalid Email!");
        showToast();
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      joiningDate1.setHours(0, 0, 0, 0);
      if (joiningDate1 > today) {
        $("#error_message").text(
          "Invalid Joining Date, Date Should not be a future date!"
        );
        showToast();
        return;
      }

      if (salary === 0) {
        $("#error_message").text("Salary Should not be Zero!");
        showToast();
        return;
      }

      $.get(`${API_LINK_EMPLOYEES}?email=${email}`, function (res) {
        if (res.length > 0) {
          $("#error_message").text("Email Already Exsits!!");
          showToast();
          return;
        }
        $.ajax({
          type: "POST",
          url: `${API_LINK_EMPLOYEES}`,
          data: JSON.stringify({
            id,
            name,
            email,
            departmentId,
            joiningDate,
            salary,
          }),
          dataType: "json",
          success: function (response) {
            $("#success_message").text("Successfully Registered!");
            showToastSuccess();
            getAllEmployee();
          },
        });
      });
    }
  });

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const empId = getQueryParam("id");
  console.log("empId from URL:", empId);

  async function loadEmployee() {
    // first fetch employee
    const res = await fetch(`${API_LINK_EMPLOYEES}/${empId}`);
    const emp = await res.json();

    // then fetch departments
    const deptres = await fetch(`${API_LINK_DEPARTMENT}`);
    const departments = await deptres.json();
    const department = departments.find((d) => d.id == emp.departmentId);

    // fill form
    $("#Emp_name").val(emp.name);
    $("#Emp_email").val(emp.email);
    $("#Emp_department").val(emp.departmentId).text(emp.department);
    $("#Emp_joiningDate").val(
      new Date(emp.joiningDate).toISOString().split("T")[0]
    );
    $("#Emp_Salary").val(emp.salary);

    $("#registerBtn").hide();
    $("#saveUpdateBtn").show();
  }

  $("#saveUpdateBtn").on("click", function () {
    const name = $("#Emp_name").val().trim();
    const nameRegex = /[a-zA-Z]{3,}/;
    const email = $("#Emp_email").val().trim();
    const emailRegex = /^[\w\S]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    const departmentId = String($("#Emp_department").val());
    console.log(departmentId);

    const joiningDateStr = $("#Emp_joiningDate").val();
    let joiningDate = new Date(joiningDateStr);
    let joiningDate1 = new Date(joiningDateStr);
    // joiningDate.setHours(0, 0, 0, 0);

    const salary = Number($("#Emp_Salary").val().trim());
    console.log(typeof salary);

    if (!name || !email || !departmentId || !joiningDate) {
      $("#error_message").text("Enter the required Filed !");
      showToast();
      return;
    } else {
      if (!nameRegex.test(name)) {
        $("#error_message").text("Name length should be greater than 3!");
        showToast();
        return;
      }

      if (!emailRegex.test(email)) {
        $("#error_message").text("Invalid Email!");
        showToast();
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      joiningDate1.setHours(0, 0, 0, 0);
      if (joiningDate1 > today) {
        $("#error_message").text(
          "Invalid Joining Date, Date Should not be a future date!"
        );
        showToast();
        return;
      }

      if (salary === 0) {
        $("#error_message").text("Salary Should not be Zero!");
        showToast();
        return;
      }
      $.ajax({
        type: "PUT",
        url: `${API_LINK_EMPLOYEES}/${empId}`,
        contentType: "application/json",
        data: JSON.stringify({
          name,
          email,
          departmentId,
          joiningDate,
          salary,
        }),
        success: function (response) {
          window.location.href = "Employee.html";
          $("#success_message").text("Successfully Updated!");
          showToastSuccess();
          getAllEmployee();
        },
      });
    }
  });

  const searchingFetch = await fetch(API_LINK_EMPLOYEES);
  const searchingArr = await searchingFetch.json();
  console.log(searchingArr);

  $("#searchByName").on("input", function (e) {
    console.log(e.target.value);
    const emp = searchingArr.filter((emp) => {
      return emp.name.toLowerCase().includes(e.target.value.toLowerCase());
    });

    searchResult(emp);
  });
  $("#clearName").on("click", function () {
    $("#searchByName").val("");
    searchResult(searchingArr);
  });

  $("#searchByEmail").on("input", function (e) {
    console.log(e.target.value);
    const emp = searchingArr.filter((emp) => {
      return emp.email.toLowerCase().includes(e.target.value.toLowerCase());
    });

    searchResult(emp);
  });
  $("#clearEmail").on("click", function () {
    $("#searchByEmail").val("");
    searchResult(searchingArr);
  });

  $("#Emp_department").on("change", function () {
    const selectedDeptId = $(this).val();
    if (!selectedDeptId || selectedDeptId === "Select Department") {
      searchResult(searchingArr);
      return;
    }
    const emp = searchingArr.filter(
      (emp) => emp.departmentId === selectedDeptId
    );
    searchResult(emp);
  });
  $("#clearDept").on("click", function () {
    $("#Emp_department").val("Select Department");
    searchResult(searchingArr);
  });

  $("#searchByDate").on("input", function (e) {
    console.log(e.target.value);
    const emp = searchingArr.filter((emp) => {
      return emp.joiningDate
        .toLowerCase()
        .includes(e.target.value.toLowerCase());
    });

    searchResult(emp);
  });
  $("#clearDate").on("click", function () {
    $("#searchByDate").val("");
    searchResult(searchingArr);
  });

  $("#searchBySalary").on("input", function (e) {
    const searchValue = e.target.value;
    const emp = searchingArr.filter((emp) => {
      return emp.salary.toString().includes(searchValue);
    });
    searchResult(emp);
  });
  $("#clearSalary").on("click", function () {
    $("#searchBySalary").val("");
    searchResult(searchingArr);
  });

  // Clear all search filters
  $("#clearAllSearch").on("click", function () {
    $("#searchByName").val("");
    $("#searchByEmail").val("");
    $("#searchByDate").val("");
    $("#searchBySalary").val("");
    $("#Emp_department").val("Select Department");
    searchResult(searchingArr);
  });

  const departmentFetch = await fetch(API_LINK_DEPARTMENT);
  const DeptData = await departmentFetch.json();
  const departmentMap = {};
  DeptData.forEach((d) => {
    departmentMap[d.id] = d.name;
  });

  function searchResult(emp) {
    ResultTable.empty();

    if (emp.length === 0) {
      const noRow = $("<tr>").append(
        $("<td>")
          .attr("colspan", 6)
          .addClass("text-center text-danger fw-bold")
          .text("No results found")
      );
      ResultTable.append(noRow);
      return;
    }

    emp.forEach((emp) => {
      const tableRow = $("<tr>").addClass("tableRow");
      const tableData1 = $("<td>").attr("scope", "row").text(`${emp.name}`);
      const tableData2 = $("<td>").attr("scope", "row").text(`${emp.email}`);
      const tableData3 = $("<td>")
        .attr("scope", "row")
        .text(`${departmentMap[emp.departmentId]}`);
      const tableData4 = $("<td>")
        .attr("scope", "row")
        .text(`${emp.joiningDate.substring(0, 10)}`);
      const tableData5 = $("<td>").attr("scope", "row").text(`${emp.salary}`);
      const tableData6 = $("<td>")
        .attr("scope", "row")
        .addClass("d-flex justify-content-evenly");

      const update = $("<button>")
        .addClass("update_btn")
        .text("Update")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          window.location.href = `EmployeeForm.html?id=${emp.id}`;
        });

      const idD = Number(emp.id);
      const Delete = $("<button>")
        .addClass("update_del")
        .text("Delete")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          $.ajax({
            type: "DELETE",
            url: `${API_LINK_EMPLOYEES}/${idD}`,
            success: function (response) {
              $("#success_message").text("Deleted Successfully");
              showToastSuccess();
            },
          });
        });

      tableData6.append(update, Delete);
      tableRow.append(
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        tableData5,
        tableData6
      );

      ResultTable.append(tableRow);
    });
  }

  let employees = [];

  async function getAllEmployee() {
    const empRes = await fetch(API_LINK_EMPLOYEES);
    employees = await empRes.json();

    renderEmployees(employees);
  }

  function renderEmployees(emp) {
    const tableBody = $("#ResultTable");
    tableBody.empty();

    emp.forEach((emp) => {
      const tableRow = $("<tr>").addClass("tableRow");
      const tableData1 = $("<td>").attr("scope", "row").text(`${emp.name}`);
      const tableData2 = $("<td>").attr("scope", "row").text(`${emp.email}`);
      const tableData3 = $("<td>")
        .attr("scope", "row")
        .text(`${departmentMap[emp.departmentId]}`);
      const tableData4 = $("<td>")
        .attr("scope", "row")
        .text(`${emp.joiningDate.substring(0, 10)}`);
      const tableData5 = $("<td>").attr("scope", "row").text(`${emp.salary}`);
      const tableData6 = $("<td>")
        .attr("scope", "row")
        .addClass("d-flex justify-content-evenly");

      const update = $("<button>")
        .addClass("update_btn")
        .text("Update")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          window.location.href = `EmployeeForm.html?id=${emp.id}`;
        });

      const idD = Number(emp.id);
      const Delete = $("<button>")
        .addClass("update_del")
        .text("Delete")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          $.ajax({
            type: "DELETE",
            url: `${API_LINK_EMPLOYEES}/${idD}`,
            success: function (response) {
              $("#success_message").text("Deleted Successfully");
              showToastSuccess();
            },
          });
        });

      tableData6.append(update, Delete);
      tableRow.append(
        tableData1,
        tableData2,
        tableData3,
        tableData4,
        tableData5,
        tableData6
      );

      ResultTable.append(tableRow);
    });
  }

  // Sorting handler (always ascending)
  $(document).on("click", ".sort-option", function () {
    const sortBy = $(this).data("sort");

    employees.sort((a, b) => {
      if (sortBy === "salary") {
        return a.salary - b.salary;
      }
      if (sortBy === "joiningDate") {
        return new Date(a.joiningDate) - new Date(b.joiningDate);
      }
      if (sortBy === "department") {
        return (departmentMap[a.departmentId] || "").localeCompare(
          departmentMap[b.departmentId] || ""
        );
      }
      return a[sortBy].toString().localeCompare(b[sortBy].toString());
    });

    renderEmployees(employees);
  });

  $("#removeSort").on("click", async function () {
    $("#sortDropdown").text("Sort Employees"); // reset dropdown label
    await getAllEmployee(); // re-fetch from API
  });

  loadEmployee();
  getAllEmployee();
});

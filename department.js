$(document).ready(function () {
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

  const resultPage = $("#resultDepat");

  async function getAllDept() {
    const deptFetch = await fetch(API_LINK_DEPARTMENT);
    const deptData = await deptFetch.json();

    const option = $("#Emp_department");

    deptData.forEach((dep) => {
      const tableRow = $("<tr>").addClass("tableRow");
      const tableData1 = $("<td>").attr("scope", "row").text(`${dep.name}`);
      const tableData2 = $("<td>").attr("scope", "row").text(`${dep.code}`);

      const tableData6 = $("<td>")
        .attr("scope", "row")
        .addClass("d-flex justify-content-evenly");

      const update = $("<button>")
        .addClass("update_btn")
        .text("Update")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          // Fill form values
          $("#Dept_Name").val(dep.name);
          $("#dept_code").val(dep.code);

          // Save department ID on button
          $("#updateBtn").data("deptId", dep.id);

          // Switch buttons
          $("#addDeptBtn").hide();
          $("#updateBtn").show();
        });

      const idD = dep.id;
      const Delete = $("<button>")
        .addClass("update_del")
        .text("Delete")
        .addClass("btn btn-warning mt-2 ms-2")
        .on("click", function () {
          $.ajax({
            type: "DELETE",
            url: `${API_LINK_DEPARTMENT}/${idD}`,
            success: function (response) {
              $("#success_message").text("Deleted Successfully");
              showToastSuccess();
            },
          });
        });

      tableData6.append(update, Delete);
      tableRow.append(tableData1, tableData2, tableData6);

      const opt = $("<option>").attr("value", `${dep.id}`).text(`${dep.name}`);
      option.append(opt);

      resultPage.append(tableRow);
    });
  }

  function deleteDept(id) {
    $.ajax({
      type: "DELETE",
      url: `${API_LINK_DEPARTMENT}`,
      success: function (response) {
        $("#success_message").text("Deleted Successfully");
        showToastSuccess();
      },
    });
  }

  getAllDept();

  $("#dept_form").submit(async function (e) {
    e.preventDefault();

    const deptFetch = await fetch(API_LINK_DEPARTMENT);
    const deptData = await deptFetch.json();
    const lastId =
      deptData.length > 0 ? Math.max(...deptData.map((d) => Number(d.id))) : 0;
    const id = String(lastId + 1);

    const name = $("#Dept_Name").val().trim();
    const nameRegex = /[a-zA-Z]{3,}/;
    const code = $("#dept_code").val().trim();

    // const option = $("#Emp_department");

    if (!id || !name || !code) {
      $("#error_message").text("Enter the required Filed !");
      showToast();
      return;
    } else {
      if (!nameRegex.test(name)) {
        $("#error_message").text("Name length should be greater than 3!");
        showToast();
        return;
      }

      $.get(`${API_LINK_DEPARTMENT}?code=${code}`, function (codes) {
        console.log(codes.length);
        if (codes.length > 0) {
          $("#error_message").text("Codes Already Exsits!!");
          showToast();
          return;
        } else {
          $.ajax({
            type: "POST",
            url: `${API_LINK_DEPARTMENT}`,
            data: JSON.stringify({ id, name, code }),
            dataType: "json",
            success: function (response) {
              $("#success_message").text("Successfully Registered!");
              showToastSuccess();
              console.log("Successfully");
            },
          });
          $("#success_message").text("Successfully Registered!");
          showToastSuccess();
          console.log("Successfully");
        }
      });
    }
  });

  const deptId = new URLSearchParams(window.location.search).get("id");

  $("#updateBtn").on("click", async function () {
    const deptId = $(this).data("deptId");

    const name = $("#Dept_Name").val().trim();
    const nameRegex = /^[a-zA-Z]{3,}$/;
    const code = $("#dept_code").val().trim();

    if (!name || !code) {
      $("#error_message").text("Enter the required Fields!");
      showToast();
      return;
    }

    if (!nameRegex.test(name)) {
      $("#error_message").text("Name length should be greater than 3!");
      showToast();
      return;
    }
    $.ajax({
      type: "PUT",
      url: `${API_LINK_DEPARTMENT}/${deptId}`,
      contentType: "application/json",
      data: JSON.stringify({ id: deptId, name, code }),
      success: function () {
        $("#success_message").text("Successfully Updated!");
        showToastSuccess();
        console.log("Successfully Updated");
        window.location.href = "Department.html";
      },
      error: function (err) {
        console.error("Update failed:", err);
        $("#error_message").text("Failed to update department!");
        showToast();
      },
    });
  });
});

function setSwal(param1, data, status) {
    switch (status) {
        case 1:
            swal({title: param1, text: data, type: "success", timer: 9000});
            break;
        case 2:
            swal({title: param1, text: data, type: "error", timer: 9000});
            break;
        default:
            break;
    }
}

function _preloader(toState) {
    if (toState == 'hide') {
        $('#spinner').css({"display": "none"});
    } else if (toState == 'show') {
        $('#spinner').css({"display": "block"});
    }
}

function deleteUser(id) {

    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(function (result) {

        if (result.value) {
            _preloader('show');
            $.ajax({
                url: "/delete_user/" + id, context: document.body, error: function (response, status, error) {
                    if (response.status == 404) {
                        setSwal(status.toUpperCase(), error.toUpperCase(), 2);
                    } else {
                        setSwal("Oops...", "Something went wrong.", 2);
                    }
                    _preloader('hide');
                },
                success: function (response) {
                    _preloader('hide');
                    var json = JSON.parse(JSON.stringify(response));
                    if (response.status == 200) {
                        setSwal(json.message_type.toUpperCase(), json.message, 1);
                    } else {
                        setSwal(json.message_type.toUpperCase(), json.message, 2);
                    }

                    $('#emp_list').DataTable().ajax.reload();
                },
                error: function (error) {
                    _preloader('hide');
                    var json = error.responseJSON
                    setSwal(json.message_type.toUpperCase(), json.message, 2);


                }
            });
        } else return false;
    });
    return false;
}

function fill_users_datatable() {

    table = $('#users').DataTable({
        "searching": true,
        "lengthMenu": [7, 10, 15, 25, 50, 100, 200, 500],
        "processing": true,
        "serverSide": false,
        "paging": true,
        "pagingType": 'full_numbers',

        "ajax":{
            'url': "/get_all_users",
            'type': "GET",
        },
        "dataSrc": "",
        "order": [[1, "desc"]],
        "pagingType": "simple_numbers",
        "columns": [
            {"data": "first_name", "name": "first_name", "searchable": true},
            {"data": "last_name", "name": "last_name", "searchable": true},
            {"data": "email", "name": "email", "searchable": true},
            {
                "data": "status",
                "name": "status",
                "orderable": false,
                "searchable": false,
                "render": function (data, type, full, meta) {
                    if (full.status === 'Active') {
                        return '<span class="badge badge-sm bg-gradient-success">' + full.status + '</span>';
                    } else {
                        return '<span class="badge badge-sm bg-gradient-danger">' + full.status + '</span>';
                    }
                }
            },
            {
                "data": "id",
                "name": "id",
                "orderable": false,
                "searchable": false,
                "render": function (data, type, full, meta) {
                    if (full.is_superuser === true) {
                        return '<a  class="badge badge-sm bg-gradient-danger" onclick="javascript:deleteUser(\'' + full.id + '\');return false;"> Delete</i></a>';
                    } else {
                        return '';
                    }
                }
            },

        ],

    });

}


function editSftp(id) {
    _preloader('show');
    $.ajax({
        url: "/get_sftp_details_by_id", data: {"id": id}, dataType: "json", dataSrc: "", success: function (data) {
            $("#username").val(data.data.username);
            $("#password").val(data.data.password);
            $("#customer_name").val(data.data.customer_name);
            $("#host").val(data.data.host);
            $("#port").val(data.data.port);
            $('#server_direc').val(data.data.server_directory);
            $('#user_direc').val(data.data.user_directory);
            $("#sftp_id").val(data.data.id);
            $("#sftpedit").modal("show");

            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })

}

function deleteSftp(id) {
    _preloader('show');
    $.ajax({
        url: "/delete_sftp_details_by_id", data: {"id": id}, dataType: "json", dataSrc: "",
        success: function (data) {
            _preloader('hide');
            window.location = 'sftp_details';
        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })

}


function saveSftpfrom(data) {
    _preloader('show');
    $.ajax({
        method: "POST",
        url: "/save_sftp_details_by_id",
        data: data,
        dataType: "json",
        dataSrc: "",
        success: function (data) {

            _preloader('hide');
            $("#scrapperedit").modal("hide");
            window.location.reload();
        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })

}

function showPassword() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function addSftpFrom(data) {
    _preloader('show');
    $.ajax({
        method: "POST", url: "/add_sftp_details", data: data, dataType: "json", dataSrc: "", success: function (data) {
            _preloader('hide');
            window.location = 'sftp_details';
        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })

}





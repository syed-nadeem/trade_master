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

function authorizeUser(id) {

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
                url: "/make_user_authorize/" + id, context: document.body, error: function (response, status, error) {
                    if (response.status == 404) {
                        setSwal(status.toUpperCase(), error.toUpperCase(), 2);
                    } else {
                        setSwal("Oops...", "Something went wrong.", 2);
                    }
                    _preloader('hide');
                }, success: function (response) {
                    _preloader('hide');
                    var json = JSON.parse(JSON.stringify(response));
                    if (response.status == 200) {
                        setSwal(json.message_type.toUpperCase(), json.message, 1);
                    } else {
                        setSwal(json.message_type.toUpperCase(), json.message, 2);
                    }
                    $('#emp_list').DataTable().ajax.reload();
                }
            });
        } else return false;
    });
    return false;
}

function fill_roles_datatable() {

    table = $('#emp_list').DataTable({
        "searching": true,
        "lengthMenu": [7, 10, 15, 25, 50, 100, 200, 500],
        "processing": true,
        "serverSide": false,
        "paging": true,
        "pagingType": 'full_numbers',

        "ajax": {
            'url': "/get_all_users", 'type': "GET", // "data": function (d) {
            //     d.exb_name = exb_name
            //     d.email = email
            // }
        },
        "dataSrc": "",
        "order": [[1, "desc"]],
        "pagingType": "simple_numbers",
        "columns": [{
            "data": "name",
            "name": "name",
            "targets": 3,
            "width": '150px',
            "orderable": false,
            "searchable": false,
            "render": function (data, type, row, meta) {
                $html = '<div class="d-flex px-2 py-1">' + '<div class="d-flex flex-column justify-content-center">' + '<h6 class="mb-0 text-sm">' + row.name + '</h6>' + '<p class="text-xs text-secondary mb-0">' + row.country_code + '</p>' + '</div>' + '</div>';
                return $html;

            }
        }, {"data": "email", "name": "email", "searchable": true}, {
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
        }, {
            "data": "roles", "name": "roles", "searchable": false,
            "render": function (data, type, row) {
                return '<p class="wrap_long_text">' + data + '</p>';
            }
        }, {
            "data": "id",
            "name": "id",
            "orderable": false,
            "searchable": false,
            "render": function (data, type, full, meta) {
                if (full.data_auth === true) {
                    return '<a  class="badge badge-sm bg-gradient-success" onclick="javascript:authorizeUser(\'' + full.id + '\');return false;"> Authorized</i></a>';
                } else {
                    return '<a  class="badge badge-sm bg-gradient-faded-danger" onclick="javascript:authorizeUser(\'' + full.id + '\');return false;">Un Authorized</i></a>';
                }
            }
        },

        ],

    });

}


function fill_customers_datatable() {
    _preloader('show');
    $.ajax({
        // "url": "static/objects2.txt", // This works for a static file
        url: "/scrappers/show_customers", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            //build the DataTable dynamically.
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            // var rows = data.rows;
            // var new_rows = rows.map(d => new Date(d.Last_seen));
            // rows = rows.map(last_seen => new Date(last_seen));

            $('#customers').DataTable({
                searching: true, lengthMenu: [10, 15, 25, 50, 100, 200, 500], data: data.rows, // rowId: 'ImportID',
                scrollX: true, columns: columns
            });
            _preloader('hide');
        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }
    })
}

function myFunction(item) {
    item.Last_Seen = new Date(item.Last_Seen)
}


function fill_customers_meters_datatable(cus) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/show_customers_meters",
        data: {"customer": cus},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#customers_meters').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.mp,
                scrollX: true,
                columns: columns
            });
            document.getElementById("auth").innerHTML = data.expired;
            document.getElementById("auth1").innerHTML = 'Customer: ' + data.authorization.customerName + ' CVR: ' + data.authorization.customerCVR;
            document.getElementById("auth2").innerHTML = 'Access period: ' + data.authorization.validFrom + ' - ' + data.authorization.validTo;

            _preloader('hide');
        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }
    })
}


function fill_meter_details_datatable(met) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/show_meter_details",
        data: {"meter": met},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#meter_details').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.mpp,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_meter_month_details_datatable(m_no, mon) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/show_meter_month_details",
        data: {"meter_no": m_no, "month": mon},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#meter_month_details').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.mp,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_meter_daily_details_datatable(m_no, mon) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/show_meter_daily_details",
        data: {"meter_no": m_no, "day": mon},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#meter_month_details').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.mp,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ewii_customers_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewiicustomers_table').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_ewii_customers_meters_datatable(login_id) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_meters_data",
        data: {"login_id": login_id},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewii_customers_meters').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }
    })
}


function fill_pdf_raw_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/pdf_raw_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#raw_pdf_table').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_ewii_meter_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewii_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ewii_meter_details_raw_datatable(login_id, meter, meter_type) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_meter_detail_data_raw",
        dataType: "json",
        data: {"login_id": login_id, "meter": meter, "meter_type": meter_type},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewii_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ewii_meter_month_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewii_meter_month_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ewii_meter_month_details_raw_datatable(login_id, meter, meter_type, month_year) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_meter_detail_data_raw",
        dataType: "json",
        data: {'login_id': login_id, "meter": meter, "meter_type": meter_type, 'month_year': month_year},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewii_meter_month_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ewii_meter_daily_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewii_meter_daily_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');
        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_ewii_meter_hourly_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ewii_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ewii_meter_hourly_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_pdf_customers_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/pdf_customers_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#pdf_customers_table').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_pdf_customers_meters_datatable(customer_id) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/pdf_customers_meters_data",
        data: {"customer_id": customer_id},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#pdf_customers_meters').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }
    })
}


function fill_pdf_meter_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/pdf_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#pdf_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_pdf_meter_month_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/pdf_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#pdf_meter_month_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_pdf_meter_daily_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/pdf_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#pdf_meter_daily_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_pdf_meter_hourly_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/pdf_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#pdf_meter_hourly_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_Eforsyning_customers_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_customers_table').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_Eforsyning_customers_meters_datatable(customer_id) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_meters_data",
        data: {"customer_id": customer_id},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_customers_meters').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }
    })
}


function fill_Eforsyning_meter_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_Eforsyning_meter_details_raw_datatable(customer_id, meter, meter_type) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_meter_detail_data_raw",
        dataType: "json",
        data: {"customer_id": customer_id, "meter": meter, "meter_type": meter_type},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_Eforsyning_meter_month_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_meter_month_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_Eforsyning_meter_daily_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_meter_daily_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_Eforsyning_meter_daily_details_datatable_raw(meter, meter_type, date) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_meter_detail_data_raw",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "date": date},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_meter_daily_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function fill_Eforsyning_meter_hourly_details_datatable(meter, meter_type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/Eforsyning_customers_meter_detail_data",
        dataType: "json",
        data: {"meter": meter, "meter_type": meter_type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Eforsyning_meter_hourly_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_danfoss_customers_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/danfoss_customers_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#danfosscustomers_table').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_danfoss_meter_details_datatable(id, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/danfoss_customers_meter_data",
        dataType: "json",
        data: {"id": id, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#danfoss_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function danfoss_raw_data(id, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/danfoss_raw_data", dataType: "json", data: {}, dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#danfoss_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }

    })
}

function fill_ems_customers_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ems_customers_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#emscustomers_table').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ems_cusomer_meters_details(customer_name) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ems_customer_meter_data",
        dataType: "json",
        data: {"customer_name": customer_name},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ems_customer_meters').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ems_meter_details_datatable(meter, type, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ems_customer_meter_data_detail",
        dataType: "json",
        data: {"meter": meter, "type": type, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ems_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_ems_raw_meter_details_datatable(meter, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/ems_raw_meter_data",
        dataType: "json",
        data: {"meter": meter, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            var columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#ems_meter_details_raw').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');
        }

    })
}

function fill_nordpool_details_datatable(formate, c) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/nordpool_Eu_data",
        dataType: "json",
        data: {"formate": formate, "c": c},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Nordpool_data_table').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}


function get_current_branch(dom) {
    _preloader('show');
    $.ajax({
        url: "/get_current_branch", dataType: "json", data: {"domain": dom}, dataSrc: "", success: function (data) {
            $('#current_branch').text(data.branch);
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            $('#current_branch').text("NA");
        }

    })
}

function get_api_current_branch(dom) {
    _preloader('show');
    $.ajax({
        url: "/get_api_current_branch", dataType: "json", data: {"domain": dom}, dataSrc: "", success: function (data) {
            $('#api_current_branch').text(data.branch);
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            $('#api_current_branch').text("NA");
        }

    })
}

function change_branch(dom, bran, apibran) {

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
            // if (bran === cuBn) {
            //     setSwal("Oops...", "Already on " + bran + " branch!.", 2);
            // } else {
            _preloader('show');
            $.ajax({
                url: "/change_branch",
                context: document.body,
                dataType: "json",
                data: {"domain": dom, "branch": bran, "api_branch": apibran},

                error: function (response, status, error) {
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
                }
            });
            // }
        } else return false;
    });
    return false;
}


function fetch_branches(dom) {
    _preloader('show');
    $.ajax({
        url: "/fetch_branches", success: function (data) {
            _preloader('hide');
            window.location.reload();

        }, error: function (data) {
            _preloader('hide');
            swal({title: "Error!", text: "Something went wrong!.", type: "error", timer: 9000});
        }

    })
}

function add_customer_data(customer, meter) {
    swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(function (result) {
        if (result.value) {
            _preloader('show');
            $.ajax({
                url: "/add_customer_data",
                context: document.body,
                dataType: "json",
                data: {"customer": customer, "meter_type": meter},

                error: function (response, status, error) {
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
                }
            });
        } else return false;
    });
    return false;
}


function fill_scrapper_details_datatable() {
    table = $('#scrapper_details').DataTable({
        drawCallback: function () {
            $('[data-toggle="popover"]').popover();
        },
        "scrollX": true,
        "searching": true,
        "lengthMenu": [7, 10, 15, 25, 50, 100, 200, 500],
        "processing": true,
        "serverSide": false,
        "paging": true,
        "ajax": {
            'url': "/get_scrapper_details", 'type': "GET",
        },
        "dataSrc": "",
        "order": [[1, "desc"]],
        "pagingType": "simple_numbers",
        "columns": [
            {
                "data": "name",
                "name": "name",
                "orderable": true,
                "searchable": true,
                "render": function (data, type, full, meta) {
                    return '<a  href="#" onclick="javascript:getScrapperMeters(\'' + full.name + '\' , \'' + full.type + '\');return false;">' + full.name + ' </a>';
                },

            },
            {
                "data": "username",
                "name": "username",
                "searchable": true
            }, // {"data": "password", "name": "password", "searchable": true},
            {
                "data": "customer", "name": "customer", "searchable": true,
                "render": function (data, type, row) {
                    return '<p class="wrap_long_text">' + data + '</p>';
                }
            }, {
                "data": "country", "name": "country", "searchable": true
            }, {"data": "type", "name": "type", "searchable": true}, {
                "data": "status", "name": "status", "searchable": true, "render": function (data, type, full, meta) {
                    if (full.status === "completed") {
                        return '<p style="color: green;">' + full.status + '</p>';
                    } else if (full.status === "in_progress") {
                        return '<p style="color: #6A96FF;">' + full.status + '</p>';
                    } else {
                        return '<p style="color: red;">' + full.status + '</p>';
                    }
                }
            }, {
                "data": "id",
                "name": "id",
                "orderable": false,
                "searchable": false,
                "render": function (data, type, full, meta) {
                    if (full.is_super_user === true) {
                        return '<a  class="btn btn-success btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="Edit" onclick="javascript:editScrapper(\'' + full.id + '\');return false;"> <i class="fa fa-edit"></i></a>';
                    } else {
                        return '<a  class="btn btn-secondary btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="Edit");return false;"> <i class="fa fa-edit"></i></a>';
                    }
                },

            },
            {
                "data": "cronjob", "name": "cronjob", "searchable": true,
                "render": function (data, type, full, meta) {
                    if (full.cronjob === true) {
                        return '<i class="fa fa-check" style="font-size:30px;color:green"></i>';
                    } else {
                        return '<i class="fa fa-close" style="font-size:30px;color:red"></i>';
                    }
                }

            }, {
                "data": "displayed_on_app",
                "name": "displayed_on_app",
                "searchable": true,
                "render": function (data, type, full, meta) {
                    if (full.displayed_on_app === true) {
                        return '<i class="fa fa-check" style="font-size:30px;color:green"></i>';
                    } else {
                        return '<i class="fa fa-close" style="font-size:30px;color:red"></i>';
                    }
                }
            },
            {
                "data": "url",
                "name": "url",
                "searchable": false,
                "render": function (data, type, row) {
                    return '<p class="wrap_long_text">' + data + '</p>';
                }
            },
            {
                "data": "period",
                "name": "period",
                "searchable": false
            },
            {
                "data": "cron_time",
                "name": "cron_time",
                "searchable": false
            }, {
                "data": "aggregation_time",
                "name": "aggregation_time",
                "searchable": false
            }, {
                "data": "collection_name",
                "name": "collection_name",
                "searchable": true,
                "render": function (data, type, row) {
                    return '<p class="wrap_long_text">' + data + '</p>';
                }
            },
            {
                "data": "description",
                "name": "description",
                "searchable": true,
                "render": function (data, type, row) {
                    return '<p class="wrap_long_text">' + data + '</p>';
                }
            }

        ],

    });

}


function fill_sftp_details_datatable() {
    table = $('#sftp_details').DataTable({
        drawCallback: function () {
            $('[data-toggle="popover"]').popover();
        },
        "scrollX": true,
        "searching": true,
        "lengthMenu": [7, 10, 15, 25, 50, 100, 200, 500],
        "processing": true,
        "serverSide": false,
        "paging": true,
        "ajax": {
            'url': "/get_sftp_details", 'type': "GET",
        },
        "dataSrc": "",
        "order": [[1, "desc"]],
        "pagingType": "simple_numbers",
        "columns": [
            {"data": "customer_name", "name": "customer_name", "searchable": true},
            {"data": "username", "name": "username", "searchable": true},
            {"data": "host", "name": "host", "searchable": true},
            {"data": "port", "name": "port", "searchable": true},
            {"data": "server_directory", "name": "server_directory", "searchable": true,},
            {"data": "user_directory", "name": "user_directory", "searchable": true},
            {"data": "created_at", "name": "created_at", "searchable": true},
            {
                "data": "id",
                "name": "id",
                "orderable": false,
                "searchable": false,
                "render": function (data, type, full, meta) {
                    if (full.is_super_user === true) {
                        return '<a  class="btn btn-success btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="Edit" onclick="javascript:editSftp(\'' + full.id + '\');return false;"> <i class="fa fa-edit"></i></a>';
                    } else {
                        return '<a  class="btn btn-secondary disabled btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="Edit");return false;"> <i class="fa fa-edit"></i></a>';
                    }
                },

            },
            {
                "data": "id",
                "name": "id",
                "orderable": false,
                "searchable": false,
                "render": function (data, type, full, meta) {
                    if (full.is_super_user === true) {
                        return '<a  class="btn btn-danger btn-sm" type="button" data-toggle="tooltip" data-placement="top"  onclick="javascript:deleteSftp(\'' + full.id + '\');return false;"> <i class="fa fa-trash"></i></a>';
                    } else {
                        return '<a  class="btn btn-danger disabled btn-sm" type="button" data-toggle="tooltip" data-placement="top" );return false;"> <i class="fa fa-trash"></i></a>';
                    }
                },

            },

        ],

    });

}

function editScrapper(id) {
    _preloader('show');
    $.ajax({
        url: "/get_scrapper_details_by_id", data: {"id": id}, dataType: "json", dataSrc: "", success: function (data) {
            $("#username").val(data.data.username);
            $("#password").val(data.data.password);
            $("#customer").val(data.data.customer);
            $("#url").val(data.data.url);
            $("#scrper_id").val(data.data.id);
            $('#status').val(data.data.status);
            $('#period').val(data.data.period);
            $('#collection_name').val(data.data.collection_name);
            $('#cron_time').val(data.data.cron_time);
            $('#aggregation_time').val(data.data.aggregation_time);
            if (data.data.cronjob === true) {
                $("#cronjob").prop('checked', true);
            } else {
                $("#cronjob").prop('checked', false);
            }
            if (data.data.displayed_on_app === true) {
                $("#displayed_on_app").prop('checked', true);
            } else {
                $("#displayed_on_app").prop('checked', false);
            }
            $("#scrapperedit").modal("show");

            _preloader('hide');

        }

    })

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

function getScrapperMeters(scraperName, typ) {
    _preloader('show');
    $.ajax({
        url: "/get_scrapper_meters_by_name",
        data: {"scraper_name": scraperName, "type": typ},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            _preloader('hide');
            $('#meter_table').empty();
            $('#meter_table').append($('<tr>')
                .append($('<th>').append("S. No"))
                .append($('<th>').append("MeteringPointId"))
                .append($('<th>').append("Address"))
                .append($('<th>').append("Type"))
            )

            for (var i = 0; i < data.data.length; i++) {
                console.log(data[i]);
                $('#meter_table').append($('<tr>')
                    .append($('<td>').append(i + 1))
                    .append($('<td>').append(data.data[i].meteringPointId))
                    .append($('<td>').append(data.data[i].address))
                    .append($('<td>').append(data.data[i].type))
                )
            }
            $("#scrappermeters").modal("show");
        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })

}

function savescrapperfrom(data) {
    _preloader('show');
    $.ajax({
        method: "POST",
        url: "/save_scrapper_details_by_id",
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

function saveremarkfrom(data) {
    _preloader('show');
    $.ajax({
        method: "POST",
        url: "/lastdatainfo/save_remark_by_id",
        data: data,
        dataType: "json",
        dataSrc: "",
        success: function (data) {

            _preloader('hide');
            $("#remarksModal").modal("hide");
            window.location.reload();
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

function addScrapperFrom(data) {
    _preloader('show');
    $.ajax({
        method: "POST",
        url: "/add_scrapper_details",
        data: data,
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            _preloader('hide');
            window.location = 'scrapper_details';
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

function loadMongoCollection(page, perPage, collection, sort, fil) {
    _preloader('show');
    $.ajax({
        method: "POST",
        url: "/scrappers/load_mongo_collection",
        data: {"collection": collection, "page": page, "per_page": perPage, "sort": sort, "filter": fil},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            _preloader('hide');
            var start = ((data.page - 1) * data.per_page) + 1;
            var end = start + data.per_page - 1
            if (end > data.total) {
                end = data.total
            }
            if (start > data.total) {
                start = data.total
            }
            $('#total').html(data.total);
            $('#total1').html(data.total);

            $('#start').html(start);
            $('#start1').html(start);
            $('#start').attr('value', data.page);
            $('#start1').attr('value', data.page);


            $('#end').html(end);
            $('#end1').html(end);
            $('#per_page').html(data.per_page);
            $("#json").JSONView(data.json_data, {collapsed: true, nl2br: true,});
        },
        error: function (data) {
            _preloader('hide');
            swal({title: "Error!", text: data.responseJSON.message, type: "error", timer: 9000});
        }

    })

}

function pagination_right() {
    var pg = parseInt($("#start").attr('value'));
    var tt = parseInt($("#total").text());
    var p_pag = parseInt($("#per_page").text());
    var col = $("#collec_name").text();
    var sor = $("#sort_name").text();
    var filter_name = $("#filter_name").text();

    pg = pg + 1;
    if (((pg - 1) * p_pag) <= tt) {
        loadMongoCollection(pg, p_pag, col, sor, filter_name);
    }
}

function pagination_left() {
    var pg = parseInt($("#start").attr('value'));
    var col = $("#collec_name").text();
    var sor = $("#sort_name").text();
    var p_pag = parseInt($("#per_page").text());
    var filter_name = $("#filter_name").text();

    pg = pg - 1;
    if (pg >= 1) {
        loadMongoCollection(pg, p_pag, col, sor, filter_name);
    }
}

function pagination_right1() {
    var pg = parseInt($("#start1").attr('value'));
    var tt = parseInt($("#total1").text());
    var col = $("#collec_name").text();
    var sor = $("#sort_name").text();
    var p_pag = parseInt($("#per_page").text());
    var filter_name = $("#filter_name").text();

    pg = pg + 1;
    if (((pg - 1) * p_pag) <= tt) {
        loadMongoCollection(pg, p_pag, col, sor, filter_name);
    }
}

function pagination_left1() {
    var pg = parseInt($("#start1").attr('value'));
    var col = $("#collec_name").text();
    var sor = $("#sort_name").text();
    var p_pag = parseInt($("#per_page").text());
    var filter_name = $("#filter_name").text();

    pg = pg - 1;
    if (pg >= 1) {
        loadMongoCollection(pg, p_pag, col, sor, filter_name);
    }
}

function fill_Minforsyning_customers_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/minforsyning_customers_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Minforsyning_customers_table').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_Minforsyning_customers_datatable() {
    _preloader('show');
    $.ajax({
        url: "/scrappers/minforsyning_customers_data", dataType: "json", dataSrc: "", success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Minforsyning_customers_table').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        }, error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_Minforsyning_customers_meters_datatable(login_id) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/minforsyning_customers_meter_data",
        data: {"login_id": login_id},
        dataType: "json",
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Minforsyning_customers_meters').DataTable({
                searching: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }
    })
}

function fill_Minforsyning_meter_details_datatable(meter, format) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/minforsyning_meter_data",
        dataType: "json",
        data: {"meter": meter, "format": format},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Minforsyning_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_Minforsyning_raw_meter_details_datatable(meter) {
    _preloader('show');
    $.ajax({
        url: "/scrappers/minforsyning_meter_raw_data",
        dataType: "json",
        data: {"meter": meter},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#Minforsyning_meter_details').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

function fill_lastdata_details_datatable(c, day) {
    _preloader('show');
    $.ajax({
        url: "/lastdatainfo/datainfo_data",
        dataType: "json",
        data: {"type": c, 'days': day},
        dataSrc: "",
        success: function (data) {
            var columns = [];
            columnNames = Object.keys(data.headings);
            for (var i in columnNames) {
                columns.push({
                    data: columnNames[i], title: columnNames[i]
                });
            }
            $('#detail_data_table').DataTable({
                searching: true,
                destroy: true,
                lengthMenu: [10, 15, 25, 50, 100, 200, 500],
                data: data.rows,
                scrollX: true,
                columns: columns,
            }).columns.adjust();
            _preloader('hide');

        },
        error: function (data) {
            _preloader('hide');
            alert("Something went wrong!");
        }

    })
}

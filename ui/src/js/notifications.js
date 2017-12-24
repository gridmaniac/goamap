if ($('#notification').html()) {
    $.notify({
        icon: 'pe-7s-bell',
        message: $('#notification').html()
    },
    {
        type: $('#notification-type').html(),
        timer: 4000
    })
}
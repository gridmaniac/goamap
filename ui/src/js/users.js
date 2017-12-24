$('.user-remove').on('mousedown touchend', function() {
    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        location = '/users/remove/' + $(this).data('id')
    })
})

$('#user-remove-checked').click(() => {
    let ids = []
    
    $('.checkbox input:checked').not('#check-all').each(function() {
        ids.push($(this).val())
    })

    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        $.post('/users/remove', { data: ids }, () => {
            location.reload()
        })
    })
})
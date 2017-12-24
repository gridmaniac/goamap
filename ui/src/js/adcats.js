$('.adcat-remove').on('mousedown touchend', function() {
    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        location = '/adcats/remove/' + $(this).data('id')
    })
})

$('#adcat-remove-checked').click(() => {
    let ids = []
    
    $('.checkbox input:checked').not('#check-all').each(function() {
        ids.push($(this).val())
    })

    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        $.post('/adcats/remove', { data: ids }, () => {
            location.reload()
        })
    })
})
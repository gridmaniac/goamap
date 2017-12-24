$('.ad-remove').on('mousedown touchend', function() {
    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        location = '/ads/remove/' + $(this).data('id')
    })
})

$('#ad-remove-checked').click(() => {
    let ids = []
    
    $('.checkbox input:checked').not('#check-all').each(function() {
        ids.push($(this).val())
    })

    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        $.post('/ads/remove', { data: ids }, () => {
            location.reload()
        })
    })
})

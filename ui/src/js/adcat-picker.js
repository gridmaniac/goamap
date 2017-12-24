$('#adcat-picker').on('shown.bs.modal', () => {
    $('#adcat-search').focus()
})

$('#adcat-search').on('keyup', function() {
    if ($(this).val().length > 0) {
        $.getJSON('/adcats/search/' + $(this).val(), function(data) {
            $('#adcats').empty()

            if (data.length > 0) {
                for (let adcat of data) {
                    $('#adcats').append(`<tr><td><i class="fa fa-archive text-success"></i></td><td><a class="adcat-pick" data-id="${adcat._id}" href="#">${adcat.title}</a></td></tr>`)
                }

                $('.adcat-pick').off('click').click(function() {
                    $('#adcat-picker').modal('hide')
                
                    let ids = []
                    
                    $('.checkbox input:checked').not('#check-all').each(function() {
                        ids.push($(this).val())
                    })
                
                    swal({
                        title: 'Вы уверены?',
                        type: 'warning',
                        showCancelButton: true,
                    }).then(() => {
                        $.post('/ads/move', { data: ids, to: $(this).data('id') }, () => {
                            location.reload()
                        })
                    })
                })

            } else {
                $('#adcats').append(`<tr><td></td><td>Нет результатов</td></tr>`)
            }
        })
    }
})


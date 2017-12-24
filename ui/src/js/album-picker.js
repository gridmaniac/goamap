$('#album-picker').on('shown.bs.modal', () => {
    $('#album-search').focus()
})

$('#album-search').on('keyup', function() {
    if ($(this).val().length > 0) {
        $.getJSON('/albums/search/' + $(this).val(), function(data) {
            $('#albums').empty()

            if (data.length > 0) {
                for (let album of data) {
                    $('#albums').append(`<tr><td><i class="fa fa-folder text-warning"></i></td><td><a class="album-pick" data-id="${album._id}" href="#">${album.title}</a></td></tr>`)
                }

                $('.album-pick').off('click').click(function() {
                    $('#album-picker').modal('hide')
                
                    let ids = []
                    
                    $('.checkbox input:checked').not('#check-all').each(function() {
                        ids.push($(this).val())
                    })
                
                    swal({
                        title: 'Вы уверены?',
                        type: 'warning',
                        showCancelButton: true,
                    }).then(() => {
                        $.post('/photos/move', { data: ids, to: $(this).data('id') }, () => {
                            location.reload()
                        })
                    })
                })

            } else {
                $('#albums').append(`<tr><td></td><td>Нет результатов</td></tr>`)
            }
        })
    }
})


$('#placetag-picker').on('shown.bs.modal', () => {
    $('#placetag-search').focus()
})

$('#placetag-search').on('keyup', function() {
    if ($(this).val().length > 0) {
        $.getJSON('/placetags/search/' + $(this).val(), function(data) {
            $('#placetags').empty()

            if (data.length > 0) {
                for (let placetag of data) {
                    $('#placetags').append(`<tr><td><i class="fa fa-folder text-warning"></i></td><td><a class="placetag-pick" data-id="${placetag._id}" href="#">${placetag.title}</a></td></tr>`)
                }

                $('.placetag-pick').off('click').click(function() {
                    $('#placetag-picker').modal('hide')
                
                    let ids = []
                    
                    $('.checkbox input:checked').not('#check-all').each(function() {
                        ids.push($(this).val())
                    })
                
                    swal({
                        title: 'Вы уверены?',
                        type: 'warning',
                        showCancelButton: true,
                    }).then(() => {
                        $.post('/places/move', { data: ids, to: $(this).data('id') }, () => {
                            location.reload()
                        })
                    })
                })

            } else {
                $('#placetags').append(`<tr><td></td><td>Нет результатов</td></tr>`)
            }
        })
    }
})


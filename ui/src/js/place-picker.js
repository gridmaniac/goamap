$('#place-picker').on('shown.bs.modal', () => {
    $('#place-search').focus()
})

$('#place-search').on('keyup', function() {
    if ($(this).val().length > 0) {
        $.getJSON('/places/search/' + $(this).val(), function(data) {
            $('#places').empty()

            if (data.length > 0) {
                for (let place of data) {
                    $('#places').append(`<tr><td><a class="place-pick" data-id="${place._id}" data-title="${place.title}" href="#">${place.title}</a></td></tr>`)
                }

                $('.place-pick').off('click').click(function() {
                    $('#place-picker').modal('hide')
                
                    $('#select-place a').html($(this).data('title'))
                    $('#resource').val($(this).data('id'))
                })

            } else {
                $('#places').append(`<tr><td>Нет результатов</td></tr>`)
            }
        })
    }
})

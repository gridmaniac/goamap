$('#photo-selector').on('shown.bs.modal', () => {
    $('#photo-search').focus()
})

$('#photo-search').on('keyup', function() {
    if ($(this).val().length > 0) {
        $.getJSON('/photos/search/' + $(this).val(), function(data) {
            $('#photos').empty()

            if (data.length > 0) {
                for (let photo of data) {
                    $('#photos').append(`<tr><td><div class="img-container"><a data-fancybox="gallery" href="/photo/${photo._id}"><img src="/photo/${photo._id}"></a></div></td><td><a class="photo-pick" data-id="${photo._id}" href="#">${photo.title}</a></td></tr>`)
                }

                $('.photo-pick').off('click').click(function() {
                    $('#photo-selector').modal('hide')

                    const id = $(this).data('id')
                
                    $('.note-image-url').val('/photo/' + id)
                })

            } else {
                $('#photos').append(`<tr><td></td><td>Нет результатов</td></tr>`)
            }
        })
    }
})


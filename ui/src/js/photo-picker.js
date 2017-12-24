$('#photo-picker').on('shown.bs.modal', () => {
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
                    $('#photo-picker').modal('hide')

                    const id = $(this).data('id')
                
                    let photos = $('[name="photos"]').val().split(',')
                    photos.push(id)

                    $('[name="photos"]').val(photos.filter(x => x).join(','))
                    
                    $('#photos-container').append(`
                        <a class="photo" data-id="${id}" data-fancybox="gallery" href="/photo/${id}">
                            <img src="/photo/${id}">
                        </a>
                    `)
                })

            } else {
                $('#photos').append(`<tr><td></td><td>Нет результатов</td></tr>`)
            }
        })
    }
})


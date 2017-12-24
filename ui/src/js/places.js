$('.place-remove').on('mousedown touchend', function() {
    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        location = '/places/remove/' + $(this).data('id')
    })
})

$('#place-remove-checked').click(() => {
    let ids = []
    
    $('.checkbox input:checked').not('#check-all').each(function() {
        ids.push($(this).val())
    })

    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        $.post('/places/remove', { data: ids }, () => {
            location.reload()
        })
    })
})

let hold = null

$('.photo').on('mousedown', function() {
    const id = $(this).data('id')
    hold = setInterval(() => {
        
        swal({
            title: 'Вы уверены?',
            type: 'warning',
            showCancelButton: true,
        }).then(() => {
            /*$.post('/places/remove', { data: ids }, () => {
                location.reload()
            })*/

            alert(id)
        })

        clearInterval(hold)
    }, 700)
})

$('.photo').on('mouseup', () => {
    clearInterval(hold)
})

$('#upload-photos').click(function() {
    $('#photo-files').trigger('click')
})

$('#photo-files').on('change', function () {
    const files = $('#photo-files')[0].files
    if (files.length > 10) {
        swal(
            'Ошибка!',
            'Одновременно можно загружать до 10 файлов',
            'error'
        )

        $('#photo-files').val('')
    } else if (!$('[name="title"]').val()) {
        swal(
            'Ошибка!',
            'Укажите название места',
            'error'
        )
        
        $('#photo-files').val('')
    } else {
        let promises = []

        for (let file of files) {
            promises.push(() => new Promise((resolve) => {
                let photo = {
                    name: file.name
                }

                const reader = new FileReader()
                reader.onload = (e) => {
                    photo.content = e.target.result
                    photo.placetag = $('#photos-container').data('placetag')
                    photo.title = $('[name="title"]').val()
                    
                    $.post('/photos/push', { data: photo }, (data) => {
                        let photos = $('[name="photos"]').val().split(',')
                        photos.push(data)

                        $('[name="photos"]').val(photos.filter(x => x).join(','))
                       
                        $('#photos-container').append(`
                            <a class="photo" data-id="${data}" data-fancybox="gallery" href="/photo/${data}">
                                <img src="/photo/${data}">
                            </a>
                        `)
                        resolve()
                    })
                }

                reader.readAsDataURL(file)
            }))
        }

        promises.reduce((p, x) => p.then(x), Promise.resolve()).then(() => {
            swal(
                'Успешно!',
                'Фотографии добавлены. Требуется сохранение.',
                'success'
            )
        })
    }
})

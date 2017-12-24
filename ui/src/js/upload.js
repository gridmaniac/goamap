const batch = Math.floor(Math.random() * (9999999 - 1000000) + 1000000)

$('#guide-file').on('change', function () {
    const reader  = new FileReader()

    reader.onload = (e) => {
        var dataUri = e.target.result
        
        $('input[name="icon"]').val(dataUri)
        $('#guide-img').attr('src' ,dataUri)
    }

    const files = $('#guide-file')[0].files;
    if (files[0].size < 64000) {
        reader.readAsDataURL($('#guide-file')[0].files[0])
        swal(
            'Успешно!',
            'Иконка обновлена. Требуется сохранение.',
            'success'
        )
    } else {
        swal(
            'Ошибка!',
            'Размер иконки должен быть не более 64 КБ.',
            'error'
        )
    }
})

$('#upload-start').click(() => {
    const files = $('[name="photos"]')[0].files
    if (files.length > 50) {
        swal(
            'Ошибка!',
            'Одновременно можно загружать до 50 файлов',
            'error'
        )
    } else {
        let promises = [],
            progress = 0

        const showProgress = () => {
            progress++

            const coef = 100 / promises.length,
                  percent = progress * coef

            $('#progress').stop().animate({
                width: percent + '%'
            }, 300)
        }

        $('#upload-start').hide()
        $('#upload-start-fake').show()

        for (let file of files) {
            promises.push(() => new Promise((resolve) => {
                let photo = {
                    name: file.name
                }

                const reader = new FileReader()
                reader.onload = (e) => {
                    photo.content = e.target.result
                    photo.album = $('#album').val()

                    if ($('#batch-flag').prop('checked')) {
                        photo.batch = batch
                    }

                    $.post('/photos', { data: photo }, () => {
                        showProgress()
                        resolve()
                    })
                }
    
                reader.readAsDataURL(file)
            }))
        }
        
        promises.reduce((p, x) => p.then(x), Promise.resolve()).then(() => {
            if ($('#batch-flag').prop('checked')) {
                location = '/batch/' + batch
            } else {
                location.reload()
            }
        })
    }
})
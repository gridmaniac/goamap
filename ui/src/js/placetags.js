$('#placetag-icon').click(function() {
    $('#placetag-file').trigger('click')
})

$('#placetag-file').on('change', function () {
    const reader  = new FileReader()

    reader.onload = (e) => {
        var dataUri = e.target.result
        
        $('input[name="icon"]').val(dataUri)
        $('#placetag-img').attr('src', dataUri)
    }

    const files = $('#placetag-file')[0].files;
    if (files[0].size < 64000) {
        reader.readAsDataURL($('#placetag-file')[0].files[0])
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

$('.placetag-remove').on('mousedown touchend', function() {
    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        location = '/placetags/remove/' + $(this).data('id')
    })
})

$('#placetag-remove-checked').click(() => {
    let ids = []
    
    $('.checkbox input:checked').not('#check-all').each(function() {
        ids.push($(this).val())
    })

    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        $.post('/placetags/remove', { data: ids }, () => {
            location.reload()
        })
    })
})
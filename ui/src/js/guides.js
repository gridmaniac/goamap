$('#guide-icon').click(function() {
    $('#guide-file').trigger('click')
})

$('#guide-file').on('change', function () {
    const reader  = new FileReader()

    reader.onload = (e) => {
        var dataUri = e.target.result
        
        $('input[name="icon"]').val(dataUri)
        $('#guide-img').attr('src', dataUri)
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

if ($('.dd').length > 0) {
    $.getJSON('/guides/json', function(guides) {
        let items = []
        for (let guide of guides) {
            const item = {
                id: guide._id,
                content: `${guide.title}
                <span class="pull-right guide-remove fa fa-trash-o text-danger"></span>
                <span class="pull-right guide-open fa fa-pencil-square-o text-success"></span>`
            }
            
            if (guide.parent) {
                item.parent_id = guide.parent
            }

            items.push(item)
        }

        for (let item of items) {
            if (item.parent_id) {
                let parent =
                    items.filter(x => item.parent_id == x.id)[0]
                
                if (parent) {
                    if (!parent.children)
                        parent.children = []

                    parent.children.push(item)
                    item.duplicate = true
                }
            }
        }

        const json = items.filter(x => {
            return !x.duplicate
        })

        $('.dd').nestable({
            json,
            callback: l => {
                $.post('/guides/reorder', { data: l.nestable('toArray') })
            }
        })

        $('.guide-open').on('mousedown touchend', function() {
            location = '/guides/' + $(this).closest('li').data('id')
        })

        $('.guide-remove').on('mousedown touchend', function() {
            swal({
                title: 'Вы уверены?',
                type: 'warning',
                showCancelButton: true,
            }).then(() => {
                location = '/guides/remove/' + $(this).closest('li').data('id')
            })
        })
    })
}

$('[name="guides"]').change(function() {
    $('.resource').hide()

    switch($(this).val()) {
        case 'article':
            $('#select-article').show()
            break
        case 'place':
            $('#select-place').show()
            break
        case 'hyperlink':
            $('#hyperlink').show()
            break
    }
})

$('#set-hyperlink').on('input', function() {
    $('#resource').val($(this).val())
})
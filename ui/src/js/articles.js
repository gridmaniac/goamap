$('.article-remove').on('mousedown touchend', function() {
    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        location = '/articles/remove/' + $(this).data('id')
    })
})

$('#article-remove-checked').click(() => {
    let ids = []
    
    $('.checkbox input:checked').not('#check-all').each(function() {
        ids.push($(this).val())
    })

    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        $.post('/articles/remove', { data: ids }, () => {
            location.reload()
        })
    })
})

$('.summernote').summernote({
    callbacks: {
        onChange: (contents) => {
            $('#content').val(contents)
        }
    }
})

$('.summernote').summernote('code', $('#content').val())

$('<br><a href="#" class="btn btn-success" data-toggle="modal" data-target="#photo-selector">Выбрать</a>').insertAfter('.note-group-image-url')
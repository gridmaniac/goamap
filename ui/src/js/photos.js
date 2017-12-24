$('.photo-remove').on('mousedown touchend', function() {
    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        location = '/photos/remove/' + $(this).data('id')
    })
})

$('#photo-remove-checked').click(() => {
    let ids = []
    
    $('.checkbox input:checked').not('#check-all').each(function() {
        ids.push($(this).val())
    })

    swal({
        title: 'Вы уверены?',
        type: 'warning',
        showCancelButton: true,
    }).then(() => {
        $.post('/photos/remove', { data: ids }, () => {
            location.reload()
        })
    })
})

$('#update-photo').on('change', function () {
    const reader  = new FileReader()

    reader.onload = (e) => {
        var dataUri = e.target.result
        
        $('#preview').val(dataUri)
        $('.image-preview img').attr('src', dataUri)
        $('.image-preview a').attr('href', dataUri)
    }

    const files = $('#update-photo')[0].files;
    reader.readAsDataURL($('#update-photo')[0].files[0])
})
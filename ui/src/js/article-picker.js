$('#article-picker').on('shown.bs.modal', () => {
    $('#article-search').focus()
})

$('#article-search').on('keyup', function() {
    if ($(this).val().length > 0) {
        $.getJSON('/articles/search/' + $(this).val(), function(data) {
            $('#articles').empty()

            if (data.length > 0) {
                for (let article of data) {
                    $('#articles').append(`<tr><td><a class="article-pick" data-id="${article._id}" data-title="${article.title}" href="#">${article.title}</a></td></tr>`)
                }

                $('.article-pick').off('click').click(function() {
                    $('#article-picker').modal('hide')
                
                    $('#select-article a').html($(this).data('title'))
                    $('#resource').val($(this).data('id'))
                })

            } else {
                $('#articles').append(`<tr><td>Нет результатов</td></tr>`)
            }
        })
    }
})
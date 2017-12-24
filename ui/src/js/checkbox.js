$('#check-all').change(function() {
    if ($(this).prop('checked'))
        $('[type="checkbox"]').not(this).checkbox('check')
    else
        $('[type="checkbox"]').not(this).checkbox('uncheck')
})

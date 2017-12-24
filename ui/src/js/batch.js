$('[name="album"]').each(function() {
    const awesomplete = new Awesomplete(this, {
        minChars: 2,
        autoFirst: true,
        maxItems: 10
    })

    $(this).on('input', function() {
        $.getJSON('/albums/search/' + $(this).val(), (data) => {
            awesomplete.list = data.map(x => x.title)
        })
    })
})

$('[name="placetag"]').each(function() {
    const awesomplete = new Awesomplete(this, {
        minChars: 2,
        autoFirst: true,
        maxItems: 10
    })

    $(this).on('input', function() {
        $.getJSON('/placetags/search/' + $(this).val(), (data) => {
            awesomplete.list = data.map(x => x.title)
        })
    })
})

$('[name="place"]').each(function() {
    const awesomplete = new Awesomplete(this, {
        minChars: 2,
        autoFirst: true,
        maxItems: 10
    })

    $(this).on('input', function() {
        $.getJSON('/places/search/' + $(this).val(), (data) => {
            awesomplete.list = data.map(x => x.title)
        })
    })
})

if ($('#map').length > 0) {
    const place = {
        lat: +$('#latitude').val(),
        lng: +$('#longitude').val()
    }
    
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: $('#map').data('zoom'),
        center: place
    })
    
    const marker = new google.maps.Marker({
        position: place,
        map: map,
        icon: $('#map').data('icon')
    })
    
    google.maps.event.addListener(map, 'click', (event) => {
        $('#latitude').val(event.latLng.lat())
        $('#longitude').val(event.latLng.lng())
                    
        marker.setPosition(event.latLng)
    })
}

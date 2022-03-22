const locations = JSON.parse(document.querySelector('#map')?.dataset.locations);

console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoidXphaXJiYWlnIiwiYSI6ImNrdnBnMjMxMzFybmwycGtsd2NlajJvbngifQ.zwT5_8B-tYw1q7EOY9zBog';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/uzairbaig/ckvpkf3vi7ken14pf0pro1u27',
  scrollZoom: false,
  zoom: 10,
  interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  const mark = document.createElement('div');
  mark.classList.add('marker');
  new mapboxgl.Marker({
    element: mark,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});

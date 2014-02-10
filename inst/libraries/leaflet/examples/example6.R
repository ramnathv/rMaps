require(rMaps)
map6 = Leaflet$new()
map6$setView(c(45.372, -121.6972), 12)
map6$tileLayer(provider ='Stamen.Terrain')
map6$marker(c(45.3288, -121.6625), bindPopup = 'Mt. Hood Meadows')
map6$marker(c(45.3311, -121.7113), bindPopup = 'Timberline Lodge')
map6
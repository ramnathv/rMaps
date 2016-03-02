# rMaps

rMaps is an R package to create, customize and publish interactive maps from R. It supports multiple mapping libraries, including [leaflet](http://leafletjs.com), [datamaps](http://datamaps.github.io) and [crosslet](http://sztanko.github.io/crosslet/)

## Installation

You can install `rMaps` from github using the `devtools` package. You will also need to install `base64enc`, the `dev` version of `rCharts`, that contains several experimental features, required by `rMaps`.

```S
require('base64enc')
require('devtools')
install_github('ramnathv/rCharts@dev')
install_github('ramnathv/rMaps')
```

## Quick Start

Here are some quick examples to get you started. 

__Example 1: CrossLet__

[CrossLet](http://sztanko.github.io/crosslet/) is an amazing mappling library that combines Leaflet and CrossFilter, allowing one to create awesome visualizations. `rMaps` wraps CrossLet and provides R users with a simple interface to access its features.

```S
library(rMaps)
crosslet(
  x = "country", 
  y = c("web_index", "universal_access", "impact_empowerment", "freedom_openness"),
  data = web_index
)
```

<img src='http://i.imgur.com/zQ6mixC.png?1' width=100%></img>

[Click to see Interactive Map](http://bl.ocks.org/ramnathv/raw/8970935/mymap.html)

__Example 2: DataMaps__

[DataMaps](http://datamaps.github.io) uses [D3.js](http://d3js.org) to create customizable SVG map visualizations in a single Javscript file. rMaps provides a simple wrapper around DataMaps and also extends its features using AngularJS.

```S
ichoropleth(Crime ~ State, data = subset(violent_crime, Year == 2010))
ichoropleth(Crime ~ State, data = violent_crime, animate = "Year")
ichoropleth(Crime ~ State, data = violent_crime, animate = "Year", play = TRUE)
```

<img src='https://f.cloud.github.com/assets/346288/2117416/ab4aaaf6-90ca-11e3-8f3a-b03b8021737e.png' width=100%></img>

__Example 3: Leaflet__

```S
map <- Leaflet$new()
map$setView(c(51.505, -0.09), zoom = 13)
map$tileLayer(provider = 'Stamen.Watercolor')
map$marker(
  c(51.5, -0.09),
  bindPopup = 'Hi. I am a popup'
)
map
```

<img src='http://i.imgur.com/zF4EDx2.png' width=100%></img>




### Credits

rMaps would have not been possible without these amazing mapping libraries written in javascript

1. [Leaflet](http://leafletjs.com)
2. [DataMaps](http://datamaps.github.io)
3. [CrossLet](http://sztanko.github.io/crosslet/)

### License

rMaps is licensed under the MIT License. However, the JavaScript charting libraries that are included with this package are licensed under their own terms. All of them are free for non-commercial and commercial use. For more details on the licensing terms, you can consult the `License.md` file in each of the charting libraries.


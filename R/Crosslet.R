crosslet = function(x, y, data, active = y[1], map = 'world'){
  L1 <- Crosslet$new()
  L1$set(
    scope = map,
    data = toJSONArray2(data, json = F),
    id_field = x,
    dimensions = make_dimensions(data[names(data) != x]),
    defaults = list(
      order = y,
      active = active
    )
  )
  return(L1)
}
Crosslet = setRefClass('Crosslet', contains = 'rCharts', methods = list(
  initialize = function(){
    callSuper()
    lib <<- 'crosslet'; 
    LIB <<- get_lib(system.file('libraries', 'crosslet', package = 'rMaps'))
    templates$chartDiv <<-'<div id="content" class="container"><div id="map"></div></div>'
    templates$script <<- system.file('libraries', 'crosslet', 'layouts', 'chart.html', package = 'rMaps')
  },
  getPayload = function(chartId){
    dimensions = toJSON2(params$dimensions)
    chartParams = rjson::toJSON(params[names(params) != 'dimensions'])
    list(chartParams = chartParams, dimensions = dimensions, lib = lib, 
      liburl = LIB$url
    )
  }
))


make_dimensions <- function(data){
  dimensions = lapply(names(data), function(x){
    list(
      title = x,
      data = list(
        dataSet = "#! params.data !#",
        field = x
      )
    )
  })
  names(dimensions) = colnames(data)
  return(dimensions)
}

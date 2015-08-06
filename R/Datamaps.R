Datamaps = setRefClass('Datamaps', contains = 'rCharts', methods = list(
  initialize = function(){
    callSuper();
    LIB <<- get_lib(system.file('libraries', 'datamaps', package = 'rMaps'))
  },
  getPayload = function(chartId){
    params_ = params[!(names(params) %in% "popup_template")]
    list(
      chartParams = toJSON2(params_), 
      chartId = chartId, lib = basename(lib),
      popup_template = params$popup_template
    )
  }  
))



makeChoroData <- function(x, data, pal, map = 'usa'){
  fml = lattice::latticeParseFormula(x, data = data)
  if (!is.null(fml$condition)){
    data = dlply(data, names(fml$condition))
  }
  return(data)
}

processChoroData <- function(x, data, pal, map = 'usa', ...){
  fml = lattice::latticeParseFormula(x, data = data)
  data = transform(data, fillKey = fml$left)
  mypal = RColorBrewer::brewer.pal(length(unique(fml$left)), pal)
  list(
    scope = map,
    fills = as.list(setNames(mypal, unique(fml$left))),
    data = dlply(data, fml$right.name),
    ...
  )
}


#' Draw an interactive choropleth map
#' 
#' 
#' 
ichoropleth <- function(x, data, pal = "Blues", ncuts = 5, animate = NULL, play = F, map = 'usa', legend = TRUE, labels = TRUE, ...){
  d <- Datamaps$new()
  fml = lattice::latticeParseFormula(x, data = data)
  data = transform(data, 
    fillKey = cut(
      fml$left, 
      quantile(fml$left, seq(0, 1, 1/ncuts)),
      ordered_result = TRUE,
      include.lowest = TRUE
    )
  )
  fillColors = brewer.pal(ncuts, pal)
  d$set(
    scope = map, 
    fills = as.list(setNames(fillColors, levels(data$fillKey))), 
    legend = legend,
    labels = labels,
    ...
  )
  if (!is.null(animate)){
    range_ = summary(data[[animate]])
    data = dlply(data, animate, function(x){
      y = toJSONArray2(x, json = F)
      names(y) = lapply(y, '[[', fml$right.name)
      return(y)
    })
    d$set(
      bodyattrs = "ng-app ng-controller='rChartsCtrl'"  
    )
    d$addAssets(
      jshead = "http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.1/angular.min.js"
    )
    if (play == T){
      d$setTemplate(chartDiv = sprintf("
        <div class='container'>
         <button ng-click='animateMap()'>Play</button>
         <span ng-bind='year'></span>
         <div id='{{chartId}}' class='rChart datamaps'></div>
        </div>
        <script>
          function rChartsCtrl($scope, $timeout){
            $scope.year = %s;
              $scope.animateMap = function(){
              if ($scope.year > %s){
                return;
              }
              map{{chartId}}.updateChoropleth(chartParams.newData[$scope.year]);
              $scope.year += 1
              $timeout($scope.animateMap, 1000)
            }
          }
       </script>", range_[1], range_[6])
      )
      
    } else {
      d$setTemplate(chartDiv = sprintf("
        <div class='container'>
          <input id='slider' type='range' min=%s max=%s ng-model='year' width=200>
          <span ng-bind='year'></span>
          <div id='{{chartId}}' class='rChart datamaps'></div>          
        </div>
        <script>
          function rChartsCtrl($scope){
            $scope.year = %s;
            $scope.$watch('year', function(newYear){
              map{{chartId}}.updateChoropleth(chartParams.newData[newYear]);
            })
          }
       </script>", range_[1], range_[6], range_[1])
      )
    }
    d$set(newData = data, data = data[[1]])
    
  } else {
    d$set(data = dlply(data, fml$right.name))
  }
  return(d)
}

# choropleth <- function(x, data, pal, map = 'usa', ...){
#   fml = lattice::latticeParseFormula(x, data = data)
#   data = transform(data, fillKey = fml$left)
#   mypal = RColorBrewer::brewer.pal(length(unique(fml$left)), pal)
#   d <- Datamaps$new()
#   d$set(
#     scope = map,
#     fills = as.list(setNames(mypal, unique(fml$left))),
#     data = dlply(data, fml$right.name),
#     ...
#   )
#   return(d)
# }
# 
# choropleth2 <- function(x, data, pal, map = 'usa', ...){
#   data1 = makeChoroData(x, data, pal, map, ...)
#   data2 = llply(data1, processChoroData, x = x, pal, map, ...)
#   d <- Datamaps$new()
#   d$setTemplate(
#     script =  system.file('libraries', 'datamaps', 'layouts', 
#                           'chart2.html', package = 'rCharts')  
#   )
#   d$set(map = data2)
#   return(d)
# }


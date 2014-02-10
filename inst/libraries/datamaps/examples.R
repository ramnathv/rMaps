require(rCharts)
d <- rCharts$new()
d$setLib('datamaps')
d$set(
  scope = 'usa',
  fills = fills,
  data = data1
)


fills = list(
  REP = "#CC4731",
  DEM = "#306596",
  HEAVY_DEM = "#667FAF",
  LIGHT_DEM = "#A9C0DE",
  HEAVY_REP = "#EAA9A8",
  LIGHT_REP = "#EDDC4E",
  defaultFill = "#EDDC4E"
)

geographyConfig = list(popupTemplate = '#!  _.template('<div class="hoverinfo"><strong><%= geography.properties.name %></strong> <% if (data.electoralVotes) { %><hr/>  Electoral Votes: <%= data.electoralVotes %> <% } %></div>' !#')



require(RColorBrewer)


# read data and replace dots in names with underscores
obesity = read.csv(
  'http://www.stat.berkeley.edu/classes/s133/data/obesity.csv',
  stringsAsFactors = F
)
names(obesity) = gsub("\\.", "_", names(obesity))

# add column with two letter state names and 
obesity = plyr::mutate(obesity, 
  State = str_trim(State),
  state = state.abb[match(State, state.name)],
)
rCharts::choropleth(
  cut(Adult_Obesity_Rate, 5, labels = F) ~ state,
  data = obesity,
  pal = 'PuRd'
)



choropleth <- function(x, data, pal){
  fml = lattice::latticeParseFormula(x, data = data)
  data = transform(data, fillKey = fml$right)
  mypal = RColorBrewer::brewer.pal(length(unique(fml$right)), pal)
  d <- rCharts$new()
  d$setLib('datamaps')
  d$set(
    scope = 'usa',
    fills = as.list(setNames(mypal, unique(fml$right))),
    data = dlply(data, .(state))
  )
  return(d)
}


makeChoroData <- function(x, data, pal, map = 'usa'){
  fml = lattice::latticeParseFormula(x, data = data)
  dlply(transform(data, fillKey = fml$right), fml$right.name)
}

pal = RColorBrewer::brewer.pal(6, 'Blues')

d <- rCharts::rCharts$new()
d$setLib('datamaps')
d$set(
  scope = 'usa',
  fills = as.list(setNames(pal, 0:5)),
  data = dlply(obesity, .(state))
)

d <- rCharts::rCharts$new()
d$setLib('datamaps')
d$set(
  scope = 'county',
  geographyConfig = list(
    datUrl = "/datamaps/data/county.json"
  )
)


d <- rCharts::rCharts$new()
d$setLib('datamaps')
d$set(
  scope = 'world',
  projection = 'mercator'
)


dat <- unemp$long.mnth
dat = mutate(dat, 
  state = state.abb[match(State, state.name)]
)

pal = RColorBrewer::brewer.pal(6, 'PuRd')

d <- rCharts::rCharts$new()
d$setLib('datamaps')
d$set(
  scope = 'usa',
  fills = as.list(setNames(pal, 0:5)),
  data = dlply(subset(dat,  Year == 2012), .(state))
)

require(shiny)
require(rCharts)
runApp(list(
  ui = pageWithSidebar(
    headerPanel('rCharts with Datamaps'),
    sidebarPanel(
      sliderInput("year", label = "Year", 
        min = 1980, max = 2012, 1980, animate = T)  
    ),
    mainPanel(
      showOutput("mymap", "datamaps")  
    )
  ),
  server = function(input, output){
    output$mymap <- renderChart2({
      pal = RColorBrewer::brewer.pal(6, 'Blues')
      d <- rCharts::rCharts$new()
      d$setLib('datamaps')
      d$set(
        scope = 'usa',
        fills = as.list(setNames(pal, 0:5)),
        data = dlply(subset(dat,  Year == input$year), .(state))
      )
      d
    })
  }
  
))


require(shiny)
require(rCharts)
runApp(list(
  ui = pageWithSidebar(
    headerPanel('rCharts with Datamaps'),
    sidebarPanel(
      sliderInput("year", label = "Year", 
        min = 1981, max = 2012, 1981, animate = T
      )  
    ),
    mainPanel(
      showOutput("mymap", "datamaps")  
    )
  ),
  server = function(input, output){
    output$mymap <- renderChart2({
      unemp <- read.csv("http://mgcr271.github.io/data/unemp.csv")
      rCharts::choropleth(
        cut(unemp_rate, c(0, 2, 4, 8, 18), labels = F) ~ state,
        data = subset(unemp, Year == input$year),
        pal = 'Blues'
      )
    })
  }
))
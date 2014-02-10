barChart=function() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 5, right: 10, bottom: 20, left: 10},
        x,
        //y = d3.scale.log().clamp(true).range([20, 0]),
        y = d3.scale.pow().exponent(0.01).clamp(true).range([20, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round,
        tickFormat,
        tickSize,
        filter=null,
        name_id,
        status,
        fill;

    function chart(div) {
      
     //debugger;
      var width = x.range()[1],
          height = y.range()[0];
      //debugger;
      y.domain([group.top(1)[0].value/100, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
          var svg = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("id",name_id)
              if(fill)
              {
              fill_svg=svg.append("defs").append("linearGradient").attr("id","lg-"+id)
               .attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%")
               var rr=x.copy().domain([0,20]).range(x.range)
               for(var i=0;i<20;i++)
               {
                fill_svg.append("stop").attr("stop-color",fill(i)).attr("offset",i*5+"%").attr("stop-opacity","1")
               }
             }
           /*
             <defs>
    <linearGradient id="myLinearGradient1"
                    x1="0%" y1="0%"
                    x2="0%" y2="100%"
                    spreadMethod="pad">
      <stop offset="0%"   stop-color="#00cc00" stop-opacity="1"/>
      <stop offset="100%" stop-color="#006600" stop-opacity="1"/>
    </linearGradient>
  </defs>
           */
           g=svg.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
          /*status=svg.append("text").attr("class","title").attr("x",width-margin.left).attr("y",10)
          .attr("width",150)
          .attr("height",20).text("")*/
          if(filter)
            status.text(axis.tickFormat()(filter[0])+" - "+axis.tickFormat()(filter[1]))
          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")")
              .attr("fill","url(#lg-"+id+")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        //console.log("ha")
        while (++i < n) {
          d = groups[i];
          //console.log(d.value +" - "+ y(d.value))
          //debugger;
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h4.5V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      //div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      
        dimension.filterRange(extent);
        filter=extent
      if(extent[1]-extent[0]>0)    
        {
          if(status)
           status.text(axis.tickFormat()(extent[0])+" - "+axis.tickFormat()(extent[1]))
      }
      else
      {
        if(status)
          status.text("")
      }
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        //div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
        filter=null
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.tickFormat = function(_) {
      if (!arguments.length) return tickFormat;
      tickFormat = _;
      axis.tickFormat(tickFormat)
      return chart;
    };

    chart.name_id = function(_) {
      if (!arguments.length) return name_id;
      name_id = _;
      return chart;
    };

    chart.ticks = function(a) {
      if (!arguments.length) return tickSize;
      ticks = a;
      if(a.length){
        axis.tickValues(ticks);
        //console.log(ticks);
        }
      else
        axis.ticks(ticks);
      return chart;
    };
    
    chart.fill = function(_) {
      if (!arguments.length) return fill;
      fill = _;
      return chart;
    };


    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (!arguments.length) return filter;
      if (_) {
        filter=_
        brush.extent(_);
        dimension.filterRange(_);
        if(status)
               status.text(axis.tickFormat()(filter[0])+" - "+axis.tickFormat()(filter[1]))
      } else {
        brush.clear();
        filter=null
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  };
  // Generated by CoffeeScript 1.6.3
var crosslet;

crosslet = {};

if (!_) {
  console.log("Please include underscore.js");
}

crosslet.createConfig = function(defaultConfig, config) {
  var c;
  return c = jQuery.extend(true, jQuery.extend(true, {}, defaultConfig), config);
};

crosslet.id = function(d) {
  return d;
};

crosslet.idf = function(d) {
  return crosslet.id;
};

crosslet.notimplemented = function() {
  throw "This function is not set. Please check your config.";
};

crosslet.changeSelect = function(select, val) {
  return $(select).find("option").filter(function() {
    return $(this).val() === val;
  }).attr('selected', true);
};

crosslet.defaultConfig = {
  map: {
    leaflet: {
      url: "http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png",
      key: "--your key--",
      styleId: 64657,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright">ODbL</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
    },
    view: {
      center: [51.505, -0.09],
      zoom: 11
    },
    geo: {
      url: "please specify correct location of your geojson",
      name_field: "name",
      id_field: "code",
      topo_object: "please specify correct object name"
    }
  }
};

({
  data: {
    version: "1.0",
    id_field: "id"
  },
  dimensions: {},
  defaults: {
    colorscale: d3.scale.linear().domain([1, 10, 20]).range(["green", "yellow", "red"]).interpolate(d3.cie.interpolateLab),
    opacity: 0.75,
    order: []
  }
});

crosslet.defaultDimensionConfig = {
  p: {},
  filter: null,
  data: {
    interval: null,
    filter: null,
    field: function(d) {
      return d.id;
    },
    dataSet: crosslet.notimplemented,
    method: d3.tsv,
    preformat: function(dd) {
      return function(d) {
        return +d;
      };
    },
    ticks: 4,
    colorscale: d3.scale.linear().domain([1, 10, 20]).range(["green", "yellow", "red"]).interpolate(d3.cie.interpolateLab),
    exponent: 1
  },
  format: {
    short: function(d) {
      return d3.format(",.2f");
    },
    long: function(d) {
      return d.format.short(d);
    },
    input: function(d) {
      return d3.format(".2f");
    },
    axis: function(d) {
      return d.format.short(d);
    }
  },
  render: {
    legend: function(d, el) {
      var f, html;
      f = d.title ? d.title : d.data.field_func(d);
      html = '<h2>' + f + '</h2>';
      return el.html(html);
    },
    range: function(d, el) {
      var html;
      html = "<p><span class='m0'>" + d.format.short(d)(d.filter[0]) + "</span> &ndash; <span class='m1'>" + d.format.short(d)(d.filter[1]) + "</span></p>";
      return el.html(html);
    },
    form: function(d, el) {
      return d.render.legend(d, el);
    },
    rangeForm: function(d, el) {
      var html, size;
      size = _.max(_.map(d.data.interval, function(dd) {
        return ("_" + d.format.input(d)(dd)).length - 1;
      }));
      html = "Range: <input type='text' name='m0' size='" + size + "' value='" + d.format.input(d)(d.filter[0]) + "'> &ndash; <input type='text' name='m1' size='3' value='" + d.format.input(d)(d.filter[1]) + "'>";
      return el.html(html);
    }
  },
  submitter: function(d, el) {
    var out;
    out = {};
    $(el).find("input, select").each(function(index, el) {
      return out[$(el).attr("name")] = $(el).val();
    });
    return out;
  }
};
// Generated by CoffeeScript 1.6.3
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

crosslet.DataStore = (function() {
  DataStore.prototype.data = {};

  DataStore.prototype.geometries = null;

  DataStore.prototype.isGeoLoaded = false;

  DataStore.prototype.isDataLoaded = false;

  function DataStore(initData) {
    this.loadGeo = __bind(this.loadGeo, this);
    var _ref, _ref1;
    this.geoURL = initData.map.geo.url;
    this.version = initData.data.version;
    this.idField = (_ref = initData.data.id_field) != null ? _ref : "id";
    this.geoIdField = (_ref1 = initData.map.geo.id_field) != null ? _ref1 : "id";
    if (!window.dataloader) {
      window.dataloader = new crosslet.DataLoader();
    }
    this.l = window.dataloader;
  }

  DataStore.prototype.addData = function(data, callback) {
    var d, k, v, _i, _len;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      d = data[_i];
      if (!this.data[d[this.idField]]) {
        this.data[d[this.idField]] = {};
      }
      for (k in d) {
        v = d[k];
        if (v !== "" && !_.isNaN(+v)) {
          this.data[d[this.idField]][k] = +v;
        }
      }
    }
    this.isDataLoaded = true;
    if (callback) {
      return callback(data);
    }
  };

  DataStore.prototype.loadData = function(url, callback, method) {
    var _this = this;
    if (!method) {
      method = d3.tsv;
    }
    this.l.load(url, method, function(data) {
      return _this.addData(data, callback);
    });
    return this;
  };

  DataStore.prototype.get_bounds_topo = function(c) {
    var a, f, i, o, _i, _j, _len, _len1, _ref, _ref1;
    o = [];
    _ref = [_.min, _.max];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      f = _ref[_i];
      a = [];
      _ref1 = [0, 1];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        i = _ref1[_j];
        a.push(f(_.map(c, function(d) {
          return f(_.map(d.coordinates[0], function(dd) {
            return dd[i];
          }));
        })));
      }
      o.push(a);
    }
    return o;
  };

  DataStore.prototype.loadGeo = function(url, geoIdField, callback, topo_objectName) {
    var _this = this;
    return this.l.load(url, d3.json, function(t) {
      var f, _i, _len, _ref;
      if (t.arcs) {
        t = topojson.object(t, t.objects[topo_objectName]);
        _this.geometries = t.geometries;
      } else {
        _this.geometries = t.features;
      }
      _this.bounds = d3.geo.bounds(t);
      _ref = _this.geometries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        if (f.properties) {
          if (!_this.data[f.properties[_this.geoIdField]]) {
            _this.data[f.properties[_this.geoIdField]] = f.properties;
          } else {
            _this.data[f.properties[_this.geoIdField]] = jQuery.extend(true, _this.data[f.properties[_this.geoIdField]], f.properties);
          }
          _this.data[f.properties[_this.geoIdField]].bbox = d3.geo.bounds(f);
        }
      }
      _this.isGeoLoaded = true;
      if (callback) {
        callback(_this);
      }
      return _this;
    });
  };

  return DataStore;

})();

crosslet.DataLoader = (function() {
  DataLoader.prototype.cache = {};

  DataLoader.prototype.status = {};

  DataLoader.prototype.callbackList = {};

  function DataLoader(version) {
    if (!version) {
      version = 1 + ".0";
    }
    this.version = version;
    this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
  }

  DataLoader.prototype.load = function(url, method, callback) {
    var urlv,
      _this = this;
    urlv = url + this.version;
    if (!this.callbackList[urlv]) {
      this.callbackList[urlv] = [];
    }
    if (!this.status[urlv]) {
      this.status[urlv] = "init";
    }
    if (callback) {
      this.callbackList[urlv].push(callback);
    }
    if (__indexOf.call(this.cache, urlv) >= 0) {
      this.executeCallbacks(this.callbackList[urlv], this.cache[urlv]);
      return this;
    } else {
      if (this.status[urlv] !== "loading") {
        this.status[urlv] = "loading";
        method(url, function(data) {
          _this.cache[urlv] = data;
          _this.executeCallbacks(_this.callbackList[urlv], _this.cache[urlv]);
          _this.status[urlv] = "done";
          return _this;
        });
      }
    }
    return this;
  };

  DataLoader.prototype.executeCallbacks = function(list, data) {
    var _results;
    _results = [];
    while (list.length > 0) {
      _results.push(list.pop()(data));
    }
    return _results;
  };

  return DataLoader;

})();
// Generated by CoffeeScript 1.6.3
var _ref, _ref1,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

crosslet.PanelView = (function(_super) {
  __extends(PanelView, _super);

  function PanelView() {
    this.renderCubes = __bind(this.renderCubes, this);
    this.createCube = __bind(this.createCube, this);
    this.setActive = __bind(this.setActive, this);
    this._renderMap = __bind(this._renderMap, this);
    this.getSelection = __bind(this.getSelection, this);
    _ref = PanelView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  PanelView.prototype.initialize = function(el, config, parent) {
    var e, o, _i, _len, _ref1;
    this.config = crosslet.createConfig(crosslet.defaultConfig, config);
    this.parent = parent;
    this.el = el;
    this.ds = parent.ds;
    this.boxes = {};
    this.render();
    this.width = 200;
    this.active = this.config.defaults.active ? this.config.defaults.active : this.config.defaults.order[0];
    this.numloads = this.config.defaults.order.length;
    _ref1 = this.config.defaults.order;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      o = _ref1[_i];
      e = $("<div class='box'></div>");
      this.boxes[o] = new crosslet.BoxView(e, this.config.dimensions[o], this, o);
      $(this.el).append(e);
    }
    this.boxes[this.active].setActive(true);
    this.renderMap = _.debounce(this._renderMap, 300);
    return this.boxes;
  };

  PanelView.prototype.loaded = function() {
    this.numloads = this.numloads - 1;
    if (this.numloads <= 0) {
      return this.createCube();
    }
  };

  PanelView.prototype.getSelection = function() {
    var abox, adata, k, keys, out, _i, _len;
    abox = this.boxes[this.active];
    adata = abox.getFilteredData();
    keys = this.intersection(_.map(_.values(this.boxes), function(b) {
      return _.keys(b.getFilteredData()).sort();
    }));
    out = {};
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      k = keys[_i];
      out[k] = adata[k];
    }
    return out;
  };

  PanelView.prototype._renderMap = function() {
    var abox, f, out,
      _this = this;
    abox = this.boxes[this.active];
    out = this.getSelection();
    f = abox.config.format.long(abox.config);
    this.parent.renderMap(out, (function(v) {
      return abox.config.data.colorscale(abox.config.scale(v));
    }), function(data, value) {
      return data.properties[_this.config.map.geo.name_field] + " - " + f(value);
    });
    return this;
  };

  PanelView.prototype.setActive = function(activeBox) {
    if (activeBox !== this.active) {
      this.boxes[this.active].setActive(false);
      this.active = activeBox;
      this.boxes[this.active].setActive(true);
      return this.renderMap();
    }
  };

  PanelView.prototype.intersection = function(a) {
    var intersect_safe, o, out, _i, _len, _ref1;
    intersect_safe = function(a, b) {
      var ai, bi, result;
      ai = bi = 0;
      result = [];
      while (ai < a.length && bi < b.length) {
        if (a[ai] < b[bi]) {
          ai++;
        }
        if (a[ai] > b[bi]) {
          bi++;
        }
        if (a[ai] === b[bi]) {
          result.push(a[ai]);
          ai++;
          bi++;
        }
      }
      return result;
    };
    switch (a.length) {
      case 0:
        return a;
      case 1:
        return a[0];
      case 2:
        return intersect_safe(a[0], a[1]);
      default:
        out = a[0];
        _ref1 = a.slice(1);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          o = _ref1[_i];
          out = intersect_safe(out, o);
        }
        return out;
    }
  };

  PanelView.prototype.createCube = function() {
    var bName, box, brushevent, chart, d, dg, getRounder, groups, int, js_bName, js_box, key, keys, o, row, t1, t15, t2, yscale, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
    this.rows = [];
    t1 = new Date().getTime();
    keys = _.map(_.values(this.boxes), function(b) {
      return _.keys(b.data).sort();
    });
    t15 = new Date().getTime();
    int = this.intersection(keys);
    for (_i = 0, _len = int.length; _i < _len; _i++) {
      key = int[_i];
      row = {};
      _ref1 = this.boxes;
      for (bName in _ref1) {
        box = _ref1[bName];
        row[bName] = box.data[key];
      }
      this.rows.push(row);
    }
    t2 = new Date().getTime();
    this.cube = crossfilter(this.rows);
    getRounder = function(m1, m2, w, exp) {
      var scale, t;
      t = 5 * (m2 - m1) / w;
      scale = d3.scale.pow().exponent(exp).range([m1 / t, m2 / t]).domain([m1 / t, m2 / t]);
      return function(d) {
        return t * scale.invert(Math.floor(scale(+d / t)));
      };
    };
    groups = {};
    this.charts = {};
    brushevent = function(box, ctx) {
      return function() {
        box.event_click();
        return ctx.renderCubes();
      };
    };
    _ref2 = this.boxes;
    for (bName in _ref2) {
      box = _ref2[bName];
      var chart, js_box,js_bName;
      js_box = box;
      js_bName = bName;
      d = this.cube.dimension(function(dd) {
        return dd[bName];
      });
      dg = d.group(getRounder(box.config.data.interval[0], box.config.data.interval[1], this.width - 20, box.config.data.exponent));
      box.graph.empty();
      yscale = d3.scale.linear().clamp(true).range([20, 0]);
      chart = barChart().dimension(d).name_id(bName).group(dg).x(d3.scale.pow().exponent(box.config.data.exponent).domain(box.config.data.interval).rangeRound([0, this.width - 20])).y(yscale.copy()).ticks(box.config.data.ticks).tickFormat(box.config.format.axis(box.config)).fill(box.config.data.colorscale);
      chart.on("brush", brushevent(box, this));
      chart.on("brushend", this.renderCubes);
      box.chart = chart;
      this.charts[bName] = chart;
    }
    if (this.parent.ds.isGeoLoaded) {
      this.renderCubes();
    }
    _ref3 = this.config.defaults.order;
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      o = _ref3[_j];
      if (this.config.dimensions[o].filter) {
        this.boxes[o].setFilter(this.config.dimensions[o].filter, true);
      }
    }
    return this;
  };

  PanelView.prototype.renderCubes = function() {
    var abox, bName, box, _ref1;
    _ref1 = this.boxes;
    for (bName in _ref1) {
      box = _ref1[bName];
      box.chart(box.graph);
      $(box.el).on("mousedown", box.event_click);
      box.setFilter(box.chart.filter(), false);
    }
    abox = this.boxes[this.active];
    abox.setFilter(abox.chart.filter(), false);
    this.renderMap();
    return this;
  };

  return PanelView;

})(Backbone.View);

crosslet.BoxView = (function(_super) {
  __extends(BoxView, _super);

  function BoxView() {
    this.setFilter = __bind(this.setFilter, this);
    this.event_click = __bind(this.event_click, this);
    this.setActive = __bind(this.setActive, this);
    this.dataLoaded = __bind(this.dataLoaded, this);
    _ref1 = BoxView.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  BoxView.prototype.initialize = function(el, config, parent, name) {
    this.el = el;
    this.config = crosslet.createConfig(crosslet.defaultDimensionConfig, config);
    this.config.id = name;
    this.config.data.field_func = !_.isFunction(this.config.data.field) ? (function(d) {
      return d.data.field;
    }) : this.config.data.field;
    $(this.el).on("mousedown", this.event_click);
    $(this.el).on("tap", this.event_click);
    $(this.el)[0].onmousedown = $(this.el)[0].ondblclick = L.DomEvent.stopPropagation;
    this.legend = {};
    this.legend.all = $("<div class='legend'></div>");
    this.legend.text = $("<div class='legendText'></div>");
    this.legend.text_p = $("<div class='legendText_p'></div>");
    this.legend.text_range = $("<div class='legendText_range'></div>");
    this.legend.text.append(this.legend.text_p).append(this.legend.text_range);
    this.legend.form = $("<div class='legendForm'></div>");
    this.legend.form_p = $("<div class='legendForm_p'></div>");
    this.legend.form_range = $("<div class='legendForm_range'></div>");
    this.legend.form.append(this.legend.form_p).append(this.legend.form_range);
    this.legend.all.append(this.legend.text).append(this.legend.form);
    $(el).append(this.legend.all);
    this.graph = $("<div class='graph'></div>");
    $(el).append(this.graph);
    this.parent = parent;
    this.ds = parent.ds;
    this.active = false;
    this.name = name;
    return this.loadData();
  };

  BoxView.prototype.loadData = function() {
    if (_.isString(this.config.data.dataSet)) {
      return this.parent.ds.loadData(this.config.data.dataSet, this.dataLoaded, this.config.data.method);
    } else {
      if (_.isFunction(this.config.data.dataSet)) {
        return this.parent.ds.loadData(this.config.data.dataSet(this.config), this.dataLoaded, this.config.data.method);
      } else {
        return this.parent.ds.addData(this.config.data.dataSet, this.dataLoaded);
      }
    }
  };

  BoxView.prototype.dataLoaded = function() {
    var f, id, pd, preformatter, val, _ref2;
    this.data = {};
    f = this.config.data.field_func(this.config);
    preformatter = this.config.data.preformat(this.config);
    _ref2 = this.parent.ds.data;
    for (id in _ref2) {
      val = _ref2[id];
      if (_.isNumber(val[f])) {
        pd = preformatter(val[f]);
      }
      if (_.isNumber(pd)) {
        this.data[id] = pd;
      }
    }
    if (!this.config.data.interval) {
      this.config.data.interval = [_.min(_.values(this.data)), _.max(_.values(this.data))];
    }
    if (!this.config.filter) {
      this.config.filter = [_.min(_.values(this.data)), _.max(_.values(this.data))];
    }
    this.config.scale = d3.scale.pow().exponent(this.config.data.exponent).domain(this.config.data.interval).rangeRound([0, 20]);
    this.config.scale.name = "yes";
    this.render();
    return this.parent.loaded();
  };

  BoxView.prototype.setActive = function(isActive) {
    this.active = isActive;
    if (isActive) {
      return $(this.el).addClass("selected");
    } else {
      return $(this.el).removeClass("selected");
    }
  };

  BoxView.prototype.event_click = function(event) {
    if (!this.active) {
      this.parent.setActive(this.name);
    }
    return true;
  };

  BoxView.prototype.setFilter = function(f, redrawCube) {
    if (redrawCube == null) {
      redrawCube = false;
    }
    if (redrawCube) {
      this.chart.filter(f);
      this.parent.renderCubes();
    }
    if (!f) {
      f = this.config.data.interval;
    }
    this.config.filter = f;
    this.filterElements[0].val(this.config.format.input(this.config)(f[0]));
    this.filterElements[1].val(this.config.format.input(this.config)(f[1]));
    $(this.legend.text_range).find(".m0").text(this.config.format.short(this.config)(f[0]));
    $(this.legend.text_range).find(".m1").text(this.config.format.short(this.config)(f[1]));
    return this;
  };

  BoxView.prototype.getFilteredData = function() {
    var f, k, out, v, _ref2, _ref3;
    if (!this.chart.filter()) {
      return this.data;
    }
    f = (_ref2 = this.chart.filter()) != null ? _ref2 : this.config.data.interval;
    out = {};
    _ref3 = this.data;
    for (k in _ref3) {
      v = _ref3[k];
      if ((f[0] <= v && v <= f[1])) {
        out[k] = v;
      }
    }
    return out;
  };

  BoxView.prototype.renderRange = function() {
    this.config.render.range(this.config, this.legend.text_range);
    return this.config.render.rangeForm(this.config, this.legend.form_range);
  };

  BoxView.prototype.render = function() {
    var _this = this;
    this.config.render.legend(this.config, this.legend.text_p);
    this.config.render.form(this.config, this.legend.form_p);
    this.renderRange();
    $(this.legend.form_range).find("input").on("change", function() {
      var f;
      f = [+_this.filterElements[0].val(), +_this.filterElements[1].val()];
      if (f[0] > f[1]) {
        f.reverse();
      }
      f[0] = _.max([_this.config.data.interval[0], f[0]]);
      f[1] = _.min([_this.config.data.interval[1], f[1]]);
      if (_.isEqual(f, _this.config.data.interval)) {
        f = null;
      }
      return _this.setFilter(f, true);
    });
    $(this.legend.form_p).find("input, select").on("change", function() {
      var p;
      _this.config.data.interval = null;
      _this.config.scale = null;
      _this.config.filter = null;
      p = _this.config.submitter(_this.config, _this.legend.form_p);
      _this.config.p = p;
      console.log(p);
      return _this.loadData();
    });
    return this.filterElements = [$(this.legend.form_range).find("input[name=m0]"), $(this.legend.form_range).find("input[name=m1]")];
  };

  return BoxView;

})(Backbone.View);
// Generated by CoffeeScript 1.6.3
var _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

crosslet.MapView = (function(_super) {
  __extends(MapView, _super);

  function MapView() {
    this._renderMap = __bind(this._renderMap, this);
    this.getSelection = __bind(this.getSelection, this);
    this.hover = __bind(this.hover, this);
    this.mouseMove = __bind(this.mouseMove, this);
    this.reset = __bind(this.reset, this);
    this.beforezoom = __bind(this.beforezoom, this);
    this.project = __bind(this.project, this);
    _ref = MapView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MapView.prototype.initialize = function(el, config) {
    var _this = this;
    this.config = crosslet.createConfig(crosslet.defaultConfig, config);
    this.geoURL = this.config.map.geo.url;
    this.opacity = this.config.defaults.opacity;
    this.ds = new crosslet.DataStore(this.config);
    this.el = el;
    this.hoverFunc = this.default_hover;
    $(this.el).attr("class", "crosslet");
    this.map = L.map(el[0]).setView(this.config.map.view.center, this.config.map.view.zoom);
    L.tileLayer(this.config.map.leaflet.url, this.config.map.leaflet).addTo(this.map);
    this.control = $("<div class='crosslet_panel'></div>");
    this.info = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function(map) {
        return _this.control[0];
      }
    });
    this.map.addControl(new this.info());
    this.panel = new crosslet.PanelView(this.control, this.config, this);
    this.renderMap = this._renderMap;
    return this.ds.loadGeo(this.geoURL, this.config.map.geo.id_field, function(ds) {
      _this.bounds = _this.ds.bounds;
      _this.path = d3.geo.path().projection(_this.project);
      _this.svg = d3.select(_this.map.getPanes().overlayPane).append("svg");
      _this.g = _this.svg.append("g");
      _this.g.attr("class", "crosslet_geometry");
      _this.feature = _this.g.selectAll("path").data(ds.geometries).enter().append("path").attr("id", function(d) {
        return "path_" + d.properties[_this.config.map.geo.id_field];
      }).on("mouseover", function(d) {
        return _this.hover(d);
      }).on("mousemove", _this.mouseMove);
      _this.reset();
      _this.map.on("viewreset", _this.reset);
      _this.map.on("zoomstart", _this.beforezoom);
      _this.hoverElement = _this.svg.append("g").attr("class", "hover");
      _this.hoverElementRect = _this.hoverElement.append("svg:rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 30).attr("rx", 5).attr("ry", 5);
      _this.hoverElementText = _this.hoverElement.append("text").attr("x", 0).attr("y", 0);
      _this.hoverElementTextBB = {
        width: 0,
        height: 0,
        x: 0,
        y: 0
      };
      if (_this.panel.numloads <= 0) {
        return _this.panel.createCube();
      }
    }, this.config.map.geo.topo_object);
  };

  MapView.prototype.project = function(x) {
    var point;
    point = this.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
    return [point.x, point.y];
  };

  MapView.prototype.beforezoom = function() {
    return this.g.style("display", "none");
  };

  MapView.prototype.reset = function() {
    var bottomLeft, topRight;
    bottomLeft = this.project(this.bounds[0]);
    topRight = this.project(this.bounds[1]);
    this.svg.attr("width", topRight[0] - bottomLeft[0]).attr("height", bottomLeft[1] - topRight[1]).style("margin-left", bottomLeft[0] + "px").style("margin-top", topRight[1] + "px");
    this.g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
    this.feature.attr("d", this.path);
    this.g.style("display", "inline");
    return true;
  };

  MapView.prototype.mouseMove = function() {
    var br, dx, dy, matrix, pos, trp;
    br = jQuery.browser;
    pos = d3.mouse(this.svg.node());
    if (br.mozilla) {
      trp = this.svg.node().parentNode.parentNode.parentNode;
      matrix = $(trp).css("transform").split('(')[1].split(')')[0].split(',');
      dx = +matrix[4];
      dy = +matrix[5];
      pos[0] -= dx;
      pos[1] -= dy;
    }
    pos[0] += 30;
    pos[1] += 30;
    if (this.hoverElementTextBB.width + pos[0] >= this.svg.attr("width")) {
      pos[0] -= this.hoverElementTextBB.width + 60;
    }
    if (this.hoverElementTextBB.height + pos[1] >= this.svg.attr("height")) {
      pos[1] -= this.hoverElementTextBB.height + 60;
    }
    return this.hoverElement.attr("transform", "translate(" + pos[0] + "," + pos[1] + ")");
  };

  MapView.prototype.hover = function(data) {
    var text;
    text = this.hoverFunc(data, data.properties.value);
    this.hoverElementText.text(text);
    this.hoverElementTextBB = this.hoverElementText.node().getBBox();
    return this.hoverElementRect.attr("width", this.hoverElementTextBB.width + 10).attr("height", this.hoverElementTextBB.height + 10).attr("x", this.hoverElementTextBB.x - 5).attr("y", this.hoverElementTextBB.y - 5);
  };

  MapView.prototype.getSelection = function() {
    return this.panel.getSelection();
  };

  MapView.prototype.default_hover = function(data, value) {
    return data.properties[this.config.map.geo.name_field] + " - " + value;
  };

  MapView.prototype._renderMap = function(data, formatter, hoverFunc) {
    var _this = this;
    if (hoverFunc) {
      this.hoverFunc = hoverFunc;
    }
    this.feature.attr("style", function(d) {
      var id;
      id = d.properties[_this.config.map.geo.id_field];
      d.properties.value = data[id];
      if (_.isNumber(data[id])) {
        return "fill: " + formatter(d.properties.value);
      } else {
        return "display:none";
      }
    });
    return this;
  };

  return MapView;

})(Backbone.View);

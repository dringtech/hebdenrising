var svg = d3.select('svg#graph');

var DIMENSIONS = {
  WIDTH: 600, HEIGHT: 300,
  MARGINS: { top: 20, right: 20, bottom: 50, left: 50, },
};

var plot = svg
  .attr('width', DIMENSIONS.WIDTH + DIMENSIONS.MARGINS.left + DIMENSIONS.MARGINS.right)
  .attr('height', DIMENSIONS.HEIGHT + DIMENSIONS.MARGINS.top + DIMENSIONS.MARGINS.bottom)
  .append('g')
  .attr('transform', 'translate(' + DIMENSIONS.MARGINS.left + ',' + DIMENSIONS.MARGINS.top + ')');

var timeParse = d3.time.format('%Y-%m-%dT%H:%M:%SZ').parse;
var color = d3.scale.category10();

Q.all(stations.map(getStationData))
  .then(function handleResult(result) {
    var dates = d3.merge(result.map(function (resultSet) {
      return resultSet.data.map(function (reading) {
        return timeParse(reading.dateTime);
      });
    }));

    var maxLevel = d3.max(result.map(function (resultSet) {
      return resultSet.info.stageScale.scaleMax;
    }));

    var data = result.map(function (resultSet) {
      return {
        name: resultSet.info.label + ' on the ' + resultSet.info.riverName,
        id: resultSet.info.RLOIid,
        points: resultSet.data.map(function (reading) {
          return [timeParse(reading.dateTime), reading.value];
        }),
      };
    });

    color.domain(data.map(function (x) { return x.id; }));

    var xScale = d3.time.scale()
      .range([0, DIMENSIONS.WIDTH])
      .domain(d3.extent(dates));
    var yScale = d3.scale.linear()
      .range([DIMENSIONS.HEIGHT, 0])
      .domain([0, maxLevel]);
    var xAxis = d3.svg.axis().scale(xScale).tickSize(3);
    var yAxis = d3.svg.axis().scale(yScale).tickSize(3).orient('left');
    plot.append('g')
      .classed('axis', true)
      .attr('transform', 'translate(0,' + DIMENSIONS.HEIGHT + ')')
      .call(xAxis);
    plot.append('g')
      .classed('axis', true)
      .call(yAxis);

    var lineGen = d3.svg.line().interpolate('basis')
        .x(function (d) { return xScale(d[0]); })
        .y(function (d) { return yScale(d[1]); });

    var legend = plot.append('g')
      .classed('legend', true)
      .attr('transform', 'translate(50,30)');

    data.forEach(function (d, i) {
      plot.append('path')
        .attr('d', lineGen(d.points))
        .attr('stroke', color(d.id))
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .attr('data-legend', d.name)
        .classed('series', true);
      var key = legend.append('g')
        .attr('transform', 'translate(0,' + (i * 15) + ')');
      key.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color(d.id));
      key.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .text(d.name);
    });

  });

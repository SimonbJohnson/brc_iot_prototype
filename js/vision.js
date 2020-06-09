function generateDash(data,geom){
    
    $('.sp-circle').remove();

    var lastValue = data[data.length-1];
    setTimeout(function(){update(0,data)},200);


    var width = 480,
        height = 680;

    var projection = d3.geo.albers()
        .center([0, 55.4])
        .rotate([4.4, 0])
        .parallels([50, 60])
        .scale(1200 * 2.5)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

      svg.append("path")
          .datum(topojson.feature(geom, geom.objects.subunits))
          .attr("d", path)
          .attr("fill","#aaaaaa");

}

function update(lastValue,data){
    var time = Math.floor(lastValue / 2000*24)
    $('#time').html(time+' hours');
    var newData = getData(data,lastValue);
    updateMap(newData);
    setTimeout(function(){update(lastValue+20,data)},100);
}

function getData(data,now){
    var output = data.filter(function(d){
        if(d['#date']>now&&d['#date']<now+20){
            return true
        }
        return false
    });
    return output;
}

function updateMap(newData){

    var width = 480,
        height = 680;

    var projection = d3.geo.albers()
        .center([0, 55.4])
        .rotate([4.4, 0])
        .parallels([50, 60])
        .scale(1200 * 2.5)
        .translate([width / 2, height / 2]);

    var circle = svg.selectAll('circles')
        .data(newData)
        .enter()
        .append("circle")
        .attr("cx",function(d) {console.log('Adding circle for ' + d['#meta+id']);console.log(d); return projection([d['#geo+lng'],d['#geo+lat']])[0]})
        .attr("cy",function(d) { return projection([d['#geo+lng'],d['#geo+lat']])[1]})
        .attr("r",1)
        .attr("opacity",1)
        .attr("fill",function(d){
            return d['#meta+colour'];
        })
        .transition()
        .duration(2000)
        .attr("opacity",0)
        .attr("r",20);


}   

function hxlProxyToJSON(input,headers){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

var stop = false;
var svg;

var dataCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?filter01=merge&merge-url01=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Y_-nGw3_b7zqeF9hlQdzzP2ySOm9wrrGMHvlNy8P3as%2Fedit%23gid%3D142826544&merge-keys01=%23meta%2Bid&merge-tags01=%23geo%2Blat%2C%23geo%2Blng%2C%23meta%2Bcolour&strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Y_-nGw3_b7zqeF9hlQdzzP2ySOm9wrrGMHvlNy8P3as%2Fedit%23gid%3D1477475148&force=on',
    dataType: 'json',
});

var geomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/uk.json', 
    dataType: 'json'
});

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var data = hxlProxyToJSON(dataArgs[0]);
    var geom = geomArgs[0];
    generateDash(data,geom);
});
function generateDash(data,buttons,geom){
    
    $('.sp-circle').remove();

    var lastValue = data[data.length-1];
    setTimeout(function(){update(lastValue,buttons)},12000);


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

function update(lastValue,buttons){

    console.log('Checking for update');
    $.ajax({
        url: "https://proxy.hxlstandard.org/data.json?strip-headers=on&filter01=select&select-query01-01=%23date%3E"+lastValue['#date']+"&force=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Y_-nGw3_b7zqeF9hlQdzzP2ySOm9wrrGMHvlNy8P3as%2Fedit%23gid%3D0",
        success: function(result){
            if(result.length>1){
                console.log('update found');
                result = hxlProxyToJSON(result);
                lastValue = result[result.length-1];
                updateMap(result,buttons);
            }
            if(stop==false){setTimeout(function(){update(lastValue,buttons)},12000)};
        }
    })
}

function updateMap(newData,buttons){
    newData.forEach(function(d){
        console.log(d);
        console.log('Updating '+d['#meta+id']);
        buttons.forEach(function(b){
            if(d['#meta+id']==b['#meta+id']){
                d.lat = b['#geo+lat'];
                d.lng = b['#geo+lng'];
                d.colour = b['#meta+colour'];
            }
        });
    });

    var width = 480,
        height = 680;

    var projection = d3.geo.albers()
        .center([0, 55.4])
        .rotate([4.4, 0])
        .parallels([50, 60])
        .scale(1200 * 2.5)
        .translate([width / 2, height / 2]);

    console.log(newData);

    var circle = svg.selectAll('circles')
        .data(newData)
        .enter()
        .append("circle")
        .attr("cx",function(d) {console.log('Adding circle for ' + d['#meta+id']); return projection([d.lng,d.lat])[0]})
        .attr("cy",function(d) { return projection([d.lng,d.lat])[1]})
        .attr("r",1)
        .attr("opacity",1)
        .attr("fill",function(d){
            return d.colour;
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
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&filter01=cut&cut-exclude-tags01=%23event&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Y_-nGw3_b7zqeF9hlQdzzP2ySOm9wrrGMHvlNy8P3as%2Fedit%23gid%3D0&force=on',
    dataType: 'json',
});

var buttonsCall = $.ajax({ 
    type: 'GET', 
    url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1Y_-nGw3_b7zqeF9hlQdzzP2ySOm9wrrGMHvlNy8P3as%2Fedit%23gid%3D1837900566', 
    dataType: 'json'
});

var geomCall = $.ajax({ 
    type: 'GET', 
    url: 'data/uk.json', 
    dataType: 'json'
});

$.when(dataCall, buttonsCall, geomCall).then(function(dataArgs, buttonsArgs, geomArgs){
    var data = hxlProxyToJSON(dataArgs[0]);
    var buttons = hxlProxyToJSON(buttonsArgs[0]);
    var geom = geomArgs[0];
    generateDash(data,buttons,geom);
});
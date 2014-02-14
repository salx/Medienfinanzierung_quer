/*
Feedback Gerd

Feedback Grafik:
Button in ORF Farben stylen

Fragen SiFu:
- wie kann ich auf die ticks ein .replace anwenden?
- wie kann ich im mouse-over d.Unternehmen anzeigen lassen?
- wie kann ich das sorting descending statt ascending machen?
- CSS line-style: crisp edges oder nicht? (jetzt wird die Mittellinie immer beim Zoomen dünner)

- aufräumen. und einrücken

*/

(function(){
	var margin = {top: 60, right: 188, bottom: 80, left: 37},
        width = 778 - margin.left - margin.right,
        height = 509 - margin.top - margin.bottom,
        //half = height/2-1; //2
        half = width/2 -1;

    var input;

    //ordinal scale for medienunternehmen
    var x0 = d3.scale.ordinal()
    	//.rangeRoundBands([0, width], 0.2); 1
        .rangeRoundBands([height, 0], 0.3);

    //vertikal scale for umsatz und gewinn
    var y0 = d3.scale.linear()
    	.range([half, 0]);

    //second vertikal scale for mitarbeiter
    var y1 = d3.scale.linear()
    	.range([0, half]);

    // color Scale
    var color = d3.scale.ordinal()
    	.range(["#4D8091", "#6b486b"])//98abc5


    var yAxis = d3.svg.axis()
    	.scale(y0)
    	.orient("top")//left
        .ticks(7)
    	  .tickFormat(
          function( t ) {
            if( t === 0 ) {
              return '';
            } else {
              return t/1000;
            }
          }
        );

    // ticks formatieren
    //http://stackoverflow.com/questions/15493303/converting-numbers-on-y-axis-to-string-with-k-for-thousand-d3-js

    var yAxis2 = d3.svg.axis()
    	.scale(y1)
    	.orient("top")//left
        .ticks(7)
        .tickFormat(
          function( t ) {
            if( t === 0 ) {
              return '';
            } else {
              return t / 1000;
            }
          }
        );

    var format = d3.format("0,0");
    //var format = d3.format(".,2f")

    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html( function(d){
            if (d.name === "Mitarbeiter"){
                return "<text>" + d.Unternehmen + "</br>Umsatz pro Mitarbeiter/in</br>" + format(d3.round(d.value)).replace( ',', '.' ) + " €</text>"
            }else{
                return "<text>"+ d.Unternehmen +"</br>Umsatz 2012</br>" + format(d3.round(d.value)).replace( ',', '.' ) + " Mio. €</text>"
            }
        })

    var svg = d3.select("body")
    	.append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")//welchen Sinn macht das, wenn nachher auch noch eine gruppe reinkommt?
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    var data;

    function sortData( ) {
      data.sort(function(a, b) {
        var lA = 1000000;
        var lB = 1000000;
        if( a.Land === 'DE' ) {
          var lA = 0;
        }
        if( b.Land === 'DE' ) {
          var lB = 0;
        }

        if (input === 'angestellte') {
          return (lA-lB)-(a.mediaValues[1].value-b.mediaValues[1].value);
        } else {
          return (lA-lB)-(a.mediaValues[0].value-b.mediaValues[0].value);
        }
      });
    }

    d3.csv("Medienfinanzierung5.csv", function(error, result){
      data = result;
    	var mediaNames = [ "Umsatz in Mio Euro", "Mitarbeiter" ];
    	data.forEach(function(d){
    		d.mediaValues = mediaNames.map(function(name){ return {name: name, value: +d[name]}; });
    	});

      sortData( );

    	//set the domains
    	x0.domain(data.map(function(d) { return d.Unternehmen } ));

    	function key( name ) {
    		return function(d) {
    			return d[name];
    		}
    	}

    	var umsaetze = data.map( key('mediaValues') ).map( function( d ) { return d[0] } ).map( key( 'value') );
    	var mitarbeiter = data.map( key('mediaValues') ).map( function( d ) { return d[1] } ).map( key( 'value') );
    	y0.domain([0, d3.max(umsaetze)]);
    	y1.domain([0, d3.max(mitarbeiter)+500])

		svg.append("rect")
            .attr("class", "background1")
            .attr("x", -85)
            .attr("y", height-160)
            .attr("height", 155)
            .attr("width", width+margin.right+margin.left);

        svg.append( 'line' )
			.attr("class", "line")
			.attr("x1", half )
			.attr("x2", half )
			.attr("y1", -10 )
			.attr("y2", height+50);

        svg.append("text")
            .attr("x", -130)
            .attr("transform", "rotate(-90)")
            .attr("y", 150)
            .text("ÖSTERREICH");

        svg.append("text")
            .attr("y", -20)
            .attr("transform", "rotate(-90)")
            .attr("x", -335)
            .text("DEUTSCHLAND");

    	svg.append("g")
    		.attr("class", "y axis")
            .attr('transform', 'translate(0,' + (height +30)+')')
    		.call(yAxis)
    		.append("text")
    		.attr("x", 60)
            .attr("y", 10)
    		.attr("dy", "0.71em")
    		.style("text-anchor", "end")
    		.text("in Mrd. €");

    	svg.append("g")
    		.attr("class", "y axis")
    		.attr('transform', 'translate(' + half + ',' + (height + 50) +')')
    		.call(yAxis2)
       		.append("text")
            .attr("x", 210)
    		.attr("y", 10)
    		.attr("dy", "0.71em")
    		.style("text-anchor", "end")
    		.text("in 1000 €");


    	var unternehmen = svg.selectAll(".unternehmen")
    		.data(data)
    		.enter()
    		.append("g")
    		.attr("class", "unternehmen")
    		.attr("transform", function(d){ return "translate(0," + x0(d.Unternehmen) + ")" });

    	unternehmen.selectAll("rect")
    		.data(function(d){
          return d.mediaValues.map( function( e ) {
            e.Unternehmen = d.Unternehmen;
            return e;
          } );
        })
    		.enter()
    		.append("rect")
            .attr("class", "bar")
    		.attr("height", x0.rangeBand()) //vorher: width
    		.attr("x", function(d){ //vorher: y
    		    if( d.name === 'Mitarbeiter' ) {
                    return half+1;
    		    } else {
    		    	return y0(d.value)-1;
    		    }

    		})
    		.attr("width", function(d){ //vorher: height
    		 if( d.name === "Mitarbeiter" ){
    		 	return half - ( half - y1(d.value) )
    		 }
    			return half - y0(d.value)
    		})
    		.attr("fill", function(d){ return color(d.name); })
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

    	unternehmen.append( 'text' )
    	    .attr( 'class', 'label' )
    	    .attr( 'y', x0.rangeBand()-7 )
            .attr( 'x', function(d) { return (half + 15) + y1(d.mediaValues[1].value) })
    	    .attr("text-anchor", "start")
    	    .text( function(d) { return d.Unternehmen } );

        d3.selectAll("li").on("click", change);

    })

    function change(){
        input = this.id;
        d3.selectAll("li.selected")
            .attr("class", "");
        d3.select(this)
            .attr("class", "selected");

        sortData( );
        x0.domain(data.map( function( d ) { return d.Unternehmen; }) );

        var transition = svg.transition().duration(750),
            delay = function(d,i){ return i * 50 };

        transition.selectAll(".unternehmen")
            .delay(delay)
            .attr("transform", function(d){ return "translate(0," + x0(d.Unternehmen) + ")" });

    }



})();

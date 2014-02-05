/*
Feedback Gerd

Feedback Grafik:
y-Achse: Orientierungslinien - gepunktet/strichliert gar nicht?
Trennung DE-AT: wie am Besten? (eingekastelt?)

Fragen SiFu:
1.)
Sorting und Transformationen

2.)
Wie kann ich die Zahlen f.d. Angetstellen im Mouse-Over ergänzen? Zahlen f. MitarbeiterInnen - also wieviele MA...
LOKALISIERUNG: was muss ich tun?
// hier steht, wie ich das format ändern kann, aber ich kapier's nicht ganz..und es funkt derzeit nicht.
    //https://groups.google.com/forum/#!topic/d3-js/NH90E7J7IUo
    // https://github.com/mbostock/d3/issues/1492
    // hier ist ein guter Tipp http://stackoverflow.com/questions/17573797/formatting-y-axis
    // hier ebenfalls zum Lokalisierungs-Problem

Wie kann ich einen Radn um "background2" machen? das CSS wird zwar angewendet aber ist nicht sichtbar

3.
Re-factoring

TODO

SORTING nach Umsatz oder Umsatz/Ang
um 90 Grad drehen?
Positionierung des Buttons ÜBER dem Rand des Bildes

*/

(function(){
	var margin = {top: 100, right: 130, bottom: 80, left: 30},
        width = 582 - margin.left - margin.right,
        height = 509 - margin.top - margin.bottom,
        //half = height/2-1; //2
        half = width/2 -1;

    var input;

    //ordinal scale for medienunternehmen
    var x0 = d3.scale.ordinal()
    	//.rangeRoundBands([0, width], 0.2); 1
        .rangeRoundBands([height, 0], 0.2);


    //second x scale for grouping
    //var x1 = d3.scale.ordinal();

    //vertikal scale for umsatz und gewinn
    var y0 = d3.scale.linear()
    	.range([half, 0]);

    //second vertikal scale for mitarbeiter
    var y1 = d3.scale.linear()
    	.range([0, half]);

    // color Scale
    var color = d3.scale.ordinal()
    	.range(["#98abc5", "#6b486b"])

    //Axes
    /*
    var xAxis = d3.svg.axis()
    	.scale(x0)
    	.orient("bottom");

    */
    var yAxis = d3.svg.axis()
    	.scale(y0)
    	.orient("top")//left
        .ticks(7)
    	.tickFormat(d3.format("1s"))
    // ticks formatieren
    //http://stackoverflow.com/questions/15493303/converting-numbers-on-y-axis-to-string-with-k-for-thousand-d3-js
    var yAxis2 = d3.svg.axis()
    	.scale(y1)
    	.orient("top")//left
        .ticks(7)
        .tickFormat(d3.format("1s"));

    var format = d3.format("0,000");
    //var format = d3.format(".,2f")


    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html( function(d){
            if (d.name === "Mitarbeiter"){

                return "<text>2012</br> Umsatz pro MitarbeiterIn: " + format(d3.round(d.value) ) + " €</text>"
            }else{
                return "<text>2012</br>" + d.name + ": " + d.value + " Mio. €</text>"
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
    	//x1.domain(mediaNames).rangeRoundBands([0, x0.rangeBand()]); //check

    	function key( name ) {
    		return function(d) {
    			return d[name];
    		}
    	}

    	var umsaetze = data.map( key('mediaValues') ).map( function( d ) { return d[0] } ).map( key( 'value') );
    	var mitarbeiter = data.map( key('mediaValues') ).map( function( d ) { return d[1] } ).map( key( 'value') );
    	y0.domain([0, d3.max(umsaetze)]);
    	y1.domain([0, d3.max(mitarbeiter)+500])

		svg.append( 'line' )
			.attr("class", "line")
			.attr("x1", half+1 )
			.attr("x2", half+1 )
			.attr("y1", -40 )
			.attr("y2", height+50);


        svg.append("rect")
            .attr("class", "background1")
            .attr("x", 10)
            .attr("y", height-145)
            .attr("height", 150)
            .attr("width", width+margin.right);

        /*
        svg.append("text")
            .attr("y", height)
            .attr("x", 100)
            .text("ÖSTERREICH");

        svg.append("text")
            .attr("y", height)
            .attr("x", 390)
            .text("DEUTSCHLAND");
        */

    	svg.append("g")
    		.attr("class", "y axis")
            .attr('transform', 'translate(0,' + (height +30)+')')
    		.call(yAxis)
    		.append("text")
    		//.attr("transform", "rotate(-90)")
    		.attr("x", 60)
            .attr("y", 10)
    		.attr("dy", "0.71em")
    		.style("text-anchor", "end")
    		.text("in Mio. €");

    	svg.append("g")
    		.attr("class", "y axis")
    		.attr('transform', 'translate(' + half + ',' + (height + 50) +')')
    		.call(yAxis2)
       		.append("text")
    		//.attr("transform", "rotate(-90)")
            .attr("x", 210)
    		.attr("y", 10)
    		.attr("dy", "0.71em")
    		.style("text-anchor", "end")
    		.text("in 100.00 €");


    	var unternehmen = svg.selectAll(".unternehmen")
    		.data(data)
    		.enter()
    		.append("g")
    		.attr("class", "unternehmen")
    		.attr("transform", function(d){ return "translate(0," + x0(d.Unternehmen) + ")" });

    	unternehmen.selectAll("rect")
    		.data(function(d){ return d.mediaValues; })
    		.enter()
    		.append("rect")
            .attr("class", "bar")
    		.attr("height", x0.rangeBand()) //vorher: width
    		//.attr("x", function(d){ return x0(d.name); })
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
            //remove de-tip.n divs...die behindern das neue mousover! daher hier noc ohne mouseout.

    	unternehmen.append( 'text' )
    	    .attr( 'class', 'label' )
    	    .attr( 'y', x0.rangeBand()-7 )
            //.attr( 'x', function(d) { return 300-y0(d.mediaValues[0].value) +5 })
            .attr( 'x', function(d) { return (half + 15) + y1(d.mediaValues[1].value) })
    	    .attr("text-anchor", "start")
    	    //.attr("transform", "rotate(-90)")
    	    .text( function(d) { return d.Unternehmen } )
            //.on("mouseover", tip.show)
            //.on("mouseout", tip.hide);

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


        //.map(function(d){ return d. }) hier streut es mich auf. Denn im Beispielcode wird x direkt vegeben, nicht über ein transform
        //.copy() //was ist das?

        var transition = svg.transition().duration(750),
            delay = function(d,i){ return i * 50 };

        transition.selectAll(".unternehmen")
            //.data(data)//
            .delay(delay)
            .attr("transform", function(d){ return "translate(0," + x0(d.Unternehmen) + ")" });

    }



})();

/*
 * SpatialGraphLib.js
 * v0.10
 * 
 * This library provides tools to generate and examine spatial graphs,
 * i.e. graphs that are embedded into space. It includes a reference
 * implementation of the Scale-Invariant Spatial Graph (SISG) Model.
 * In addition to spatial graphs, the generation of some non-spatial graph
 * models is supported.
 * 
 * Copyright (c) 2015 by Franz-Benjamin Mocnik
 * The library is free to use for non-commercial projects.
 * Copys of the library must always contain this license.
 */

var Graph = function() {
    var nodes = [];
    var edges = [];
    
    /****** BASIC DATA OF THE GRAPH ******/
    
    // return the nodes
    this.getNodes = function() {
        return nodes;
    };
    
    // return the edges
    this.getEdges = function() {
        return edges;
    };

    // bounds of the set of nodes
    this.geoBounds = function() {
        var nodesLat = nodes.map(function(x) {
            return x.coordinates[0];
        });
        var nodesLon = nodes.map(function(x) {
            return x.coordinates[1];
        });
        if (nodesLat.length > 0 && nodesLon.length > 0) return [[minArray(nodesLat), minArray(nodesLon)], [maxArray(nodesLat), maxArray(nodesLon)]];
        return null;
    }
    
    /****** BASIC MODIFICATION OF THE GRAPH ******/

    // add nodes
    this.addNodes = function(ns) {
        nodes = nodes.concat(ns);
        return this.nubNodes();
    };

    // clear graph
    this.clearGraph = function() {
        nodes = [];
        edges = [];
        return this;
    };
    // clear edges
    this.clearEdges = function() {
        edges = [];
        return this;
    };

    // make the nodes and edges unique
    var nubBy = function(array, key) {
        var seen = {};
        return array.filter(function(item) {
            var k = key(item);
            return seen.hasOwnProperty(k) ? false : (seen[k] = true);
        });
    };
    this.nubNodes = function() {
        nodes = nubBy(nodes, JSON.stringify);
        return this;
    };
    this.nubEdges = function() {
        edges = nubBy(edges, JSON.stringify);
        return this;
    };
    
    /****** ADD NODES: RANDOM ******/
    
    // add random nodes to graph
    this.addNodesRandom = function(numberOfPoints, latRange, lonRange) {
        for (var j = 0; j < numberOfPoints; j++) {
            nodes.push({
                coordinates: [latRange[0] + (latRange[1] - latRange[0]) * Math.random(), lonRange[0] + (lonRange[1] - lonRange[0]) * Math.random()],
            });
        }
        return this.nubNodes();
    };
    
    /****** ADD NODES FROM FILE ******/
    
    // add nodes from json
    this.addNodesGeoJSON = function(json) {
        for (var j in json.features) {
            var n = json.features[j];
            var name = null;
            if (n.properties) {
                if (n.properties.name) name = n.properties.name;
                if (n.properties.NAME) name = n.properties.NAME;
                if (n.properties.naam) name = n.properties.naam;
                if (n.properties.HTXT) name = n.properties.HTXT;
            }
            if (n.geometry && n.geometry.coordinates) {
                nodes.push({
                    coordinates: n.geometry.coordinates.reverse(),
                    name: name,
                });
            }
        }
        return this.nubNodes();
    };
    
    // add nodes from csv
    this.addNodesGeoCSV = function(csv) {
        var csvRows = csv.split(/\r?\n/);
        for (var j = 0; j < csvRows.length - 1; j++) {
            var fields = csvRows[j].replace(/ /g, ',').replace(/\t/g, ',').split(',');
            var lat = parseFloat(fields[0]);
            var lon = parseFloat(fields[1]);
            var name = fields[2] ? fields[2] : null;
            if (!isNaN(lat) && !isNaN(lon)) {
                nodes.push({
                    coordinates: [lat, lon],
                    name: name,
                });
            }
        }
        return this.nubNodes();
    };

    /****** GENERATION OF EDGES: SCALE-INVARIANT SPATIAL GRAPH (SISG) MODEL ******/
    
    // compute edges according to the SISG model
    var edgesSISGModel = function(nodes, k, dist) {
        var edges = [];
        for (var i in nodes) {
            distMin = Infinity;
            for (var j in nodes) {
                if (i != j) distMin = Math.min(distMin, dist(nodes[i], nodes[j]));
            }
            if (distMin != Infinity) {
                for (var j in nodes) {
                    if (i != j && dist(nodes[i], nodes[j]) <= k * distMin)
                        edges.push({from: nodes[i], to: nodes[j]});
                }
            }
        }
        return edges;
    };
    
    // add edges according to the SISG model
    // requires the graph to have nodes with coordinates
    this.addEdgesSISGModel = function(k) {
        edges = edges.concat(edgesSISGModel(nodes, k, function(x, y) {
            return distanceOnEarth(x.coordinates, y.coordinates);
        })).map(function(x) {
            x.from = x.from.coordinates;
            x.to = x.to.coordinates;
            return x;
        });
        return this.nubEdges();
    };

    /****** GENERATION OF EDGES: GILBERT MODEL ******/
    
    // add random edges according to the Gilbert model
    this.addEdgesGilbert = function(probability) {
        for (i in nodes) {
            for (var j = 0; j < i; j++) {
                if (Math.random() <= probability) {
                    edges.push({from: nodes[i].coordinates, to: nodes[j].coordinates});
                }
            }
        }
        return this.nubEdges();
    };

    /****** EXPORT ******/
    
    var prepareCsv = function(csv) {
        var csvRows = [];
        for (var j in csv) {
            csvRows.push(csv[j].join(', '));
        }
        return csvRows;
    };
    
    // export as csv
    this.csv = function() {
        var csvRows = [['from', 'to']];
        var nodesLocation = nodes.map(function(x) {
            return x.coordinates;
        });
        for (var j in edges) {
            var fromIndex = nodesLocation.indexOf(edges[j].from);
            var toIndex = nodesLocation.indexOf(edges[j].to);
            csvRows.push([fromIndex, toIndex]);
        }
        return prepareCsv(csvRows).join('\n');
    };
    
    // export as tgf
    this.tgf = function() {
        var tgfRows = [];
        var nodesLocation = nodes.map(function(x) {
            return x.coordinates;
        });
        for (var j in nodes) {
            var n = nodes[j];
            var name = n.name ? n.name + '  -  ' : '';
            tgfRows.push(j + ' ' + name + n.coordinates);
        }
        tgfRows.push('#');
        for (var j in edges) {
            var fromIndex = nodesLocation.indexOf(edges[j].from);
            var toIndex = nodesLocation.indexOf(edges[j].to);
            tgfRows.push(fromIndex + ' ' + toIndex);
        }
        return tgfRows.join('\n');
    };

    /****** HELPING FUNCTIONS ******/
    
    var maxArray = function(array) {
        return Math.max.apply(null, array);
    };
    
    var minArray = function(array) {
        return Math.min.apply(null, array);
    };

    /****** HELPING FUNCTIONS GEO ******/
    
    var radiusEarth = 6371.009;
    
    var degreeToRad = function(d) { return d * Math.PI / 180; };
    var radToDegree = function(r) { return r * 180 / Math.PI; };
    var sign = function(x) { return typeof(x) === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN; };
    var diffAngle = function(r2, r1) {
        if (Math.abs(r2 - r1) <= Math.PI / 2) {
            return r2 - r1;
        } else {
            return diffAngle(r2, r1 + sign(r2 - r1) * Math.PI);
        }
    };
    
    var distanceOnEarth = function(x, y) {
        var lat1 = degreeToRad(x[0]);
        var lat2 = degreeToRad(y[0]);
        var lon1 = degreeToRad(x[1]);
        var lon2 = degreeToRad(y[1]);
        return radiusEarth * Math.sqrt(Math.pow(diffAngle(lat2, lat1), 2) + Math.pow(Math.cos((lat2 + lat1) / 2) * diffAngle(lon2, lon1), 2));
    };
};

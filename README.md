# SpatialGraphLib.js
v0.10

This library provides tools to generate and examine spatial graphs, i.e. graphs that are embedded into space. It includes a reference implementation of the Scale-Invariant Spatial Graph (SISG) Model. In addition to spatial graphs, the generation of some non-spatial graph models is supported.

## Content

* [Literature](#literature)
* [Demo](#demo)
* [Usage](#usage)
* [License](#license)

## Literature

The functionality is, in parts, based on research conducted by the author. The following paper could be of special interest:

Franz-Benjamin Mocnik, Andrew U. Frank: Modelling Spatial Structures<br>
Proceedings of the 12th Conference on Spatial Information Theory (COSIT), 2015

You find more information on http://www.mocnik-science.net

## Demo

A demo of the functionality can be found at:
http://projects.mocnik-science.net/spatial-graphs

## Usage

The library can be used online in a browser or by [node.js](http://www.nodejs.org).

A new graph can be created as an instance of `Graph`:
```javascript
var g = new Graph();
```
This graph can be modified by executing operations on the graph. These operations return the graph, allowing to execute some operations in a row. For example, we can write:
```javascript
g.addNodesRandom(100, [51, 52], [0, 8]).addEdgesSISGModel(1.5);
```

### Basic data of the graph

The functions `getNodes` and `getEdges` return the nodes resp. the edges of the graph:
```javascript
g.getNodes();
g.getEdges();
```

### Basic modification of the graph

You can add nodes to the graph by using the function `addNodes`:
```javascript
g.addNodes([{coordinates: [52, 8]}, {coordinates: [51, 0]}])
```
The nodes are assumed to be objects containing the key `coordinates` with associated value a list consisting of the values for the latitude and longitude.

The edges can be removed from the graph by writing:
```javascript
g.clearEdges();
```
The nodes and edges can be removed by writing:
```javascript
g.clearGraph();
```

You can ensure that the nodes and edges are unique by executing the functions `nubNodes` and `nubEdges`; double nodes and edges are removed.
```javascript
g.nubNodes();
g.nubEdges();
```
Many edge generation algorithms of this library remove double edges automatically.

You can add `n` random nodes with latitude and longitude in given intervals like follows:
```javascript
g.addNodesRandom(n, latInterval, lonInterval);
```
The intervals are of the form `[a, b]`.

### Add nodes from file

You can load points from a GeoJSON file into the graph:
```javascript
g.addNodesGeoJSON(JSON.parse(...));
```

In a similar way, you can load data from a CSV file into the graph:
```javascript
g.addNodesGeoCSV(...);
```
The first column of the file is assumed to contain the latitude, the second one the longitude. If a third column is provided, it is assumed to contain a label for the node.

### Generation of edges: Scale-Invariant Spatial Graph (SISG) Model

Edges can be added to a graph according to the SISG model (see [literature](#literature)) using the function `addEdgesSISGModel`. It assumes that the graph already contains a number of nodes. The density parameter `k` is given as the only parameter:
```javascript
g.addEdgesSISGModel(k);
```

### Generation of edges: Gilbert model

Edges can be added according to the Gilbert model with given probability `p` as follows:
```javascript
g.addEdgesGilbert(p);
```

### Export

The graph can be exported in the CSV format (comma-separated values) as well as in the TGF format (trivial graph format). A string containing the data is returned.
```javascript
g.csv();
g.tgf();
```

## License

Copyright (c) 2015 by Franz-Benjamin Mocnik<br>
The library is free to use for non-commercial projects.<br>
Copys of the library must always contain this license.

/**
 * Agent Smith Cypher Results Parser
 * ==================================
 *
 * Reads the Neo4j REST results to output correct data.
 */
var _ = require('lodash'),
    heuristics = require('../heuristics.js');

/**
 * Data
 */
function parseTable(results) {
  return {
    headers: results.columns,
    rows: results.data.map(x => x.row)
  };
}

/**
 * Graph
 */
function createNode(n, p) {
  return {
    id: n.id,
    x: Math.random(),
    y: Math.random(),
    size: 1,
    label: heuristics.label(n),
    color: n.labels.length ? p[n.labels[0]] : '#000',
    properties: n.properties,
    labels: n.labels
  };
}

function createEdge(e) {
  return {
    id: e.id,
    label: ':' + e.type,
    source: e.startNode,
    target: e.endNode,
    properties: e.properties,
    predicate: e.type,
    color: '#ccc'
  };
}

function parseGraph(results, palette) {
  var idx = {
    nodes: new Set(),
    edges: new Set()
  };

  var graph = {
    nodes: [],
    edges: []
  };

  _(results.data)
    .forEach(function(line) {
      line.graph.nodes.forEach(function(node) {
        if (!idx.nodes.has(node.id)) {

          // Creating node
          graph.nodes.push(createNode(node, palette));
          idx.nodes.add(node.id);
        }
      });

      line.graph.relationships.forEach(function(edge) {
        if (!idx.edges.has(edge.id)) {

          // Creating edge
          graph.edges.push(createEdge(edge));
          idx.edges.add(edge.id);
        }
      });
    });

  return graph
};

module.exports = {
  parseTable: parseTable,
  parseGraph: parseGraph
};


/**
 * Agent Smith Services
 * =====================
 *
 * Various services querying the neo4j database.
 */
var _ = require('lodash'),
    parser = require('./lib/cypher.js'),
    palette = require('./palette.js');

function error(e) {
  this.emit('error', {
    title: 'Network Error',
    message: 'Check your Internet connection and/or your settings.'
  });
  location.href = '/#/settings';
}

module.exports = {

  // Getting an estimation about the number of elements in the database
  allocation: {
    url: ':endpoint/db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DPrimitive%20count',
    error: error,
    success: function(data) {
      var idx = _.indexBy(data[0].attributes, 'name');

      this.select('data', 'allocation').edit({
        nodes: idx.NumberOfNodeIdsInUse.value,
        edges: idx.NumberOfRelationshipIdsInUse.value
      });
    }
  },

  // Querying the database through cypher
  cypher: {
    url: ':endpoint/db/data/transaction/commit',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    error: error,
    success: function(data) {
      var p = _(this.get('data', 'labels'))
        .indexBy('name')
        .mapValues('color')
        .value();

      // Handling error
      if (data.errors.length) {
        let err = data.errors[0];

        this.emit('error', {
          title: err.code,
          message: err.message
        });

        return;
      }

      // TEMP: console log
      console.log('Data!', data.results[0].columns);
      console.log('Data!', data.results[0].data.map(function(x) {
        if (x.row.length < 2)
          return x.row[0];
        else
          return x.row;
      }));

      // Generating the graph
      var graph = parser(data.results[0], p);

      // Updating app state
      this.select('graph').edit(graph);
    }
  },

  // Retrieving a list of labels
  labels: {
    url: ':endpoint/db/data/labels',
    contentType: 'application/json',
    dataType: 'json',
    error: error,
    success: function(data) {

      var sorted = _(data)
        .sortBy((a, b) => a + b)
        .map(function(name, i) {
          return {
            name: name,
            color: palette[i]
          };
        })
        .value();

      this.select('data', 'labels').edit(sorted);
    }
  },

  // Retrieving a list of relationships types
  predicates: {
    url: ':endpoint/db/data/relationship/types',
    contentType: 'application/json',
    dataType: 'json',
    error: error,
    success: function(data) {

      var sorted = _(data)
        .sortBy((a, b) => a + b)
        .value();

      this.select('data', 'predicates').edit(sorted);
    }
  },

  // Retrieving a list of properties
  properties: {
    url: ':endpoint/db/data/propertykeys',
    contentType: 'application/json',
    dataType: 'json',
    error: error,
    success: function(data) {
      var sorted = _.sortBy(data, (a, b) => a + b);

      this.select('data', 'properties').edit(sorted);
    }
  }
};

/**
 * Agent Smith Main Script
 * ========================
 *
 * Launching the application.
 */
var React = require('react'),
    Router = require('react-router'),
    routes = require('./routes.jsx');

Router.run(routes, function(Handler) {
  React.render(<Handler />, document.body);
});

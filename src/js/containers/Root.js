import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, browserHistory, Link } from 'react-router';
// import configureStore from '../configureStore';
import App from '../components/App.js';
import Index from '../components/Index.js';
import Admin from '../components/admin/Admin.js';
import Area from '../components/admin/Area.js';
import Manager from '../components/admin/Manager.js';
import NoMatch from '../components/NoMatch.js';
import { bindDomEvent } from '../library/DomEventHandler';

//const store = configureStore();
export default class Root extends Component {

  componentDidMount() {
    console.log("Root componentDidMount");
    console.log(jQuery);
    bindDomEvent();
    /*// Minimalize menu
    $('.navbar-minimalize').on('click', function() {
      $("body").toggleClass("mini-navbar");
      SmoothlyMenu();
    });

    // Add body-small class if window less than 768px
    if ($(document).width() < 769) {
      $('body').addClass('body-small');
    } else {
      $('body').removeClass('body-small');
    }

    // MetisMenu
    $('#side-menu').metisMenu();*/
  }

  render() {
    return (
          <Router history={browserHistory}>
            <Route path="/" component={App}>
              <IndexRoute component={Index}/>
              <Route path="admin" component={Admin}>
                <Route path="area" component={Area}/>
                <Route path="manager" component={Manager}/>
              </Route>
              <Route path="about" component={About}/>
              <Route path="inbox" component={Inbox}>
                <Route path="messages/:id" component={Message} />
              </Route>
              <Route path="*" component={NoMatch}/>
            </Route>
          </Router>
    );
  }
}

const About = React.createClass({
  render() {
    return <h3>About</h3>;
  }
});

const Inbox = React.createClass({
  render() {
    return (
      <div>
        <h2>Inbox</h2>
        {this.props.children || 'Welcome to your Inbox'}
      </div>
    );
  }
});

const Message = React.createClass({
  render() {
    return <h3>Message {this.props.params.id}</h3>;
  }
});

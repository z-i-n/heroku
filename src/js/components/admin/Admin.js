import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class Admin extends Component {
  render() {
    return (
      <div>

        <div className="col-lg-12">
          <div className="ibox float-e-margins">
            <div className="ibox-content text-center p-md">

              <h3><span className="text-navy">INSPINIA - Responsive Admin Theme</span>
               is provided with two main layouts <br/>three skins and separate configure options.</h3>

            </div>
          </div>
        </div>

        {this.props.children}

      </div>
    );
  }
}

Admin.propTypes = {
  children: PropTypes.element.isRequired
};

export default Admin;


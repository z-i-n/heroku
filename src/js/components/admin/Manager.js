import React, { Component, PropTypes } from 'react';

class Manager extends Component {
  render() {
    return (
      <div>
        <h3>Manager</h3>
        {this.props.children}
      </div>
    );
  }
}

export default Manager;
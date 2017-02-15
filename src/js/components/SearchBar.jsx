import React, { PureComponent } from 'react';
import TextField from 'material-ui/TextField';

import { SERVER_HOST, PROTOCOL } from '../settings';

/**
* Debounce active update of table data
*
* @param  {func}   func - heavy function to stall
* @param  {int}    wait - interval to call func
* @param  {bool}   immediate - run now
* @return {func}
*/
function _debounce(func, wait, immediate) {
  // init
  let timeout;
  // return closure so timeouts survive
  // only to cancel them
  return function debouncer(...args) {
    const context = this;
    function later() {
      // reset timeout
      timeout = null;
      // run func
      if (!immediate) func.apply(context, args);
    }
    const callNow = immediate && !timeout;
    // clear previous timer from closure
    // and start over
    clearTimeout(timeout);
    // start new wait tick
    timeout = setTimeout(later, wait);
    // call func now
    if (callNow) func.apply(context, args);
  };
}

/**
* _sameSearchTerm returns whether or not a new and old search terms
* are similar.
*
* @param {str}   value - new search value
* @param {str}   old - previous search value, from local state
* @return {bool}
*/
const _sameSearchTerm = (value, old) => value.trim() === old.trim();

export class SearchBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  handleSearch(e, value) {
    const oldValue = this.state.value;
    // save on API calls
    if (value === '' || _sameSearchTerm(value, oldValue)) {
      return false;
    }

    // store new term for comparison
    this.setState({ value });

    // hit API for term
    // @todo will need to search on more criteria + fuzzy
    return fetch(`${PROTOCOL}${SERVER_HOST}/search/${value.toLowerCase()}`)
      .then((res) => res.json())
      .then((json) => this.props.searchDone(json, value));
  }

  render() {
    return (
      <div>
        {/* search field */}
        <TextField
          floatingLabelStyle={{ color: 'rgb(242, 101, 50)' }}
          floatingLabelText="Search by generic drug name or universal code"
          id="drug-code-autocomplete"
          // accommodate slower typists
          onChange={_debounce(this.handleSearch.bind(this), 500)}
          style={{ width: '100%' }}
          underlineFocusStyle={{
            borderBottomColor: 'rgba(242, 101, 50, 0.55)',
            borderTopColor: 'rgba(242, 101, 50, 0.55)',
            borderLeftColor: 'rgba(242, 101, 50, 0.55)',
            borderRightColor: 'rgba(242, 101, 50, 0.55)',
          }}
          underlineStyle={{
            borderBottomColor: '#DDD',
          }}
        />
      </div>
    );
  }
}

SearchBar.propTypes = {
  params: React.PropTypes.object,
};

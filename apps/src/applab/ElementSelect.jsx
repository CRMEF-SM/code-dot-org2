var elementUtils = require('./designElements/elementUtils.js');

module.exports = React.createClass({
  propTypes: {
    onChangeElement: React.PropTypes.func.isRequired,
    elements: React.PropTypes.arrayOf(React.PropTypes.string),
    selected: React.PropTypes.instanceOf(HTMLElement)
  },

  handleChange: function (e) {
    var element = elementUtils.getPrefixedElementById(e.target.value);
    this.props.onChangeElement(element, null);
  },

  render: function() {
    var selected = elementUtils.getId(this.props.selected);

    return (
      <div style={{float: 'right', marginRight: '-10px'}}>
        <select value={selected} onChange={this.handleChange} style={{width: '150px'}}>
          {this.props.elements.map(function (element) {
            return <option>{element.display}</option>;
          })}
        </select>
      </div>
    );
  }
});

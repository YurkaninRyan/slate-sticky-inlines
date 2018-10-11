import immutable from 'immutable';
import StickyInlines from '..';
import React from 'react';
import ReactDOM from 'react-dom';
import initialValue from './value';
import { Value } from 'slate';
import { Editor } from 'slate-react';

class Example extends React.Component {
  plugins = [
    StickyInlines({
      bannedTypes: [
        'banned',
        'no-sticky-boundary-link',
        'cant-be-empty-link',
        'doesnt-stick-on-delete-link'
      ]
    }),
    StickyInlines({
      allowedTypes: ['no-sticky-boundary-link'],
      hasStickyBoundaries: false
    }),
    StickyInlines({ allowedTypes: ['cant-be-empty-link'], canBeEmpty: false }),
    StickyInlines({
      allowedTypes: ['doesnt-stick-on-delete-link'],
      stickOnDelete: false
    })
  ];

  state = {
    value: Value.fromJSON(initialValue)
  };

  onChange = ({ value }) => {
    this.setState({ value });
  };

  renderNode = props => {
    switch (props.node.type) {
      case 'link': {
        const className = props.isSelected ? 'focused' : '';
        return (
          <a className={className} href="/" {...props.attributes}>
            {props.children}
          </a>
        );
      }
      case 'no-sticky-boundary-link': {
        const className = props.isSelected ? 'focused' : '';
        return (
          <a className={className} href="/" {...props.attributes}>
            {props.children}
          </a>
        );
      }
      case 'cant-be-empty-link': {
        const className = props.isSelected ? 'focused' : '';
        return (
          <a className={className} href="/" {...props.attributes}>
            {props.children}
          </a>
        );
      }
      case 'doesnt-stick-on-delete-link': {
        const className = props.isSelected ? 'focused' : '';
        return (
          <a className={className} href="/" {...props.attributes}>
            {props.children}
          </a>
        );
      }
      case 'banned': {
        const className = props.isSelected ? 'focused banned' : 'banned';
        return (
          <a className={className} href="/" {...props.attributes}>
            {props.children}
          </a>
        );
      }
    }
  };

  render = () => {
    return (
      <Editor
        plugins={this.plugins}
        value={this.state.value}
        renderNode={this.renderNode}
        onChange={this.onChange}
      />
    );
  };
}

const example = <Example />;
const root = document.body.querySelector('main');
ReactDOM.render(example, root);

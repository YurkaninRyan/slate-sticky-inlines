
import StickyInlines from '..'
import React from 'react'
import ReactDOM from 'react-dom'
import initialState from './state.json'
import { Editor, Raw } from 'slate'

const schema = {
  nodes: {
    link: (props) => {
      const focused = props.state.isFocused && props.state.selection.hasEdgeIn(props.node)
      const className = focused ? "focused" : ""
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    }
  }
}

class Example extends React.Component {
  plugins = [
    StickyInlines({})
  ];

  state = {
    state: Raw.deserialize(initialState, { terse: true })
  };

  onChange = (state) => {
    this.setState({ state })
  }

  render = () => {
    return (
      <Editor
        schema={schema}
        onChange={this.onChange}
        plugins={this.plugins}
        state={this.state.state}
      />
    )
  }
}

const example = <Example />
const root = document.body.querySelector('main')
ReactDOM.render(example, root)

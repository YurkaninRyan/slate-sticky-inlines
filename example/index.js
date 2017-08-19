
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
    },
    "no-sticky-boundary-link": (props) => {
      const focused = props.state.isFocused && props.state.selection.hasEdgeIn(props.node)
      const className = focused ? "focused" : ""
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    },
    "cant-be-empty-link": (props) => {
      const focused = props.state.isFocused && props.state.selection.hasEdgeIn(props.node)
      const className = focused ? "focused" : ""
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    },
    banned: (props) => {
      const focused = props.state.isFocused && props.state.selection.hasEdgeIn(props.node)
      const className = focused ? "focused banned" : "banned"
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    }
  }
}

class Example extends React.Component {
  plugins = [
    StickyInlines({ bannedTypes: ["banned", "no-sticky-boundary-link", "cant-be-empty-link"] }),
    StickyInlines({ allowedTypes: ["no-sticky-boundary-link"], hasStickyBoundaries: false }),
    StickyInlines({ allowedTypes: ["cant-be-empty-link"], canBeEmpty: false })
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

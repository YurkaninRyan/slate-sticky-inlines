
import immutable from 'immutable'
import StickyInlines from '..'
import React from 'react'
import ReactDOM from 'react-dom'
import initialState from './state'
import { State } from 'slate'
import { Editor } from 'slate-react'

const schema = {
  nodes: {
    link: (props) => {
      const focused = props.state.isFocused && props.state.inlines.includes(props.node)
      const className = focused ? "focused" : ""
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    },
    "no-sticky-boundary-link": (props) => {
      const focused = props.state.isFocused && props.state.inlines.includes(props.node)
      const className = focused ? "focused" : ""
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    },
    "cant-be-empty-link": (props) => {
      const focused = props.state.isFocused && props.state.inlines.includes(props.node)
      const className = focused ? "focused" : ""
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    },
    "doesnt-stick-on-delete-link": (props) => {
      const focused = props.state.isFocused && props.state.inlines.includes(props.node)
      const className = focused ? "focused" : ""
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    },
    banned: (props) => {
      const focused = props.state.isFocused && props.state.inlines.includes(props.node)
      const className = focused ? "focused banned" : "banned"
      return <a className={className} href="/" {...props.attributes}>{props.children}</a>
    }
  }
}

class Example extends React.Component {
  plugins = [
    StickyInlines({ bannedTypes: ["banned", "no-sticky-boundary-link", "cant-be-empty-link", "doesnt-stick-on-delete-link"] }),
    StickyInlines({ allowedTypes: ["no-sticky-boundary-link"], hasStickyBoundaries: false }),
    StickyInlines({ allowedTypes: ["cant-be-empty-link"], canBeEmpty: false }),
    StickyInlines({ allowedTypes: ["doesnt-stick-on-delete-link"], stickOnDelete: false })
  ];

  state = {
    state: State.fromJSON(initialState)
  };

  onChange = ({ state }) => {
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

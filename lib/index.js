/**
 * Cross Boundaries on Left Arrow, or Right arrow
 * when on the Start or End of an inline boundary
 *
 * @param {Object} options
 *   @property {Array} allowedTypes (optional)
 *   @property {Array} bannedTypes (optional)
 * @return {Object} plugin
 */

function StickyInlines({
  allowedTypes = null,
  bannedTypes = []
}) {
  if (allowedTypes && !Array.isArray(allowedTypes)) { console.warn("slate-sticky-inline: allowedTypes must be an Array of Strings") }
  if (!Array.isArray(bannedTypes)) { console.warn("slate-sticky-inlines: bannedTypes must be an Array of Strings") }

  const ARROW_LEFT = 37
  const ARROW_RIGHT = 39

  /**
   * Return true if settings bans the inline type, or it is void.
   *
   * @param {Inline} inline
   * @return {Boolean}
   */

  function isInlineBanned(inline) {
    // Something crazy happened, there is no inline, or somehow focus inline is not an inline.
    if (!inline || inline.kind !== 'inline') return true

    // The inline we are working with isn't allowed by user config.
    if (allowedTypes && !allowedTypes.includes(inline.type)) return true
    if (bannedTypes.includes(inline.type)) return true

    return false
  }

  /**
   * Keydown entry point.
   *
   * @param {Event} event
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function handleKeyDown(event, data, state, editor) {
    if (event.which !== ARROW_LEFT && event.which !== ARROW_RIGHT) return
    if (state.focusInline && isInlineBanned(state.focusInline)) return

    // In these cases we are actually inside the inline.
    if (state.focusInline) {
      // In normal slate inline world, these two boundaries are the true start/end of an Inline.
      // Since you can never actually move the start or end of an inline (that's what we are fixing after all!)
      const isAtSecondToLastCharacter = state.selection.endOffset === state.focusInline.text.length - 1
      const isAtSecondToFirstCharacter = state.selection.endOffset === 1

      // Thanks to this very plugin, it's common to be in this state where you are at the edge of an inline.
      const isAtLastCharacter = state.selection.endOffset === state.focusInline.text.length
      const isAtFirstCharacter = state.selection.endOffset === 0

      const inlineIndex = state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === state.focusInline.key })
      const modifier = isAtLastCharacter ? inlineIndex + 1 : inlineIndex - 1
      const upcomingNode = state.focusBlock.nodes.get(modifier)

      if (modifier === -1) return

      if (isAtLastCharacter && upcomingNode && event.which === ARROW_RIGHT) {
        event.preventDefault()
        return state.transform().collapseToStartOf(upcomingNode).apply({ save: false })
      } else if (isAtFirstCharacter && upcomingNode && event.which === ARROW_LEFT) {
        event.preventDefault()
        return state.transform().collapseToEndOf(upcomingNode).apply({ save: false })
      }

      if (isAtSecondToLastCharacter && event.which === ARROW_RIGHT) {
        event.preventDefault()
        return state.transform().collapseToEndOf(state.focusInline).apply({ save: false })
      } else if (isAtSecondToFirstCharacter && event.which === ARROW_LEFT) {
        event.preventDefault()
        return state.transform().collapseToStartOf(state.focusInline).apply({ save: false })
      }
    } else {
      // We are outside of an inline and need to figure out
      const isAtEndOfCurrentTextNode = state.selection.endOffset === state.focusText.length
      const isAtStartOfCurrentTextNode = state.selection.endOffset === 0

      if (!isAtEndOfCurrentTextNode && !isAtStartOfCurrentTextNode) return
      const textNodeIndex = state.focusBlock.nodes.toJS().findIndex((node) => { return node.key === state.focusText.key })
      const modifier = isAtStartOfCurrentTextNode && event.which === ARROW_LEFT ? textNodeIndex - 1 : textNodeIndex + 1
      const upcomingNode = state.focusBlock.nodes.get(modifier)

      if (!upcomingNode || !upcomingNode.kind === 'inline' || upcomingNode.isVoid || modifier === -1) return

      if (isAtEndOfCurrentTextNode && event.which === ARROW_RIGHT) {
        event.preventDefault()
        return state.transform().collapseToStartOf(upcomingNode).apply({ save: false })
      }
      if (isAtStartOfCurrentTextNode && event.which === ARROW_LEFT) {
        event.preventDefault()
        return state.transform().collapseToEndOf(upcomingNode).apply({ save: false })
      }
    }
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onKeyDown: handleKeyDown,
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

export default StickyInlines

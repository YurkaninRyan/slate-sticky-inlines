/**
 * Cross Boundaries on Left Arrow, or Right arrow
 * when on the Start or End of an inline boundary
 * can delete all the text inside and still type to add more
 *
 * @param {Object} options
 *   @property {Array} allowedTypes (optional)
 *   @property {Array} bannedTypes (optional)
 *   @property {Boolean} hasStickyBoundaries (optional)
 *   @property {Boolean} canBeEmpty (optional)
 * @return {Object} plugin
 */

function StickyInlines({
  allowedTypes = null,
  bannedTypes = [],
  hasStickyBoundaries = true,
  canBeEmpty = true,
}) {
  if (allowedTypes && !Array.isArray(allowedTypes)) { console.warn("slate-sticky-inline: allowedTypes must be an Array of Strings") }
  if (!Array.isArray(bannedTypes)) { console.warn("slate-sticky-inlines: bannedTypes must be an Array of Strings") }

  const ARROW_LEFT = 37
  const ARROW_RIGHT = 39
  const DELETE = 46
  const BACKSPACE = 8
  const ZERO_WIDTH_SPACE = '\u200b'

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
   * Caret Manipulation logic
   *
   * @param {Event} event
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function handleArrowKeys(event, object, state, editor) {
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

      // We are on an edge on the inside of an inline.  If they don't want sticky boundaries,
      // then it doesn't stick here.
      if (hasStickyBoundaries) {
        if (isAtLastCharacter && upcomingNode && event.which === ARROW_RIGHT) {
          event.preventDefault()
          return state.transform().collapseToStartOf(upcomingNode).apply({ save: false })
        } else if (isAtFirstCharacter && upcomingNode && event.which === ARROW_LEFT) {
          event.preventDefault()
          return state.transform().collapseToEndOf(upcomingNode).apply({ save: false })
        }
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

      if (isInlineBanned(upcomingNode) || !hasStickyBoundaries || upcomingNode.isVoid || modifier === -1) return

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
   * Sticky Delete Link logic
   *
   * @param {Event} event
   * @param {Object} data
   * @param {State} state
   * @param {Editor} editor
   * @return {State}
   */

  function handleDeleteKey(event, data, state, editor) {
    if (!state.focusInline || !canBeEmpty) return
    if (state.focusInline.text.length === 1 && state.focusInline.text === ZERO_WIDTH_SPACE) return

    if (state.focusInline.text.length !== 1) return
    event.preventDefault()

    return state.transform().insertText(ZERO_WIDTH_SPACE).move(-1).deleteBackward().move(1).apply()
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
    // We are working inside a specific inline, and they specifically said they don't want it to be sticky.
    if (state.focusInline && isInlineBanned(state.focusInline)) return

    // They are moving the caret around, let's see if we need to interfere.
    if (event.which === ARROW_LEFT || event.which === ARROW_RIGHT) return handleArrowKeys(event, data, state, editor)
    if (event.which === DELETE || event.which === BACKSPACE) return handleDeleteKey(event, data, state, editor)
  }

  /**
   * Change entry point.  Used right now to clean up non-focused empty inline artifacts
   *
   * @param {State} state
   * @return {State}
   */

  function handleChange(state) {
    if (!canBeEmpty) return state

    const toRemove = state.document.getInlines().reduce((failures, inline) => {
      const hasFocus = state.isFocused && state.selection.hasEdgeIn(inline)
      const onlyHasZeroWidthSpace = inline.text === ZERO_WIDTH_SPACE

      if (isInlineBanned(inline)) return failures
      return !hasFocus && onlyHasZeroWidthSpace ? [inline, ...failures] : failures
    }, [])

    if (!toRemove.length) return state
    let updates = state.transform()

    toRemove.forEach((failure) => updates = updates.removeNodeByKey(failure.key))
    return updates.apply({ save: false })
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onKeyDown: handleKeyDown,
    onChange: handleChange,
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

export default StickyInlines

import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'
import onArrowOver from './onArrowOver'
import onDelete from './onDelete'
import { isInlineBanned } from './utils'

const defaults = {
  allowedTypes: null,
  bannedTypes: [],
  hasStickyBoundaries: true,
  canBeEmpty: true,
  stickOnDelete: true,
}

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
 *   @property {Boolean} stickOnDelete (optional)
 * @return {Object} plugin
 */

function StickyInlines(opts) {
  opts = Object.assign({}, defaults, opts)
  const { allowedTypes, bannedTypes, hasStickyBoundaries, canBeEmpty } = opts

  if (allowedTypes && !Array.isArray(allowedTypes)) { console.warn('slate-sticky-inline: allowedTypes must be an Array of Strings') }
  if (!Array.isArray(bannedTypes)) { console.warn('slate-sticky-inlines: bannedTypes must be an Array of Strings') }

  /**
   * Keydown entry point.
   *
   * @param {Event} event
   * @param {Object} data
   * @param {Change} change
   * @param {Editor} editor
   * @return {Change}
   */

  function onKeyDown(event, data, change, editor) {
    // We are working inside a specific inline, and they specifically said they don't want it to be sticky.
    if (change.state.focusInline && isInlineBanned(change.state.focusInline, opts)) return

    // They are moving the caret around, let's see if we need to interfere.
    if (event.which === ARROW_LEFT || event.which === ARROW_RIGHT) return onArrowOver(event, data, change, editor, opts)
    if (event.which === DELETE || event.which === BACKSPACE) return onDelete(event, data, change, editor, opts)
  }

  /**
   * Change entry point.  Used right now to clean up non-focused empty inline artifacts
   *
   * @param {Change} change
   * @return {Change}
   */

  function onChange(change) {
    if (!canBeEmpty) return change

    const toRemove = change.state.document.getInlines().reduce((failures, inline) => {
      const hasFocus = change.state.isFocused && change.state.selection.hasEdgeIn(inline)
      const onlyHasZeroWidthSpace = inline.text === ZERO_WIDTH_SPACE

      if (isInlineBanned(inline, opts)) return failures
      return !hasFocus && onlyHasZeroWidthSpace ? [inline, ...failures] : failures
    }, [])

    if (!toRemove.length) return change
    toRemove.forEach((failure) => change = change.removeNodeByKey(failure.key))
    return change
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onKeyDown,
    onChange,
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

export default StickyInlines

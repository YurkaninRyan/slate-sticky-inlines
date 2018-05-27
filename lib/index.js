import { findRange } from 'slate-react'

import { ARROW_LEFT, ARROW_RIGHT, BACKSPACE, DELETE, ZERO_WIDTH_SPACE } from './constants'
import onArrowLeft from './onArrowLeft'
import onArrowRight from './onArrowRight'
import onBackspace from './onBackspace'
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
   * @param {Change} change
   * @param {Editor} editor
   * @return {Change}
   */

  function onKeyDown(event, change, editor) {
    // We are working inside a specific inline, and they specifically said they don't want it to be sticky.
    if (change.value.focusInline && isInlineBanned(change.value.focusInline, opts)) return null

    // They are moving the caret around, let's see if we need to interfere.
    switch (event.which) {
      case ARROW_LEFT:
        return onArrowLeft(event, change, editor, opts)
      case ARROW_RIGHT:
      return onArrowRight(event, change, editor, opts)
      case BACKSPACE:
        return onBackspace(event, change, editor, opts)
      case DELETE:
        return onDelete(event, change, editor, opts)
      default:
        return null
    }
  }

  /**
   * Change entry point.  Used right now to clean up non-focused empty inline artifacts
   *
   * @param {Change} change
   * @return {Change}
   */

  function onChange(change) {
    if (!canBeEmpty) return null
    const hasSave = change.flags.hasOwnProperty('save')
    const toRemove = change.value.document.getInlines().reduce((failures, inline) => {
      const hasFocus = change.value.isFocused && change.value.selection.hasEdgeIn(inline)
      const onlyHasZeroWidthSpace = inline.text === ZERO_WIDTH_SPACE

      if (isInlineBanned(inline, opts)) return failures
      return !hasFocus && onlyHasZeroWidthSpace ? [inline, ...failures] : failures
    }, [])

    if (!toRemove.length) return null

    toRemove.forEach((failure) => change = change.removeNodeByKey(failure.key))
    return true
  }

  /**
   * Select entry point.  Simply blocks the core onSelect if we
   * set the selection ourselves. It tries to force selections at the end of an
   * inline block to be the next text node over.
   *
   * @param {Event} event
   * @param {Change} change
   * @return {Change}
   */

  function onSelect(event, change) {
    if (!change.value.focusInline) return null
    const selection = findRange(window.getSelection(), change.value)
    if (!selection) return null
    const focusInline = change.value.document.getClosestInline(selection.anchorKey)
    if (!focusInline) return null

    const selectionIsAtEndOfInline = focusInline.key === change.value.focusInline.key &&
      selection.focusOffset === focusInline.text.length

    if (
      selection.isCollapsed &&
      selectionIsAtEndOfInline
    ) { return change }

    return null
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */

  return {
    onKeyDown,
    onChange,
    onSelect,
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

export default StickyInlines

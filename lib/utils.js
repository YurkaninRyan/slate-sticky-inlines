/**
 * Return true if settings bans the inline type, or it is void.
 *
 * @param {Inline} inline
 * @param {Object} opts
 * @return {Boolean}
 */

export function isInlineBanned(inline, opts) {
  const { allowedTypes, bannedTypes } = opts

  // Something crazy happened, there is no inline, or somehow focus inline is not an inline.
  if (!inline || inline.kind !== 'inline' || inline.isVoid) return true

  // The inline we are working with isn't allowed by user config.
  if (allowedTypes && !allowedTypes.includes(inline.type)) return true
  if (bannedTypes.includes(inline.type)) return true

  return false
}

/**
 * Prevents default event behavior, and either collapses to or extends to the start
 * of a node
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Event} event
 * @param {Number} offset (optional)
 * @return {Change}
 */

export function moveToEndOf(change, node, event, offset = 0) {
  event.preventDefault()
  return event.shiftKey ? change.extendToEndOf(node).extend(offset) : change.collapseToEndOf(node).move(offset)
}

/**
 * Prevents default event behavior, and either collapses to or extends to the end
 * of a node
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Event} event
 * @param {Number} offset (optional)
 * @return {Change}
 */

export function moveToStartOf(change, node, event, offset = 0) {
  event.preventDefault()
  return event.shiftKey ? change.extendToStartOf(node).extend(offset) : change.collapseToStartOf(node)
}


/** @jsx h */

import h from 'slate-hyperscript'

export default (
  <state>
    <document>
      <block type="paragraph">
        <text>Try editing on the edges of the link </text>
        <inline type="link">You should be able to arrow over to cross boundaries!</inline>
        <text> It's a bit more obvious when they are not spaces around the words</text>
      </block>
      <block type="paragraph">
        <text>This next inline is banned though </text>
        <inline type="banned">So it should behave like a normal inline in slate would behave</inline>
        <text> have fun trying to edit the edges, nerd! >:D</text>
      </block>
      <block type="paragraph">
        <text>This next link has no sticky inline without sticky boundaries </text>
        <inline type="no-sticky-boundary-link">It's possible to get on either edge, but the arrow key doesn't always need a double tap to do it.</inline>
        <text> Instead it only depends on which direction you are coming from!</text>
      </block>
      <block type="paragraph">
        <text>By default, you can delete all the text inside of a sticky inline, and continue to type inside it (unless you press backspace again in an empty inline) </text>
        <inline type="cant-be-empty-link">This inline dissappears after being deleted however, unlike the other sticky inlines</inline>
        <text> if it could be empty however, it also would automagically delete itself if it was in it's pseudo-empty state but it wasn't focused!</text>
      </block>
      <block type="paragraph">
        <text>By default, if you delete 'into' a sticky inline, the cursor jumps into the inline </text>
        <inline type="doesnt-stick-on-delete-link">This inline just keeps the cursor on the outside</inline>
        <text> whatever your preference is!</text>
      </block>
    </document>
  </state>
)

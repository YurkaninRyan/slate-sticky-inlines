
# `slate-sticky-inlines`

A Slate plugin that makes it possible to edit the edges of Inlines.


## Demo

http://ryanyurkan.in/slate-sticky-inlines


## Install

```
npm install slate-sticky-inlines
```

## Usage

```js
import StickyInlines from 'slate-sticky-inlines'

const plugins = [
  StickyInlines({
    allowedTypes: ['link'],
    bannedTypes: ['file'],
    canBeEmpty: true,
    hasStickyBoundaries: true,
    stickOnDelete: true,
  })
]
```

#### Arguments
- `allowedTypes [:String]` — An array of specific `Inline Types` that should be sticky.  Defaults to allowing all types to be sticky.
- `bannedTypes [:String]` — An array of specific `Inline Types` that shouldnt be sticky.  Defaults to an empty `Array`.
- `canBeEmpty Boolean` — Controls whether or not you need to delete twice to get rid of a sticky inline.  Defaults to `True`.
- `hasStickyBoundaries Boolean` — Controls whether or not an extra step is introduced at the boundaries of sticky inlines, which allows you to switch the bounds you are in without moving the text caret.  Defaults to `True`.
- `stickOnDelete Boolean` — Controls whether on not deleting 'into' a sticky inline should cause the caret to cross over and be inside the sticky inline.  Defaults to `True`.

## Development

Clone the repository and then run:

```
npm install
npm run watch
```

And open the [example page](http://localhost:8888) in your browser:

```
http://localhost:8888/
```


## License

The MIT License

Copyright &copy; 2017, [Ryan Yurkanin](ryanyurkan.in)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#DOM Stack


Create a stack of DOM elements. You can hide/show the elements, transit between them, or move them all together.

##Installation

```bash
npm install dom-stack
```

##How to use

###Initialize

Require and initialize dom-stack:

```js
var Stack = require("dom-stack"),
  stack = new Stack();
```

Let's say that we have five dom elements:

```js
var sections = document.querySelectorAll("section");
var dom1 = sections[0];
var dom2 = sections[1];
var dom3 = sections[2];
var dom3 = sections[3];
var dom3 = sections[4];
```

###Add dom elements

You can add the dom elements. They will be removed from their current position in the DOM and be added to the stack.

```js
stack.add(dom1);
stack.add(dom2);
stack.add(dom3);
stack.add(dom4);
stack.add(dom5);
```

###Remove dom elements

You can remove dom elements from the stack:

```js
stack.remove(dom4);
stack.remove(dom5);
```

###Place the stack

You can attach the stack to a parent element. All the elements from the stack will be appended to main, in the same order that they were added. You can call place again to attach the stack to another dom element.

```js
stack.place(document.querySelector("main"));
```

###Reorder dom elements:

Then you can reorder the elements.

```js
stack.up(dom2); // the order will be: dom2, dom1, dom3
stack.down(dom1); // the order will be: dom2, dom3, dom1
```

Or you can move a dom element directly to a new location:

```js
stack.move(dom3, 0); // the order will be: dom3, dom2, dom1
```

###Insert new dom elements

Let's reinsert the dom elements that we previously removed:

```js
stack.insert(dom4, 0); // the order will be: dom4, dom3, dom2, dom1;
stack.insert(dom5, 3); // the order will be: dom4, dom3, dom2, dom5, dom1;
```

You can now where a dom element is at anytime, and how many dom elements you have:

```js
stack.getPosition(dom5); // 3
stack.count(); // 5
```




LICENSE
=======

MIT

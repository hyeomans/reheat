@doc overview
@id index
@name Schema Guide
@description

# Schema

<page-list></page-list>

@doc overview
@id overview
@name Overview
@description

Reheat uses the [robocop.js](http://jmdobry.github.io/robocop.js/) library for schema definition and validation.

You are not required to provide a Schema when defining a Model, but if you do, instances of your Model will
automatically be validated against the Model's Schema during create and update operations.

<page-list></page-list>

```js
var reheat = require('reheat');

var personSchema = reheat.defineSchema('PersonSchema', {
  name: {
    type: 'string',
    maxLength: 255
  },
  age: {
    type: 'number',
    max: 120,
    min: 0
  }
});

// This Model will use personSchema as its Schema
var Person = reheat.defineModel('Person', {
  schema: personSchema,
  {...}
});

// This Model will not use any Schema
var FreestylePerson = reheat.defineModel('FreestylePerson', {...});
```

@doc overview
@id robocop
@name Robocop Library
@description

[robocop.js](http://jmdobry.github.io/robocop.js/) robocop.js is a library that allows you to define and validate rules, datatypes and schemata in Node and in the browser.

Reheat delegates Schema functionality to robocop.js.

```js
reheat.defineSchema('PersonSchema', {
  name: {
    type: 'string'
  }
});

var Person = reheat.defineModel('Person', {
  schema: reheat.getSchema('PersonSchema'),
  {...}
});
```

See the [robocop API](http://jmdobry.github.io/robocop.js/api.html#robocop) for details on the `robocop` methods exposed on the `reheat` object.

@doc overview
@id rules
@name Rules & Data Types
@description

[robocop.js](http://jmdobry.github.io/robocop.js/) ships with a number of rules and data types, but you can define your
own.

### Default Rules
- nullable
- max
- min
- maxLength
- minLength
- type

### Default Data Types
- string
- number
- integer
- float
- array
- object
- boolean
- date

See [robocop.defineRule(name, ruleFunc)](http://jmdobry.github.io/robocop.js/api.html#robocopdefinerule) and
[robocop.defineDatatype(name, def)](http://jmdobry.github.io/robocop.js/api.html#robocopdefinedatatype) for defining
custom rules and data types.

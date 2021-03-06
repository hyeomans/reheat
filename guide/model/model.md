@doc overview
@id index
@name Model Guide
@description

# Model

<page-list></page-list>

@doc overview
@id overview
@name Overview
@description

You define models via `reheat.defineModel()` which map to tables. Instances of your models map to individual rows in the tables.

Terms used in documentation:

- _Model_ - Reheat's Model class.
- _model(s)_ - Your models you've created via `reheat.defineModel()` (map to tables).
- _(model) instances_ - Instances of your models (map to rows).
- `Model#property` - Refers to prototype or instance properties of instances of a model you've defined.
- `Model.property` - Refers to static properties on a model you've defined.

<page-list></page-list>

```js
var reheat = require('reheat');
var Connection = reheat.Connection;

// This Model will use personSchema as its Schema
var Person = reheat.defineModel('Person', {
  tableName: 'person',
  connection: new Connection()
});

var person = new Person({
  name: 'John Anderson',
  age: 30
});

person.isNew(); //  true

person.save(function (err, person) {
  person.toJSON();    //  {
                      //      name: 'John Anderson',
                      //      age: 30,
                      //      id: '4a16101b-f35e-46d5-be0e-3a9596abfcf9'
                      //  }

  person.isNew(); //  false
});
```

@doc overview
@id options
@name Defining models
@description

[reheat.defineModel()](/documentation/api/api/reheat.defineModel) accepts three arguments: `name`, `staticProperties` and `prototypeProperties`.

Example:

```js
var Person = reheat.defineModel('Person', {
  // These properties will be available on Person itself
  say: function () {
    return 'Person!';
  },
  whisper: function () {
    return 'Shhhhh';
  }
}, {
  // These properties will be on the prototype of any instances of Person
  say: function () {
    return 'Hello';
  },
  yell: function () {
    return 'Oho!';
  }
});

Person.say(); // "Person!"
Person.whisper(); // "Shhhhh"
Person.yell(); // TypeError: Object function Person(...) {...} has no method 'yell'

var person = new Person();

person.say(); // "Hello"
person.whisper(); // TypeError: Object #<person> has no method 'whisper'
person.yell(); // "Oho!"
```

### prototype properties

This is optional. Instances of your models will work just fine without you adding anything to their prototype. Generally,
if you do provide any prototype properties then they will be methods, and more specifically, methods that override
existing methods already defined on `Model.prototype` such as `toJSON()` and `afterValidate()`.

Example:

```js
var Person = reheat.defineModel('Person', {...}, {
  // Override toJSON() for custom serialization
  toJSON: function () {
    var attrs = Model.prototype.toJSON.call(this);
    delete attrs.secretField;
    return attrs;
  },

  // Override afterCreate() to perform logic needed after database inserts
  afterCreate: function(instance, meta, cb) {
    // send transactional email, etc.
    console.log('sent transactional email!');
    cb(null, instance, meta);
  }

});

var person = new Person({
  name: 'John Anderson',
  secretField: 'secret'
});

person.toJSON(); // { name: 'John Anderson' }

person.save(function (err, person, meta) {
  person.toJSON(); { name: 'John Anderson', id: '4a16101b-f35e-46d5-be0e-3a9596abfcf9' }
}); // "sent transactional email!"
```

### static properties

These properties configure your new model. This argument is required because every model needs an instance of `Connection` to function.

Example:

```js
var Person = reheat.defineModel('Person', {
  connection: new reheat.Connection()
});
```

The static properties also configure things such as `tableName`, `softDelete`, `timestamps` and `schema`.

Example:

```js
var Person = reheat.defineModel('Person', {
  // required
  connection: new reheat.Connection(),

  // optional
  schema: reheat.defineSchema('PersonSchema', {
    name: {
      type: 'string'
    }
  }),

  // optional - default "test"
  tableName: 'person',

  // optional - default false
  softDelete: true,

  // optional - default false
  timestamps: true
});

Person.tableName; // "person"
Person.softDelete; // true
Person.timestamps; // true

Person.connection.run(Person.connection.r.tableList(), function(err, tableList) {
  tableList; // [ "person", ... ]

  Person.schema.validate({
    name: 1234
  }, function (err) {
    err;    //  {
            //      name: {
            //          errors: [{
            //              rule: 'type',
            //              actual: 'number',
            //              expected: 'string'
            //          }]
            //      }
            //  }
  });
});
```

See [Model.extend()](/documentation/api/api/Model.static_methods:extend) for detailed information.

@doc overview
@id instances
@name Model instances
@description

"Instances" or "model instances" refer to instantiations of the models you have defined via `reheat.defineModel()`. These
instances inherit properties from `Model.prototype`, including any prototype properties you defined when you extended
`Model`.

When you instantiate a model, the constructor function accepts one argument `attrs`, which are the initial properties
of the instances. These properties are saved in `Model#attributes`.

Example:

```js
var person = new Person({ name: 'John Anderson'});

person.attributes; // { name: 'John Anderson'}
```

`Model#attributes`, while a JavaScript Object in memory, represents the JSON document (in this example) specified by
`Person#attributes[Person.idAttribute]` in the table specified by `Person.tableName`. Model instances inherit a number
of methods from `Model.prototype`.

@doc overview
@id lifecycle
@name Model Lifecycle
@description

The CRUD operations performed on instances of each model go through a lifecycle. By default, the lifecycle steps don't
do anything except for the CRUD operation itself.

What about `this`? Each lifecycle step is executed in the context of the instance on which you called `save([options][, cb])` or `destroy([options][, cb])`.

## Lifecycle steps

#### Model#save(cb)

If `isNew() === true`:

- `beforeValidate(cb)`
- `validate(cb)` - Generally you won't override this unless you want 100% custom validation, otherwise this step will validate `this.attributes` against the schema of the model.
- `afterValidate(cb)`
- `beforeCreate(cb)`
- `save(cb)` - Don't override this, bad things might happen!
- `afterCreate(instance, cb)` - Make sure to pass along `instance` if you override this! i.e. `cb(null, instance)`

Else if `isNew() === false`:

- `beforeValidate(cb)`
- `validate(cb)` - Generally you won't override this unless you want 100% custom validation, otherwise this step will validate `this.attributes` against the schema of the model.
- `afterValidate(cb)`
- `beforeUpdate(cb)`
- `save(cb)` - Don't override this, bad things might happen!
- `afterUpdate(instance, cb)` - Make sure to pass along `instance` if you override this! i.e. `cb(null, instance)`

#### Model#destroy(cb)

- `beforeDestroy(cb)`
- `destroy(cb)` - Don't override this, bad things might happen!
- `afterDestroy(instance, cb)` - Make sure to pass along `instance` if you override this! i.e. `cb(null, instance)`

@doc overview
@id saving
@name Saving Data
@description

You save data to the database by calling `save([options][, cb])` on instances of your models.

If an instance is new, meaning that its properties do not yet contain the field specified by the instance's model's
`idAttribute` field, then the save operation will be an insert (see [r#insert](http://rethinkdb.com/api/javascript#insert)).

If an instance is __not__ new, meaning that is properties already contain the field specified by the instance's model's
`idAttribute` field, then the save operation will be an update (see [r#update](http://rethinkdb.com/api/javascript#update)).

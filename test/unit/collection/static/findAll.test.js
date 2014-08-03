var dependable = require('dependable');

module.exports = function (container, assert, Promise, errors, mout, support) {

  return function () {
    var errorPrefix = 'Collection.findAll(predicate[, options][, cb]): ',
      findAll,
      new_container,
      Collection,
      Model;

    beforeEach(function () {

      new_container = dependable.container();

      new_container.register('Collection', {});
      new_container.register('models', {});
      new_container.register('collections', {});

      Collection = function () {

      };
      Model = function () {
      };

      Collection.model = Model;
      Model.collection = Collection;
      Model.connection = {};
      Model.r = container.get('r_mock');

      Model.connection.run = Promise.promisify(function (query, options, cb) {
        cb(null, {
          toArray: function () {
            return Promise.resolve([
              {
                author: 'John Anderson'
              },
              {
                author: 'Sally Johnson'
              }
            ]);
          }
        });
      });

      findAll = container.get('Collection_findAll', {
        container: new_container,
        models: {},
        collections: {}
      });
    });

    it('should work', function (done) {

      findAll.apply(Collection, [
        {},
        function (err, collection) {
          if (err) {
            done(err);
          } else {
            assert.isTrue(collection instanceof Collection);
            findAll.apply(Collection, [
              {}
            ])
              .then(function (collection) {
                assert.isTrue(collection instanceof Collection);
                done();
              })
              .catch(done)
              .error(done);
          }
        }
      ]);
    });

    it('should throw an error for illegal arguments', function () {

      mout.array.forEach(support.TYPES_EXCEPT_FUNCTION, function (type) {
        assert.throws(function () {
          findAll.apply(Collection, [
            {},
            {},
              type || true
          ]);
        }, errors.IllegalArgumentError, errorPrefix + 'cb: Must be a function!');
      });

      mout.array.forEach(support.TYPES_EXCEPT_OBJECT, function (type) {
        assert.isRejected(findAll.apply(Collection, [type]), errors.IllegalArgumentError, errorPrefix + 'predicate: Must be an object!');
        assert.isRejected(findAll.apply(Collection, [
          {},
          (typeof type === 'function' ? true : type || true)
        ]), errors.IllegalArgumentError, errorPrefix + 'options: Must be an object!');
      });

      mout.array.forEach(support.TYPES_EXCEPT_STRING_OR_OBJECT, function (type) {
        assert.isRejected(findAll.apply(Collection, [
          { where: type || true }
        ]), errors.IllegalArgumentError, errorPrefix + 'predicate.where: Must be a string or an object!');
      });

      mout.array.forEach(support.TYPES_EXCEPT_NUMBER, function (type) {
        assert.isRejected(findAll.apply(Collection, [
          { limit: type || true }
        ]), errors.IllegalArgumentError, errorPrefix + 'predicate.limit: Must be a number!');
        assert.isRejected(findAll.apply(Collection, [
          { skip: type || true }
        ]), errors.IllegalArgumentError, errorPrefix + 'predicate.skip: Must be a number!');
      });

      mout.array.forEach(support.TYPES_EXCEPT_STRING_OR_ARRAY, function (type) {
        assert.isRejected(findAll.apply(Collection, [
          { pluck: type || true },
          { raw: true }
        ]), errors.IllegalArgumentError, errorPrefix + 'predicate.pluck: Must be a string or an array!');
      });
    });
  };
};

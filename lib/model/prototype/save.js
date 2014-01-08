var utils = require('../../support/utils'),
	errors = require('../../support/errors'),
	async = require('async'),
	r = require('rethinkdb');

/**
 * @doc method
 * @id Model.instance_methods:save
 * @name save(cb)
 * @description
 * Save this instance to the database.
 *
 * If this instance is new (has not yet been saved to the database), then a new row will be inserted into the database
 * with the current attributes of this instance. If this instance's Model was configured with "timestamps: true"
 * (which is default), then the new row will also be set with a "created" and an "updated" property, set to the UTC
 * datetime (of the database) at which the operation occurs.
 *
 * If the instance isn't new (update operation), then the row specified by the primary key of the instance will be
 * updated with the current attributes of the instance. If the Model for the instance was configured with
 * "timestamps: true" (which is default), then the "updated" property of the row specified by the primary key of the
 * instance will be updated with the UTC datetime (of the database) at which the operation occurs.
 *
 * Example:
 *
 * ```js
 * TODO: Model#save(cb) example
 * ```
 *
 * - `{IllegalArgumentError}` - Argument `cb` must be a function.
 * - `{IllegalArgumentError}` - If provided, argument `options` must be an object.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {object=} options Optional configuration options. Properties:
 *
 * - `{object=}` - `context` - Optional target context for the callback function.
 *
 * @param {function} cb Callback function. Signature: `cb(err, instance, meta)`. Arguments:
 *
 * - `{ValidationError|UnhandledError}` - `err` - `null` if no error occurs.
 * - `{object}` - `instance` - If no error occurs, a reference to the instance on which `save(cb)` was called.
 * - `{object}` - `meta` - If no error occurs, meta information about any database query that was performed.
 */
module.exports = function save(options, cb) {
	var _this = this;

	if (utils.isFunction(options)) {
		cb = options;
		options = {};
	}
	if (!utils.isFunction(cb)) {
		throw new errors.IllegalArgumentError('Model#save([options], cb): cb: Must be a function!', { actual: typeof cb, expected: 'function' });
	} else if (!utils.isObject(options)) {
		return cb(new errors.IllegalArgumentError('Model#save([options], cb): options: Must be an object!', { actual: typeof options, expected: 'object' }));
	} else if (options.context && !utils.isObject(options.context)) {
		return cb(new errors.IllegalArgumentError('Model#save([options], cb): options.context: Must be an object!', { actual: typeof options, expected: 'object' }));
	}

	try {
		var Model = _this.constructor,
			query = r.table(Model.tableName);

		if (Model.timestamps) {
			if (_this.isNew()) {
				_this.attributes.created = r.now();
				_this.attributes.deleted = null;
			}
			_this.attributes.updated = r.now();
		}

		if (_this.isNew()) {
			query = query.insert(_this.attributes, { return_vals: true });
		} else {
			query = query.get(_this.get(Model.idAttribute)).update(_this.attributes, { return_vals: true });
		}

		async.waterfall([
			function (next) {
				Model.connection.run(query, options, next);
			},
			function (cursor, next) {
				if (cursor.errors !== 0) {
					next(cursor.first_error || 'insert failed');
				} else {
					utils.deepMixIn(_this.attributes, cursor.new_val);
					next(null, _this, cursor);
				}
			}
		], function (err, instance, meta) {
			if (err) {
				if (options.context) {
					return cb.apply(options.context, [new errors.UnhandledError(err)]);
				} else {
					return cb.apply(_this, [new errors.UnhandledError(err)]);
				}
			} else {
				if (options.context) {
					return cb.apply(options.context, [null, instance, meta]);
				} else {
					return cb.apply(_this, [null, instance, meta]);
				}
			}
		});
	} catch (err) {
		if (options.context) {
			return cb.apply(options.context, [new errors.UnhandledError(err)]);
		} else {
			return cb.apply(_this, [new errors.UnhandledError(err)]);
		}
	}
};

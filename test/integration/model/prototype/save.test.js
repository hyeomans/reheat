module.exports = function (container, assert, mout) {
	return function () {
		var User, Post, Profile, Comment;

		beforeEach(function () {
			User = container.get('User');
			Post = container.get('Post');
			Profile = container.get('Profile');
			Comment = container.get('Comment');
		});

		it('should correctly save a new instance', function (done) {
			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.save()
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						id: post.get(Post.idAttribute),
						author: 'John Anderson',
						address: {
							state: 'NY'
						}
					});
					assert.isFalse(post.isNew());
					assert.equal(post.meta.inserted, 1);

					done();
				})
				.catch(done)
				.error(done);
		});

		it('should correctly save a new instance with timestamps', function (done) {
			Post.timestamps = true;

			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.save()
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						id: post.get(Post.idAttribute),
						author: 'John Anderson',
						address: {
							state: 'NY'
						},
						created: post.get('created'),
						updated: post.get('updated'),
						deleted: null
					});
					assert.isTrue(mout.lang.isDate(post.get('created')));
					assert.isTrue(mout.lang.isDate(post.get('created')));
					assert.isFalse(post.isNew());
					assert.equal(post.meta.inserted, 1);
					Post.timestamps = false;
					done();
				})
				.catch(done)
				.error(done);
		});

		it('should update already saved instance', function (done) {
			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.save()
				.then(function (post) {
					post.setSync('address.state', 'CO');
					assert.isFalse(post.isNew());
					assert.equal(post.meta.inserted, 1);

					return post.save();
				})
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						id: post.get(Post.idAttribute),
						author: 'John Anderson',
						address: {
							state: 'CO'
						}
					});
					assert.isFalse(post.isNew());
					assert.equal(post.meta.replaced, 1);

					done();
				})
				.catch(done)
				.error(done);
		});

		it('should update already saved instance with timestamps', function (done) {
			Post.timestamps = true;

			var post = new Post({
				author: 'John Anderson',
				address: {
					state: 'NY'
				}
			});

			assert.isTrue(post.isNew());

			post.save()
				.then(function (post) {
					post.setSync('address.state', 'CO');
					assert.isFalse(post.isNew());
					assert.equal(post.meta.inserted, 1);

					return post.save();
				})
				.then(function (post) {
					assert.deepEqual(post.toJSON(), {
						id: post.get(Post.idAttribute),
						author: 'John Anderson',
						address: {
							state: 'CO'
						},
						created: post.get('created'),
						updated: post.get('updated'),
						deleted: null
					});
					assert.notEqual(post.get('created'), post.get('updated'));
					assert.isFalse(post.isNew());
					assert.equal(post.meta.replaced, 1);

					done();
				})
				.catch(done)
				.error(done);
		});
	};
};

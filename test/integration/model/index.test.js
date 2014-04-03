module.exports = function (container) {
	return function () {

		describe('/prototype', function () {
			container.register('integration_model_prototype_save_test', require('./prototype/save.test'));

			describe('save', container.get('integration_model_prototype_save_test'));
			describe('destroy', function () {
				container.register('integration_model_prototype_destroy_test', require('./prototype/destroy.test'));
				container.register('integration_model_prototype_destroy_relations_test', require('./prototype/destroy.relations.test'));
				describe('destroy.test', container.get('integration_model_prototype_destroy_test'));
				describe('destroy.relations.test', container.get('integration_model_prototype_destroy_relations_test'));
			});

			describe('unset', function () {
				it('no tests yet!');
			});
			describe('set', function () {
				it('no tests yet!');
			});
			describe('setSync', function () {
				it('no tests yet!');
			});
			describe('clear', function () {
				it('no tests yet!');
			});
			describe('toJSON', function () {
				it('no tests yet!');
			});
			describe('functions', function () {
				it('no tests yet!');
			});
			describe('clone', function () {
				it('no tests yet!');
			});
			describe('isNew', function () {
				it('no tests yet!');
			});
		});
		describe('/static', function () {
			container.register('integration_model_static_findOne_test', require('./static/findOne.test'));
			container.register('integration_model_static_findOne_relations_test', require('./static/findOne.relations.test'));
			container.register('integration_model_static_destroyOne_test', require('./static/destroyOne.test'));

			describe('findOne', function () {
				describe('findOne.test', container.get('integration_model_static_findOne_test'));
				describe('findOne.relations.test', container.get('integration_model_static_findOne_relations_test'));
			});
			describe('destroyOne', container.get('integration_model_static_destroyOne_test'));
		});
	};
};

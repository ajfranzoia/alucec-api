var express = require('express'),
    mongoose = require('mongoose'),
    Member = mongoose.model('Member'),
    NotFoundError = require('../../app/errors/NotFoundError');

module.exports = function(app, ctrl) {
  var router = express.Router();

  router.param('id', function(req, res, next, id) {
    Member.findById(id).populate('agent').exec(function (err, member) {
      if (err) return next(err);
      if (!member) return next(new NotFoundError('Member not found'));
      req.member = member;
      next();
    });
  });

  router.get('/', ctrl.list);
  router.get('/nextAlucecId', ctrl.nextAlucecId);
  router.get('/:id', ctrl.get);
  router.post('/', ctrl.create);
  router.put('/:id', ctrl.update);
  router.put('/:id/set-leaving', ctrl.setLeaving);
  router.put('/:id/remove-leaving', ctrl.removeLeaving);
  router.delete('/:id', ctrl.remove);

  app.use('/members', router);
};

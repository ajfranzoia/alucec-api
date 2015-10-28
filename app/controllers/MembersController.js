var MembersService = require('../services/MembersService');

/**
 * Members actions.
 *
 * @type {Object}
 */
var MembersController = {

  /**
   * List members.
   * Returns MembersService.list() results.
   */
  list: function (req, res, next) {
    MembersService.list(req.query, function (err, members) {
      if (err) return next(err);
      res.send(members);
    });
  },

  /**
   * Get member by 'id' param.
   * Sets payments to member calling MembersService.populatePayments()
   */
  get: function (req, res, next) {
    MembersService.populatePayments(req.member, function(err, member) {
      if (err) return next(err);
      res.send(member);
    });
  },

  /**
   * Get next ALUCEC member number.
   * Calls MembersService.getNextAlucecId()
   */
  nextAlucecId: function (req, res, next) {
    MembersService.getNextAlucecId(function (err, nextAlucecId) {
      if (err) return next(err);
      res.send({alucecId: nextAlucecId});
    });
  },

  /**
   * Create new member.
   * Calls MembersService.create()
   */
  create: function (req, res, next) {
    MembersService.create(req.body, function (err, member) {
      if (err) return next(err);
      res.send(member);
    });
  },

  /**
   * Update existing member.
   * Calls MembersService.update()
   */
  update: function (req, res, next) {
    MembersService.update(req.member, req.body, function (err) {
      if (err) return next(err);
      res.send(req.member);
    });
  },

  /**
   * Removes existing member.
   * Calls MembersService.remove()
   */
  remove: function (req, res, next) {
    MembersService.remove(req.member, function (err, member) {
      if (err) return next(err);
      res.send(member);
    });
  },

  /**
   * Set member as leaving.
   * Calls MembersService.setLeaving()
   */
  setLeaving: function (req, res, next) {
    MembersService.setLeaving(req.member, req.body, function (err, member) {
      if (err) return next(err);
      res.send(member);
    });
  },

  /**
   * Set member as non-leaving and active.
   * Calls MembersService.removeLeaving()
   */
  removeLeaving: function (req, res, next) {
    MembersService.removeLeaving(req.member, function (err, member) {
      if (err) return next(err);
      res.send(member);
    });
  },

};

module.exports = MembersController;

const handle1 = require('../models/slot');
const Slot=handle1.slot;

const slotController = {
  all (req, res) {
    // Returns all Slots
      Slot.find({})
          .exec((err, slots) => res.json(slots))
  }
};
module.exports = slotController;
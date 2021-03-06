var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var FormulaireSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  photos: [
    String
  ],
  modifiedTimestamp: {
    type: Number
  },
  deleted: {
    type: Boolean
  },
  chiffrages: [{
    label: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }]
});

module.exports = mongoose.model('Formulaire', FormulaireSchema);
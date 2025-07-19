const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  roomImg: { type: String },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, { timestamps: true });

roomSchema.pre('validate', function (next) {
  if (this.users.length < 2) {
    return next(new Error('A room must have at least 2 users.'));
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);

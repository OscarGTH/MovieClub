var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
  email: String,
  password: String,
  role: Number,
  paid: Boolean,
  userId: Number
})

UserSchema.virtual('links').get(function() {
  return [{
    'self': "http://localhost:3000/" + 'api/user/' + this.userId
  }];
});
UserSchema.set('toJSON', {
  virtuals: true
})

module.exports = mongoose.model('users',UserSchema)

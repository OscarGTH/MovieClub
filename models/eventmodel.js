var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EventSchema = new Schema({
  name: String,
  location: String,
  description: String,
  date: String,
  price: Number,
  eventId: Number
})

EventSchema.virtual('links').get(function() {
  return [{
    'self': "http://localhost:3000/" + 'api/event/' + this.userId
  }];
});
EventSchema.set('toJSON', {
  virtuals: true
})

module.exports = mongoose.model('events',EventSchema)

const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    orgNo: Number,
    Tasks: {
      type: Map,
      of: Array
  }
  });
  const template = mongoose.model('template', TemplateSchema);
  module.exports =template
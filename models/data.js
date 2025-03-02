const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    date: String,
    total_points: [Number],
    habit_data: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Data', dataSchema,'habbit_database');
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    language: {
        type: String,
        default: 'EN'
    }
}, {
    timestamps: true
});

// Create compound index for page, section, key and language
contentSchema.index({ page: 1, section: 1, key: 1, language: 1 }, { unique: true });

module.exports = mongoose.model('Content', contentSchema);

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone:{type:Number, required:true},
    category:{ type: String, required: true ,enum:['General Inquiry','Technical Support','Billing','Partnership','Press & Media','Other']},
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }

})

module.exports = mongoose.model('Contact', contactSchema);
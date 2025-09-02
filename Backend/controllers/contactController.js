const Contact = require('../models/Contact');

exports.submitContactForm = async (req,res)=>{
    try {
        const {fullName,email,phone,category,subject,message} = req.body;

        // Basic validation
        if(!fullName || !email || !phone || !category || !subject || !message){
            return res.status(400).json({message:'All fields are required'});
        }
        const newContact = new Contact({fullName,email,phone,category,subject,message});
        await newContact.save();
        res.status(201).json({message:'Contact form submitted successfully'});
    } catch (error) {
        res.status(500).json({message:'Server Error', error: error.message});
    }
}
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createAdmin = async (req,res)=>{
    try {
        const {email, password, setupKey,role} = req.body;
        if(setupKey !== "this-is-secret"){
            return res.status(403).json({message: 'Forbidden: Invalid setup key'});// Forbidden
        }
        const existingAdmin = await User.findOne({email, role: 'admin'});
        if(existingAdmin){
            return res.status(400).json({message: 'Admin already exists'});// Bad Request
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
            email,
            password: hashedPassword,   
            role: role
        });
        await newAdmin.save();
        res.status(201).json({message: 'Admin created successfully', success: true});// Created
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message});// Internal Server Error
    }
}


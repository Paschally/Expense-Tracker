const mongoose = require('mongoose');

userSchema = mongoose.Schema({
    username : {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true, trim: true, lowercase: true},
    password: {type: String, required: true, unique: true, trim: true,
         minlength: [8, 'Password must be at least 8 characters']
    },
    isActive: {type: Boolean, required: true},
    role:   {type: String, required: true,
        enum: ['user', 'admin'], default: 'user'},   // only allow users or admin role
}, {timestamps : true})

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    }
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({
        _id: user._id
    }, process.env.JWT_KEY)
    // user.tokens = user.tokens.concat({
    //     token
    // })
    //await user.save()
    return token
}

userSchema.statics.findByCredentials = async (name, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({
        name
    })
    if (!user) {
        throw new Error('Invalid login credentials')
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials')
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User
const { promisify } = require('util')
const { randomBytes } = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { forwardTo } = require('prisma-binding')
const { transport, makeANiceEmail } = require('../mail')
const randomBytesAsync = promisify(randomBytes)
const { FRONTEND_URL, APP_SECRET } = process.env

const mutations = {
  async createItem (parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args.data
      }
    }, info)

    return item
  },

  updateItem: forwardTo('db'),

  async deleteItem (parent, args, ctx, info) {
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, '{ id title }')
    console.log(item)
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup (parent, args, ctx, info) {
    const email = args.email.toLowerCase()
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        email,
        password,
        permissions: { set: ['USER'] }
      }
    }, info)

    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return user
  },

  async signin (parent, args, ctx, info) {
    const { email, password } = args
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password!')
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return user
  },

  signout (parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Goodbye!' }
  },

  async requestReset (parent, args, ctx, info) {
    const user = await ctx.db.query.user({
      where: {
        email: args.email
      }
    })

    if (!user) {
      throw new Error(`No such user found for email ${args.email}`)
    }

    const resetToken = (await randomBytesAsync(20)).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // 1h from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })

    const resetUrl = `${FRONTEND_URL}/reset?resetToken=${resetToken}`

    const mailRes = await transport.sendMail({
      from: 'wes@wesbos.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeANiceEmail(`Your password reset token is here! \n\n
        <a href="${resetUrl}">${resetUrl}</a>`)
    })
  },

  async resetPassword (parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error('Yo Passwords dont match!')
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })

    if (!user) {
      throw new Error('This token is either invalid or expired!')
    }

    const password = await bcrypt.hash(args.password, 10)
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    const token = jwt.sign({ userId: updatedUser.id }, APP_SECRET)
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    })

    return updatedUser
  }
}

module.exports = mutations

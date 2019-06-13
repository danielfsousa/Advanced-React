const { promisify } = require('util')
const { randomBytes } = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { forwardTo } = require('prisma-binding')
const { transport, makeANiceEmail } = require('../mail')
const { hasPermission } = require('../utils')
const randomBytesAsync = promisify(randomBytes)
const { FRONTEND_URL, APP_SECRET } = process.env

const mutations = {
  async createItem (parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged to do that')
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args.data,
          user: {
            connect: {
              id: ctx.request.userId
            }
          }
        }
      },
      info
    )

    return item
  },

  updateItem: forwardTo('db'),

  async deleteItem (parent, args, ctx, info) {
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, '{ id title user { id } }')
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(p =>
      ['ADMIN', 'ITEM_DELETE'].includes(p)
    )

    if (!ownsItem && !hasPermissions) {
      throw new Error('You dont have permission to do that')
    }
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup (parent, args, ctx, info) {
    const email = args.email.toLowerCase()
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          email,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    )

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
    await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })

    const resetUrl = `${FRONTEND_URL}/reset?resetToken=${resetToken}`

    await transport.sendMail({
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
  },

  async updatePermissions (parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in')
    }

    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    )
    hasPermission(currentUser, ['ADMIN', 'PERMISSION_UPDATE'])

    return ctx.db.mutation.updateUser(
      {
        data: { permissions: { set: args.permissions } },
        where: { id: args.userId }
      },
      info
    )
  },

  async addToCart (parent, args, ctx, info) {
    const { userId } = ctx.request
    if (!userId) {
      throw new Error('You must be signed in')
    }

    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    })

    if (existingCartItem) {
      console.log('Thos item is already in their cart')
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 }
      }, info)
    }

    return ctx.db.mutation.createCartItem({
      data: {
        user: { connect: { id: userId } },
        item: { connect: { id: args.id } }
      }
    }, info)
  }
}

module.exports = mutations

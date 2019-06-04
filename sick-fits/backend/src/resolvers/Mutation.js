const { forwardTo } = require('prisma-binding')

const mutations = {
  async createItem (parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args.data
      }
    }, info)

    return item
  },

  updateItem: forwardTo('db')

  // async updateItem (parent, args, ctx, info) {
  //   const update = { ...args }
  //   delete
  // }
}

module.exports = mutations

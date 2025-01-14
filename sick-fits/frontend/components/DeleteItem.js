import { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { ALL_ITEMS_QUERY } from './Items'

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`

class DeleteItem extends Component {
  handleItemDelete = deleteItem => () => {
    if (global.confirm('Are you sure you want to delete this item?')) {
      deleteItem().catch(e => global.alert(e.message))
    }
  }

  updateCache = (cache, payload) => {
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY })
    data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id)
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data })
  }

  render () {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        update={this.updateCache}
        variables={{
          id: this.props.id
        }}
      >
        {(deleteItem, { error }) => (
          <button onClick={this.handleItemDelete(deleteItem)}>
            {this.props.children}
          </button>
        )}
      </Mutation>
    )
  }
}

export default DeleteItem

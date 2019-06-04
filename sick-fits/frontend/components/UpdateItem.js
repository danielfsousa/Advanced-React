import React, { Component } from 'react'
import Router from 'next/router'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'

const GET_ITEM_QUERY = gql`
  query GET_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION($data: ItemUpdateInput!, $id: ID!) {
    updateItem(data: $data, where: { id: $id }) {
      id
    }
  }
`
export { UPDATE_ITEM_MUTATION }
export default class UpdateItem extends Component {
  state = {}

  handleFormSubmit = updateItemMutation => async evt => {
    evt.preventDefault()
    const res = await updateItemMutation()
    console.log(res)
    Router.push({
      pathname: '/item',
      query: { id: res.data.updateItem.id }
    })
  }

  handleChange = evt => {
    const { name, type, value } = evt.target
    const val = type === 'number' ? Number(value) : value
    this.setState({ [name]: val })
  }

  render () {
    return (
      <Query query={GET_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>No Item Found for ID: {this.props.id}</p>
          return (
            <Mutation
              mutation={UPDATE_ITEM_MUTATION}
              variables={{ id: this.props.id, data: this.state }}
            >
              {(updateItem, { loading, error }) => (
                <Form onSubmit={this.handleFormSubmit(updateItem)}>
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor='title'>
                      Title
                      <input
                        type='text'
                        id='title'
                        name='title'
                        placeholder='Title'
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor='price'>
                      Price
                      <input
                        type='number'
                        id='price'
                        name='price'
                        placeholder='Price'
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor='description'>
                      Description
                      <textarea
                        type='text'
                        id='description'
                        name='description'
                        placeholder='Enter a description'
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>

                    <button type='submit'>
                      Sav{loading ? 'ing' : 'e'} Changes
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

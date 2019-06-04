import React, { Component } from 'react'
import Router from 'next/router'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION($input: ItemCreateInput!) {
    createItem(input: $input) {
      id
    }
  }
`
export { CREATE_ITEM_MUTATION }
export default class CreateItem extends Component {
  state = {
    title: 'Cool shoes',
    description: 'I love those shoes',
    image: 'dog.jpg',
    largeImage: 'large-dog.jpg',
    price: 1000
  }

  handleFormSubmit = createItem => async (e) => {
    e.preventDefault()
    const res = await createItem()
    console.log(res)
    Router.push({
      pathname: '/item',
      query: { id: res.data.createItem.id }
    })
  }

  handleChange = e => {
    const { name, type, value } = e.target
    const val = type === 'number' ? Number(value) : value
    this.setState({ [name]: val })
  }

  render () {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={{ input: this.state }}>
        {(createItem, { loading, error }) => (
          <Form onSubmit={this.handleFormSubmit(createItem)}>
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
                  value={this.state.title}
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
                  value={this.state.price}
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
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </label>

              <button type='submit'>Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

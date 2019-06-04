/* global fetch, FormData */

import React, { Component } from 'react'
import Router from 'next/router'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION($data: ItemCreateInput!) {
    createItem(data: $data) {
      id
    }
  }
`
export { CREATE_ITEM_MUTATION }
export default class CreateItem extends Component {
  state = {
    title: 'Cool shoes',
    description: 'I love those shoes',
    image: '',
    largeImage: '',
    price: 1000
  }

  handleFormSubmit = createItemMutation => async e => {
    e.preventDefault()
    const res = await createItemMutation()
    console.log(res)
    Router.push({
      pathname: '/item',
      query: { id: res.data.createItem.id }
    })
  }

  handleChange = evt => {
    const { name, type, value } = evt.target
    const val = type === 'number' ? Number(value) : value
    this.setState({ [name]: val })
  }

  uploadFile = async evt => {
    const files = evt.target.files
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'weirdshop')

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/danielfsosua/image/upload',
      {
        method: 'POST',
        body: data
      }
    )

    const file = await res.json()

    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }

  render () {
    return (
      <Mutation
        mutation={CREATE_ITEM_MUTATION}
        variables={{ data: this.state }}
      >
        {(createItem, { loading, error }) => (
          <Form onSubmit={this.handleFormSubmit(createItem)}>
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor='file'>
                Image
                <input
                  type='file'
                  id='file'
                  name='file'
                  placeholder='Upload an image'
                  required
                  onChange={this.uploadFile}
                />
                {this.state.image && (
                  <img
                    src={this.state.image}
                    width='200'
                    alt='Upload Preview'
                  />
                )}
              </label>
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

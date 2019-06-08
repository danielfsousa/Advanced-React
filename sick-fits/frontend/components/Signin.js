import { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`

export default class Signin extends Component {
  state = {
    password: '',
    email: ''
  }

  handleInputChange = evt =>
    this.setState({ [evt.target.name]: evt.target.value })

  handleFormSubmit = signin => async evt => {
    evt.preventDefault()
    const res = await signin()
    console.log(res)
  }

  render () {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        variables={this.state}
      >
        {(signin, { loading, error }) => (
          <Form method='post' onSubmit={this.handleFormSubmit(signin)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign into your account</h2>
              <Error error={error} />

              <label htmlFor='email'>
                Email
                <input
                  type='text'
                  name='email'
                  placeholder='email'
                  value={this.state.email}
                  onChange={this.handleInputChange}
                />
              </label>

              <label htmlFor='password'>
                Password
                <input
                  type='password'
                  name='password'
                  placeholder='password'
                  value={this.state.password}
                  onChange={this.handleInputChange}
                />
              </label>
              <button type='submit'>Sign in</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

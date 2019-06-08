import { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`

export default class Signup extends Component {
  state = {
    name: '',
    password: '',
    email: ''
  }

  handleInputChange = evt =>
    this.setState({ [evt.target.name]: evt.target.value })

  handleFormSubmit = signup => async evt => {
    evt.preventDefault()
    const res = await signup()
    console.log(res)
  }

  render () {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        variables={this.state}
      >
        {(signup, { loading, error }) => (
          <Form method='post' onSubmit={this.handleFormSubmit(signup)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign up for an account</h2>
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

              <label htmlFor='name'>
                Name
                <input
                  type='text'
                  name='name'
                  placeholder='name'
                  value={this.state.name}
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
              <button type='submit'>Sign up</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

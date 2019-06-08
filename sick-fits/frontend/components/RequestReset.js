import { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

export default class RequestReset extends Component {
  state = {
    password: '',
    email: ''
  }

  handleInputChange = evt =>
    this.setState({ [evt.target.name]: evt.target.value })

  handleFormSubmit = reset => async evt => {
    evt.preventDefault()
    const res = await reset()
    console.log(res)
  }

  render () {
    return (
      <Mutation
        mutation={REQUEST_RESET_MUTATION}
        variables={this.state}
      >
        {(reset, { called, loading, error }) => (
          <Form method='post' onSubmit={this.handleFormSubmit(reset)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request a password reset</h2>
              <Error error={error} />
              {!error && !loading && called && <p>Check your email for a reset link!</p>}

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
              <button type='submit'>Reset password</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}

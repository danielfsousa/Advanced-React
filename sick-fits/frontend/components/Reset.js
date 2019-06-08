import { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const RESET_MUTATION = gql`
  mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
    resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
      id
      email
      name
    }
  }
`

export default class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  }

  state = {
    password: '',
    confirmPassword: ''
  }

  handleInputChange = evt =>
    this.setState({ [evt.target.name]: evt.target.value })

  handleFormSubmit = reset => async evt => {
    evt.preventDefault()
    await reset()
  }

  render () {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        variables={{
          resetToken: this.props.resetToken,
          password: this.state.password,
          confirmPassword: this.state.confirmPassword
        }}
      >
        {(reset, { called, loading, error }) => (
          <Form method='post' onSubmit={this.handleFormSubmit(reset)}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset your password</h2>
              <Error error={error} />

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

              <label htmlFor='confirmPassword'>
                Confirm Password
                <input
                  type='password'
                  name='confirmPassword'
                  placeholder='confirmPassword'
                  value={this.state.confirmPassword}
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

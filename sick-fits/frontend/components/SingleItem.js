import { Component } from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Head from 'next/head'
import styled from 'styled-components'
import Error from './ErrorMessage'

const SingleItemStyled = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      largeImage
    }
  }
`

class SingleItem extends Component {
  render () {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ error, loading, data: { item } }) => {
          if (error) return <Error error={error} />
          if (loading) return <p>Loading...</p>
          if (!item) return <p>No item found for {this.props.id}</p>
          return (
            <SingleItemStyled>
              <Head>
                <title>Sick Fits | {item.title}</title>
              </Head>
              <img src={item.largeImage} alt={item.title} />
              <div className='details'>
                <h2>Viewing {item.title}</h2>
              </div>
            </SingleItemStyled>
          )
        }}
      </Query>
    )
  }
}

export default SingleItem

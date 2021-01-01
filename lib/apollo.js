import {useMemo} from "react";
import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

let apolloClient;

const createApolloClient = () =>{
    return new ApolloClient({
        ssrMode: typeof window === true,
        link: new HttpLink({
            uri: `${API_URL}/graphql`,
        }),
        cache: new InMemoryCache(),
    })
}

export const initializeApollo = (initialState = null) =>{
    const _apolloClient = apolloClient ?? createApolloClient();
     if (initialState) {
      // Get existing cache, loaded during client side data fetching
      const existingCache = _apolloClient.extract();

      // Restore the cache using the data passed from
      // getStaticProps/getServerSideProps combined with the existing cached data
      _apolloClient.cache.restore({ ...existingCache, ...initialState });
    }

    // For SSG and SSR always create a new Apollo Client
    if (typeof window === true) return _apolloClient;

    // Create the Apollo Client once in the client
    if (!apolloClient) apolloClient = _apolloClient;
    return _apolloClient;
  }

export const useApollo = (initialState) => {
      const store = useMemo(()=> initializeApollo(initialState), [initialState]);
      return store;
  }


//  import { HttpLink } from "apollo-link-http";
//  import  {withData} from "next-apollo";

//  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

//  const config = {
//    link: new HttpLink({
//      uri: `${API_URL}/graphql`, // Server URL (must be absolute)
//    })
//  };
//  export default withData(config);
import React, { useState, useEffect } from "react";
import App from "next/app";
import Head from "next/head";
import Layout from "../components/Layout";
//import withData from "../lib/apollo";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apollo";
// Auth
import Cookie from "js-cookie";
import fetch from "isomorphic-fetch";
import AppContext from "../context/AppContext";

const MyApp = ({ Component, pageProps }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState({
    items: [],
    total: 0,
  });
  const apolloClient = useApollo(pageProps.initialApolloState);

  useEffect(() => {
    const token = Cookie.get("token");
    const cart = Cookie.get("cart");
    //if items in cart, set items and total from cookie.
    console.log(cart);
    if (typeof cart === "string" && cart !== "undefined") {
      console.log("foyd");
      JSON.parse(cart).forEach((item) => {
        setCartHandler({
          items: JSON.parse(cart),
          total: item.price * item.quantity,
        });
      });
    }
    if (token) {
      // authenticate the token on the server and place set user object
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        // if res comes back not valid, token is not valid
        // delete the token and log the user out on client
        if (!res.ok) {
          Cookie.remove("token");
          setUser(null);
          return null;
        }
        const user = await res.json();
        setUser(user);
      });
    }
  }, []);

  const setUserHandler = (user) => {
    setUser(user);
  };
  const setCartHandler = (cart) => {
    setCart(cart);
  };
  const addItemHandler = (item) => {
    let { items } = cart;
    let updatedItem;
    //check for item already in cart
    //if not in cart, add item if item is found increase quanity ++
    const newItem = items.find((i) => i.id === item.id);
    if (!newItem) {
      updatedItem = { ...item, quantity: 1 };
      setCartHandler({
        items: [...items, updatedItem],
        total: cart.total + item.price,
      });
      () => Cookie.set("cart", cart.items);
      console.log(cart);
    } else {
      // const addedItem = items.find((i) => i.id === item.id);
      // updatedItem = { ...addedItem, quantity: addedItem.quantity + 1 };
      // setCartHandler({
      //   items: [...items, updatedItem],
      //   total: cart.total + item.price,
      // });
      // () => Cookie.set("cart", cart.items);

      const itemIndex = items.findIndex((el) => el.id === item.id);
      let updatedCart = [...items];
      updatedCart[itemIndex] = {
        ...updatedCart[itemIndex],
        quantity: updatedCart[itemIndex].quantity + 1,
      };
      setCartHandler({
        items: updatedCart,
        total: cart.total + item.price,
      });
      () => Cookie.set("cart", cart.items);
    }
  };
  const removeItemHandler = (item) => {
    let { items } = cart;
    //check for item already in cart
    //if not in cart, add item if item is found increase quanity ++
    const newItem = items.find((i) => i.id === item.id);
    if (newItem.quantity > 1) {
      setCart(
        {
          items: cart.items.map((item) =>
            item.id === newItem.id
              ? Object.assign({}, item, { quantity: item.quantity - 1 })
              : item
          ),
          total: cart.total - item.price,
        },

        () => Cookie.set("cart", cart.items)
      );
    } else {
      const items = [...cart.items];
      const index = items.findIndex((i) => i.id === newItem.id);
      items.splice(index, 1);
      setCart({ items: items, total: cart.total - item.price }, () =>
        Cookie.set("cart", cart.items)
      );
    }
  };
  return (
    <ApolloProvider client={apolloClient}>
      <AppContext.Provider
        value={{
          user: user,
          isAuthenticated: !!user,
          setUser: setUserHandler,
          cart: cart,
          addItem: addItemHandler,
          removeItem: removeItemHandler,
        }}
      >
        <Head>
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
            integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
            crossOrigin="anonymous"
          />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppContext.Provider>
    </ApolloProvider>
  );
};
export default MyApp;

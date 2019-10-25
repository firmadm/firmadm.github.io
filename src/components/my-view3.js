import { LitElement, html$2 as html, css, PageViewElement, connect, store, addToCartIcon, removeFromCartIcon, ButtonSharedStyles, SharedStyles } from './my-app.js';

function defaultEqualityCheck(a, b) {
  return a === b;
}

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  } // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.


  var length = prev.length;

  for (var i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

function defaultMemoize(func) {
  var equalityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultEqualityCheck;
  var lastArgs = null;
  var lastResult = null; // we reference arguments instead of spreading them for performance reasons

  return function () {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);
    }

    lastArgs = arguments;
    return lastResult;
  };
}

function getDependencies(funcs) {
  var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  if (!dependencies.every(function (dep) {
    return typeof dep === 'function';
  })) {
    var dependencyTypes = dependencies.map(function (dep) {
      return typeof dep;
    }).join(', ');
    throw new Error('Selector creators expect all input-selectors to be functions, ' + ('instead received the following types: [' + dependencyTypes + ']'));
  }

  return dependencies;
}

function createSelectorCreator(memoize) {
  for (var _len = arguments.length, memoizeOptions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    memoizeOptions[_key - 1] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, funcs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      funcs[_key2] = arguments[_key2];
    }

    var recomputations = 0;
    var resultFunc = funcs.pop();
    var dependencies = getDependencies(funcs);
    var memoizedResultFunc = memoize.apply(undefined, [function () {
      recomputations++; // apply arguments instead of spreading for performance.

      return resultFunc.apply(null, arguments);
    }].concat(memoizeOptions)); // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.

    var selector = memoize(function () {
      var params = [];
      var length = dependencies.length;

      for (var i = 0; i < length; i++) {
        // apply arguments instead of spreading and mutate a local list of params for performance.
        params.push(dependencies[i].apply(null, arguments));
      } // apply arguments instead of spreading for performance.


      return memoizedResultFunc.apply(null, params);
    });
    selector.resultFunc = resultFunc;
    selector.dependencies = dependencies;

    selector.recomputations = function () {
      return recomputations;
    };

    selector.resetRecomputations = function () {
      return recomputations = 0;
    };

    return selector;
  };
}

var createSelector = createSelectorCreator(defaultMemoize);

function createStructuredSelector(selectors) {
  var selectorCreator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createSelector;

  if (typeof selectors !== 'object') {
    throw new Error('createStructuredSelector expects first argument to be an object ' + ('where each property is a selector, instead received a ' + typeof selectors));
  }

  var objectKeys = Object.keys(selectors);
  return selectorCreator(objectKeys.map(function (key) {
    return selectors[key];
  }), function () {
    for (var _len3 = arguments.length, values = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      values[_key3] = arguments[_key3];
    }

    return values.reduce(function (composition, value, index) {
      composition[objectKeys[index]] = value;
      return composition;
    }, {});
  });
}

var index = {
  defaultMemoize: defaultMemoize,
  createSelectorCreator: createSelectorCreator,
  createSelector: createSelector,
  createStructuredSelector: createStructuredSelector
};
/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const GET_PRODUCTS = 'GET_PRODUCTS';
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const CHECKOUT_SUCCESS = 'CHECKOUT_SUCCESS';
const CHECKOUT_FAILURE = 'CHECKOUT_FAILURE';
const PRODUCT_LIST = [{
  "id": 1,
  "title": "Cabot Creamery Extra Sharp Cheddar Cheese",
  "price": 10.99,
  "inventory": 2
}, {
  "id": 2,
  "title": "Cowgirl Creamery Mt. Tam Cheese",
  "price": 29.99,
  "inventory": 10
}, {
  "id": 3,
  "title": "Tillamook Medium Cheddar Cheese",
  "price": 8.99,
  "inventory": 5
}, {
  "id": 4,
  "title": "Point Reyes Bay Blue Cheese",
  "price": 24.99,
  "inventory": 7
}, {
  "id": 5,
  "title": "Shepherd's Halloumi Cheese",
  "price": 11.99,
  "inventory": 3
}];

const getAllProducts = () => dispatch => {
  // Here you would normally get the data from the server. We're simulating
  // that by dispatching an async action (that you would dispatch when you
  // successfully got the data back).
  // You could reformat the data in the right format as well.
  const products = PRODUCT_LIST.reduce((obj, product) => {
    obj[product.id] = product;
    return obj;
  }, {});
  dispatch({
    type: GET_PRODUCTS,
    products
  });
};

const checkout = () => dispatch => {
  // Here you could do things like credit card validation, etc.
  // If that fails, dispatch CHECKOUT_FAILURE. We're simulating that
  // by flipping a coin :)
  const flip = Math.floor(Math.random() * 2);

  if (flip === 0) {
    dispatch({
      type: CHECKOUT_FAILURE
    });
  } else {
    dispatch({
      type: CHECKOUT_SUCCESS
    });
  }
};

const addToCart = productId => (dispatch, getState) => {
  const state = getState(); // Just because the UI thinks you can add this to the cart
  // doesn't mean it's in the inventory (user could've fixed it).

  if (state.shop.products[productId].inventory > 0) {
    dispatch(addToCartUnsafe(productId));
  }
};

const removeFromCart = productId => {
  return {
    type: REMOVE_FROM_CART,
    productId
  };
};

const addToCartUnsafe = productId => {
  return {
    type: ADD_TO_CART,
    productId
  };
};

var shop = {
  GET_PRODUCTS: GET_PRODUCTS,
  ADD_TO_CART: ADD_TO_CART,
  REMOVE_FROM_CART: REMOVE_FROM_CART,
  CHECKOUT_SUCCESS: CHECKOUT_SUCCESS,
  CHECKOUT_FAILURE: CHECKOUT_FAILURE,
  getAllProducts: getAllProducts,
  checkout: checkout,
  addToCart: addToCart,
  removeFromCart: removeFromCart,
  addToCartUnsafe: addToCartUnsafe
};
const INITIAL_STATE = {
  products: {},
  cart: {},
  error: ''
};

const shop$1 = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_PRODUCTS:
      return { ...state,
        products: action.products
      };

    case ADD_TO_CART:
    case REMOVE_FROM_CART:
    case CHECKOUT_SUCCESS:
      return { ...state,
        products: products(state.products, action),
        cart: cart(state.cart, action),
        error: ''
      };

    case CHECKOUT_FAILURE:
      return { ...state,
        error: 'Checkout failed. Please try again'
      };

    default:
      return state;
  }
}; // Slice reducer: it only reduces the bit of the state it's concerned about.


const products = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART:
    case REMOVE_FROM_CART:
      const productId = action.productId;
      return { ...state,
        [productId]: product(state[productId], action)
      };

    default:
      return state;
  }
};

const product = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      return { ...state,
        inventory: state.inventory - 1
      };

    case REMOVE_FROM_CART:
      return { ...state,
        inventory: state.inventory + 1
      };

    default:
      return state;
  }
};

const cart = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const addId = action.productId;
      return { ...state,
        [addId]: (state[addId] || 0) + 1
      };

    case REMOVE_FROM_CART:
      const removeId = action.productId;
      const quantity = (state[removeId] || 0) - 1;

      if (quantity <= 0) {
        const newState = { ...state
        };
        delete newState[removeId];
        return newState;
      } else {
        return { ...state,
          [removeId]: quantity
        };
      }

    case CHECKOUT_SUCCESS:
      return {};

    default:
      return state;
  }
}; // for efficiency (small size and fast updates).
//
// The _selectors_ below transform store data into specific forms that
// are tailored for presentation. Putting this logic here keeps the
// layers of our app loosely coupled and easier to maintain, since
// views don't need to know about the store's internal data structures.
//
// We use a tiny library called `reselect` to create efficient
// selectors. More info: https://github.com/reduxjs/reselect.


const cartSelector = state => state.shop.cart;

const productsSelector = state => state.shop.products; // Return a flattened array representation of the items in the cart


const cartItemsSelector = createSelector(cartSelector, productsSelector, (cart, products) => {
  return Object.keys(cart).map(id => {
    const item = products[id];
    return {
      id: item.id,
      title: item.title,
      amount: cart[id],
      price: item.price
    };
  });
}); // Return the total cost of the items in the cart

const cartTotalSelector = createSelector(cartSelector, productsSelector, (cart, products) => {
  let total = 0;
  Object.keys(cart).forEach(id => {
    const item = products[id];
    total += item.price * cart[id];
  });
  return Math.round(total * 100) / 100;
}); // Return the number of items in the cart

const cartQuantitySelector = createSelector(cartSelector, cart => {
  let num = 0;
  Object.keys(cart).forEach(id => {
    num += cart[id];
  });
  return num;
});
var shop$2 = {
  'default': shop$1,
  cartItemsSelector: cartItemsSelector,
  cartTotalSelector: cartTotalSelector,
  cartQuantitySelector: cartQuantitySelector
};

class ShopItem extends LitElement {
  static get properties() {
    return {
      name: {
        type: String
      },
      amount: {
        type: String
      },
      price: {
        type: String
      }
    };
  }

  render() {
    return html`
      ${this.name}:
      <span ?hidden="${this.amount === 0}">${this.amount} * </span>
      $${this.price}
      </span>
    `;
  }

}

window.customElements.define('shop-item', ShopItem);

class ShopProducts extends connect(store)(LitElement) {
  static get properties() {
    return {
      _products: {
        type: Object
      }
    };
  }

  static get styles() {
    return [ButtonSharedStyles, css`
        :host {
          display: block;
        }
      `];
  }

  render() {
    return html`
      ${Object.keys(this._products).map(key => {
      const item = this._products[key];
      return html`
          <div>
            <shop-item name="${item.title}" amount="${item.inventory}" price="${item.price}"></shop-item>
            <button
                .disabled="${item.inventory === 0}"
                @click="${this._addButtonClicked}"
                data-index="${item.id}"
                title="${item.inventory === 0 ? 'Sold out' : 'Add to cart'}">
              ${item.inventory === 0 ? 'Sold out' : addToCartIcon}
            </button>
          </div>
        `;
    })}
    `;
  }

  firstUpdated() {
    store.dispatch(getAllProducts());
  }

  _addButtonClicked(e) {
    store.dispatch(addToCart(e.currentTarget.dataset['index']));
  } // This is called every time something is updated in the store.


  stateChanged(state) {
    this._products = state.shop.products;
  }

}

window.customElements.define('shop-products', ShopProducts);

class ShopCart extends connect(store)(LitElement) {
  static get properties() {
    return {
      _items: {
        type: Array
      },
      _total: {
        type: Number
      }
    };
  }

  static get styles() {
    return [ButtonSharedStyles, css`
        :host {
          display: block;
        }
      `];
  }

  render() {
    return html`
      <p ?hidden="${this._items.length !== 0}">Please add some products to cart.</p>
      ${this._items.map(item => html`
          <div>
            <shop-item .name="${item.title}" .amount="${item.amount}" .price="${item.price}"></shop-item>
            <button
                @click="${this._removeButtonClicked}"
                data-index="${item.id}"
                title="Remove from cart">
              ${removeFromCartIcon}
            </button>
          </div>
        `)}
      <p ?hidden="${!this._items.length}"><b>Total:</b> ${this._total}</p>
    `;
  }

  _removeButtonClicked(e) {
    store.dispatch(removeFromCart(e.currentTarget.dataset['index']));
  } // This is called every time something is updated in the store.


  stateChanged(state) {
    this._items = cartItemsSelector(state);
    this._total = cartTotalSelector(state);
  }

}

window.customElements.define('shop-cart', ShopCart);
store.addReducers({
  shop: shop$1
}); // These are the elements needed by this element.

class MyView3 extends connect(store)(PageViewElement) {
  static get properties() {
    return {
      // This is the data from the store.
      _quantity: {
        type: Number
      },
      _error: {
        type: String
      }
    };
  }

  static get styles() {
    return [SharedStyles, ButtonSharedStyles, css`
        button {
          border: 2px solid var(--app-dark-text-color);
          border-radius: 3px;
          padding: 8px 16px;
        }

        button:hover {
          border-color: var(--app-primary-color);
          color: var(--app-primary-color);
        }

        .cart,
        .cart svg {
          fill: var(--app-primary-color);
          width: 64px;
          height: 64px;
        }

        .circle.small {
          margin-top: -72px;
          width: 28px;
          height: 28px;
          font-size: 16px;
          font-weight: bold;
          line-height: 30px;
        }
      `];
  }

  render() {
    return html`
      <section>
        <h2>Redux example: shopping cart</h2>
        <div class="cart">${addToCartIcon}<div class="circle small">${this._quantity}</div></div>
        <p>This is a slightly more advanced Redux example, that simulates a
          shopping cart: getting the products, adding/removing items to the
          cart, and a checkout action, that can sometimes randomly fail (to
          simulate where you would add failure handling). </p>
        <p>This view, as well as its 2 child elements, <code>&lt;shop-products&gt;</code> and
        <code>&lt;shop-cart&gt;</code> are connected to the Redux store.</p>
      </section>
      <section>
        <h3>Products</h3>
        <shop-products></shop-products>

        <br>
        <h3>Your Cart</h3>
        <shop-cart></shop-cart>

        <div>${this._error}</div>
        <br>
        <p>
          <button ?hidden="${this._quantity == 0}" @click="${this._checkoutButtonClicked}">
            Checkout
          </button>
        </p>
      </section>
    `;
  }

  _checkoutButtonClicked() {
    store.dispatch(checkout());
  } // This is called every time something is updated in the store.


  stateChanged(state) {
    this._quantity = cartQuantitySelector(state);
    this._error = state.shop.error;
  }

}

window.customElements.define('my-view3', MyView3);
export { index as $index, shop as $shop, shop$2 as $shop$1, shop$1 as $shopDefault, ADD_TO_CART, CHECKOUT_FAILURE, CHECKOUT_SUCCESS, GET_PRODUCTS, REMOVE_FROM_CART, addToCart, addToCartUnsafe, cartItemsSelector, cartQuantitySelector, cartTotalSelector, checkout, createSelector, createSelectorCreator, createStructuredSelector, defaultMemoize, getAllProducts, removeFromCart };
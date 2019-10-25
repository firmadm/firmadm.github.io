import { html as html$1, dom, Polymer, html$1 as html, LitElement, css, html$2, SharedStyles, store, PageViewElement } from './my-app.js';
var KEY_IDENTIFIER = {
  'U+0008': 'backspace',
  'U+0009': 'tab',
  'U+001B': 'esc',
  'U+0020': 'space',
  'U+007F': 'del'
};
/**
 * Special table for KeyboardEvent.keyCode.
 * KeyboardEvent.keyIdentifier is better, and KeyBoardEvent.key is even better
 * than that.
 *
 * Values from:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
 */

var KEY_CODE = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  27: 'esc',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  46: 'del',
  106: '*'
};
/**
 * MODIFIER_KEYS maps the short name for modifier keys used in a key
 * combo string to the property name that references those same keys
 * in a KeyboardEvent instance.
 */

var MODIFIER_KEYS = {
  'shift': 'shiftKey',
  'ctrl': 'ctrlKey',
  'alt': 'altKey',
  'meta': 'metaKey'
};
/**
 * KeyboardEvent.key is mostly represented by printable character made by
 * the keyboard, with unprintable keys labeled nicely.
 *
 * However, on OS X, Alt+char can make a Unicode character that follows an
 * Apple-specific mapping. In this case, we fall back to .keyCode.
 */

var KEY_CHAR = /[a-z0-9*]/;
/**
 * Matches a keyIdentifier string.
 */

var IDENT_CHAR = /U\+/;
/**
 * Matches arrow keys in Gecko 27.0+
 */

var ARROW_KEY = /^arrow/;
/**
 * Matches space keys everywhere (notably including IE10's exceptional name
 * `spacebar`).
 */

var SPACE_KEY = /^space(bar)?/;
/**
 * Matches ESC key.
 *
 * Value from: http://w3c.github.io/uievents-key/#key-Escape
 */

var ESC_KEY = /^escape$/;
/**
 * Transforms the key.
 * @param {string} key The KeyBoardEvent.key
 * @param {Boolean} [noSpecialChars] Limits the transformation to
 * alpha-numeric characters.
 */

function transformKey(key, noSpecialChars) {
  var validKey = '';

  if (key) {
    var lKey = key.toLowerCase();

    if (lKey === ' ' || SPACE_KEY.test(lKey)) {
      validKey = 'space';
    } else if (ESC_KEY.test(lKey)) {
      validKey = 'esc';
    } else if (lKey.length == 1) {
      if (!noSpecialChars || KEY_CHAR.test(lKey)) {
        validKey = lKey;
      }
    } else if (ARROW_KEY.test(lKey)) {
      validKey = lKey.replace('arrow', '');
    } else if (lKey == 'multiply') {
      // numpad '*' can map to Multiply on IE/Windows
      validKey = '*';
    } else {
      validKey = lKey;
    }
  }

  return validKey;
}

function transformKeyIdentifier(keyIdent) {
  var validKey = '';

  if (keyIdent) {
    if (keyIdent in KEY_IDENTIFIER) {
      validKey = KEY_IDENTIFIER[keyIdent];
    } else if (IDENT_CHAR.test(keyIdent)) {
      keyIdent = parseInt(keyIdent.replace('U+', '0x'), 16);
      validKey = String.fromCharCode(keyIdent).toLowerCase();
    } else {
      validKey = keyIdent.toLowerCase();
    }
  }

  return validKey;
}

function transformKeyCode(keyCode) {
  var validKey = '';

  if (Number(keyCode)) {
    if (keyCode >= 65 && keyCode <= 90) {
      // ascii a-z
      // lowercase is 32 offset from uppercase
      validKey = String.fromCharCode(32 + keyCode);
    } else if (keyCode >= 112 && keyCode <= 123) {
      // function keys f1-f12
      validKey = 'f' + (keyCode - 112 + 1);
    } else if (keyCode >= 48 && keyCode <= 57) {
      // top 0-9 keys
      validKey = String(keyCode - 48);
    } else if (keyCode >= 96 && keyCode <= 105) {
      // num pad 0-9
      validKey = String(keyCode - 96);
    } else {
      validKey = KEY_CODE[keyCode];
    }
  }

  return validKey;
}
/**
 * Calculates the normalized key for a KeyboardEvent.
 * @param {KeyboardEvent} keyEvent
 * @param {Boolean} [noSpecialChars] Set to true to limit keyEvent.key
 * transformation to alpha-numeric chars. This is useful with key
 * combinations like shift + 2, which on FF for MacOS produces
 * keyEvent.key = @
 * To get 2 returned, set noSpecialChars = true
 * To get @ returned, set noSpecialChars = false
 */


function normalizedKeyForEvent(keyEvent, noSpecialChars) {
  // Fall back from .key, to .detail.key for artifical keyboard events,
  // and then to deprecated .keyIdentifier and .keyCode.
  if (keyEvent.key) {
    return transformKey(keyEvent.key, noSpecialChars);
  }

  if (keyEvent.detail && keyEvent.detail.key) {
    return transformKey(keyEvent.detail.key, noSpecialChars);
  }

  return transformKeyIdentifier(keyEvent.keyIdentifier) || transformKeyCode(keyEvent.keyCode) || '';
}

function keyComboMatchesEvent(keyCombo, event) {
  // For combos with modifiers we support only alpha-numeric keys
  var keyEvent = normalizedKeyForEvent(event, keyCombo.hasModifiers);
  return keyEvent === keyCombo.key && (!keyCombo.hasModifiers || !!event.shiftKey === !!keyCombo.shiftKey && !!event.ctrlKey === !!keyCombo.ctrlKey && !!event.altKey === !!keyCombo.altKey && !!event.metaKey === !!keyCombo.metaKey);
}

function parseKeyComboString(keyComboString) {
  if (keyComboString.length === 1) {
    return {
      combo: keyComboString,
      key: keyComboString,
      event: 'keydown'
    };
  }

  return keyComboString.split('+').reduce(function (parsedKeyCombo, keyComboPart) {
    var eventParts = keyComboPart.split(':');
    var keyName = eventParts[0];
    var event = eventParts[1];

    if (keyName in MODIFIER_KEYS) {
      parsedKeyCombo[MODIFIER_KEYS[keyName]] = true;
      parsedKeyCombo.hasModifiers = true;
    } else {
      parsedKeyCombo.key = keyName;
      parsedKeyCombo.event = event || 'keydown';
    }

    return parsedKeyCombo;
  }, {
    combo: keyComboString.split(':').shift()
  });
}

function parseEventString(eventString) {
  return eventString.trim().split(' ').map(function (keyComboString) {
    return parseKeyComboString(keyComboString);
  });
}
/**
 * `Polymer.IronA11yKeysBehavior` provides a normalized interface for processing
 * keyboard commands that pertain to [WAI-ARIA best
 * practices](http://www.w3.org/TR/wai-aria-practices/#kbd_general_binding). The
 * element takes care of browser differences with respect to Keyboard events and
 * uses an expressive syntax to filter key presses.
 *
 * Use the `keyBindings` prototype property to express what combination of keys
 * will trigger the callback. A key binding has the format
 * `"KEY+MODIFIER:EVENT": "callback"` (`"KEY": "callback"` or
 * `"KEY:EVENT": "callback"` are valid as well). Some examples:
 *
 *      keyBindings: {
 *        'space': '_onKeydown', // same as 'space:keydown'
 *        'shift+tab': '_onKeydown',
 *        'enter:keypress': '_onKeypress',
 *        'esc:keyup': '_onKeyup'
 *      }
 *
 * The callback will receive with an event containing the following information
 * in `event.detail`:
 *
 *      _onKeydown: function(event) {
 *        console.log(event.detail.combo); // KEY+MODIFIER, e.g. "shift+tab"
 *        console.log(event.detail.key); // KEY only, e.g. "tab"
 *        console.log(event.detail.event); // EVENT, e.g. "keydown"
 *        console.log(event.detail.keyboardEvent); // the original KeyboardEvent
 *      }
 *
 * Use the `keyEventTarget` attribute to set up event handlers on a specific
 * node.
 *
 * See the [demo source
 * code](https://github.com/PolymerElements/iron-a11y-keys-behavior/blob/master/demo/x-key-aware.html)
 * for an example.
 *
 * @demo demo/index.html
 * @polymerBehavior
 */


const IronA11yKeysBehavior = {
  properties: {
    /**
     * The EventTarget that will be firing relevant KeyboardEvents. Set it to
     * `null` to disable the listeners.
     * @type {?EventTarget}
     */
    keyEventTarget: {
      type: Object,
      value: function () {
        return this;
      }
    },

    /**
     * If true, this property will cause the implementing element to
     * automatically stop propagation on any handled KeyboardEvents.
     */
    stopKeyboardEventPropagation: {
      type: Boolean,
      value: false
    },
    _boundKeyHandlers: {
      type: Array,
      value: function () {
        return [];
      }
    },
    // We use this due to a limitation in IE10 where instances will have
    // own properties of everything on the "prototype".
    _imperativeKeyBindings: {
      type: Object,
      value: function () {
        return {};
      }
    }
  },
  observers: ['_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)'],

  /**
   * To be used to express what combination of keys  will trigger the relative
   * callback. e.g. `keyBindings: { 'esc': '_onEscPressed'}`
   * @type {!Object}
   */
  keyBindings: {},
  registered: function () {
    this._prepKeyBindings();
  },
  attached: function () {
    this._listenKeyEventListeners();
  },
  detached: function () {
    this._unlistenKeyEventListeners();
  },

  /**
   * Can be used to imperatively add a key binding to the implementing
   * element. This is the imperative equivalent of declaring a keybinding
   * in the `keyBindings` prototype property.
   *
   * @param {string} eventString
   * @param {string} handlerName
   */
  addOwnKeyBinding: function (eventString, handlerName) {
    this._imperativeKeyBindings[eventString] = handlerName;

    this._prepKeyBindings();

    this._resetKeyEventListeners();
  },

  /**
   * When called, will remove all imperatively-added key bindings.
   */
  removeOwnKeyBindings: function () {
    this._imperativeKeyBindings = {};

    this._prepKeyBindings();

    this._resetKeyEventListeners();
  },

  /**
   * Returns true if a keyboard event matches `eventString`.
   *
   * @param {KeyboardEvent} event
   * @param {string} eventString
   * @return {boolean}
   */
  keyboardEventMatchesKeys: function (event, eventString) {
    var keyCombos = parseEventString(eventString);

    for (var i = 0; i < keyCombos.length; ++i) {
      if (keyComboMatchesEvent(keyCombos[i], event)) {
        return true;
      }
    }

    return false;
  },
  _collectKeyBindings: function () {
    var keyBindings = this.behaviors.map(function (behavior) {
      return behavior.keyBindings;
    });

    if (keyBindings.indexOf(this.keyBindings) === -1) {
      keyBindings.push(this.keyBindings);
    }

    return keyBindings;
  },
  _prepKeyBindings: function () {
    this._keyBindings = {};

    this._collectKeyBindings().forEach(function (keyBindings) {
      for (var eventString in keyBindings) {
        this._addKeyBinding(eventString, keyBindings[eventString]);
      }
    }, this);

    for (var eventString in this._imperativeKeyBindings) {
      this._addKeyBinding(eventString, this._imperativeKeyBindings[eventString]);
    } // Give precedence to combos with modifiers to be checked first.


    for (var eventName in this._keyBindings) {
      this._keyBindings[eventName].sort(function (kb1, kb2) {
        var b1 = kb1[0].hasModifiers;
        var b2 = kb2[0].hasModifiers;
        return b1 === b2 ? 0 : b1 ? -1 : 1;
      });
    }
  },
  _addKeyBinding: function (eventString, handlerName) {
    parseEventString(eventString).forEach(function (keyCombo) {
      this._keyBindings[keyCombo.event] = this._keyBindings[keyCombo.event] || [];

      this._keyBindings[keyCombo.event].push([keyCombo, handlerName]);
    }, this);
  },
  _resetKeyEventListeners: function () {
    this._unlistenKeyEventListeners();

    if (this.isAttached) {
      this._listenKeyEventListeners();
    }
  },
  _listenKeyEventListeners: function () {
    if (!this.keyEventTarget) {
      return;
    }

    Object.keys(this._keyBindings).forEach(function (eventName) {
      var keyBindings = this._keyBindings[eventName];

      var boundKeyHandler = this._onKeyBindingEvent.bind(this, keyBindings);

      this._boundKeyHandlers.push([this.keyEventTarget, eventName, boundKeyHandler]);

      this.keyEventTarget.addEventListener(eventName, boundKeyHandler);
    }, this);
  },
  _unlistenKeyEventListeners: function () {
    var keyHandlerTuple;
    var keyEventTarget;
    var eventName;
    var boundKeyHandler;

    while (this._boundKeyHandlers.length) {
      // My kingdom for block-scope binding and destructuring assignment..
      keyHandlerTuple = this._boundKeyHandlers.pop();
      keyEventTarget = keyHandlerTuple[0];
      eventName = keyHandlerTuple[1];
      boundKeyHandler = keyHandlerTuple[2];
      keyEventTarget.removeEventListener(eventName, boundKeyHandler);
    }
  },
  _onKeyBindingEvent: function (keyBindings, event) {
    if (this.stopKeyboardEventPropagation) {
      event.stopPropagation();
    } // if event has been already prevented, don't do anything


    if (event.defaultPrevented) {
      return;
    }

    for (var i = 0; i < keyBindings.length; i++) {
      var keyCombo = keyBindings[i][0];
      var handlerName = keyBindings[i][1];

      if (keyComboMatchesEvent(keyCombo, event)) {
        this._triggerKeyHandler(keyCombo, handlerName, event); // exit the loop if eventDefault was prevented


        if (event.defaultPrevented) {
          return;
        }
      }
    }
  },
  _triggerKeyHandler: function (keyCombo, handlerName, keyboardEvent) {
    var detail = Object.create(keyCombo);
    detail.keyboardEvent = keyboardEvent;
    var event = new CustomEvent(keyCombo.event, {
      detail: detail,
      cancelable: true
    });
    this[handlerName].call(this, event);

    if (event.defaultPrevented) {
      keyboardEvent.preventDefault();
    }
  }
};
var ironA11yKeysBehavior = {
  IronA11yKeysBehavior: IronA11yKeysBehavior
};
const IronControlState = {
  properties: {
    /**
     * If true, the element currently has focus.
     */
    focused: {
      type: Boolean,
      value: false,
      notify: true,
      readOnly: true,
      reflectToAttribute: true
    },

    /**
     * If true, the user cannot interact with this element.
     */
    disabled: {
      type: Boolean,
      value: false,
      notify: true,
      observer: '_disabledChanged',
      reflectToAttribute: true
    },

    /**
     * Value of the `tabindex` attribute before `disabled` was activated.
     * `null` means the attribute was not present.
     * @type {?string|undefined}
     */
    _oldTabIndex: {
      type: String
    },
    _boundFocusBlurHandler: {
      type: Function,
      value: function () {
        return this._focusBlurHandler.bind(this);
      }
    }
  },
  observers: ['_changedControlState(focused, disabled)'],

  /**
   * @return {void}
   */
  ready: function () {
    this.addEventListener('focus', this._boundFocusBlurHandler, true);
    this.addEventListener('blur', this._boundFocusBlurHandler, true);
  },
  _focusBlurHandler: function (event) {
    // Polymer takes care of retargeting events.
    this._setFocused(event.type === 'focus');

    return;
  },
  _disabledChanged: function (disabled, old) {
    this.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    this.style.pointerEvents = disabled ? 'none' : '';

    if (disabled) {
      // Read the `tabindex` attribute instead of the `tabIndex` property.
      // The property returns `-1` if there is no `tabindex` attribute.
      // This distinction is important when restoring the value because
      // leaving `-1` hides shadow root children from the tab order.
      this._oldTabIndex = this.getAttribute('tabindex');

      this._setFocused(false);

      this.tabIndex = -1;
      this.blur();
    } else if (this._oldTabIndex !== undefined) {
      if (this._oldTabIndex === null) {
        this.removeAttribute('tabindex');
      } else {
        this.setAttribute('tabindex', this._oldTabIndex);
      }
    }
  },
  _changedControlState: function () {
    // _controlStateChanged is abstract, follow-on behaviors may implement it
    if (this._controlStateChanged) {
      this._controlStateChanged();
    }
  }
};
var ironControlState = {
  IronControlState: IronControlState
};
const IronButtonStateImpl = {
  properties: {
    /**
     * If true, the user is currently holding down the button.
     */
    pressed: {
      type: Boolean,
      readOnly: true,
      value: false,
      reflectToAttribute: true,
      observer: '_pressedChanged'
    },

    /**
     * If true, the button toggles the active state with each tap or press
     * of the spacebar.
     */
    toggles: {
      type: Boolean,
      value: false,
      reflectToAttribute: true
    },

    /**
     * If true, the button is a toggle and is currently in the active state.
     */
    active: {
      type: Boolean,
      value: false,
      notify: true,
      reflectToAttribute: true
    },

    /**
     * True if the element is currently being pressed by a "pointer," which
     * is loosely defined as mouse or touch input (but specifically excluding
     * keyboard input).
     */
    pointerDown: {
      type: Boolean,
      readOnly: true,
      value: false
    },

    /**
     * True if the input device that caused the element to receive focus
     * was a keyboard.
     */
    receivedFocusFromKeyboard: {
      type: Boolean,
      readOnly: true
    },

    /**
     * The aria attribute to be set if the button is a toggle and in the
     * active state.
     */
    ariaActiveAttribute: {
      type: String,
      value: 'aria-pressed',
      observer: '_ariaActiveAttributeChanged'
    }
  },
  listeners: {
    down: '_downHandler',
    up: '_upHandler',
    tap: '_tapHandler'
  },
  observers: ['_focusChanged(focused)', '_activeChanged(active, ariaActiveAttribute)'],

  /**
   * @type {!Object}
   */
  keyBindings: {
    'enter:keydown': '_asyncClick',
    'space:keydown': '_spaceKeyDownHandler',
    'space:keyup': '_spaceKeyUpHandler'
  },
  _mouseEventRe: /^mouse/,
  _tapHandler: function () {
    if (this.toggles) {
      // a tap is needed to toggle the active state
      this._userActivate(!this.active);
    } else {
      this.active = false;
    }
  },
  _focusChanged: function (focused) {
    this._detectKeyboardFocus(focused);

    if (!focused) {
      this._setPressed(false);
    }
  },
  _detectKeyboardFocus: function (focused) {
    this._setReceivedFocusFromKeyboard(!this.pointerDown && focused);
  },
  // to emulate native checkbox, (de-)activations from a user interaction fire
  // 'change' events
  _userActivate: function (active) {
    if (this.active !== active) {
      this.active = active;
      this.fire('change');
    }
  },
  _downHandler: function (event) {
    this._setPointerDown(true);

    this._setPressed(true);

    this._setReceivedFocusFromKeyboard(false);
  },
  _upHandler: function () {
    this._setPointerDown(false);

    this._setPressed(false);
  },

  /**
   * @param {!KeyboardEvent} event .
   */
  _spaceKeyDownHandler: function (event) {
    var keyboardEvent = event.detail.keyboardEvent;
    var target = dom(keyboardEvent).localTarget; // Ignore the event if this is coming from a focused light child, since that
    // element will deal with it.

    if (this.isLightDescendant(
    /** @type {Node} */
    target)) return;
    keyboardEvent.preventDefault();
    keyboardEvent.stopImmediatePropagation();

    this._setPressed(true);
  },

  /**
   * @param {!KeyboardEvent} event .
   */
  _spaceKeyUpHandler: function (event) {
    var keyboardEvent = event.detail.keyboardEvent;
    var target = dom(keyboardEvent).localTarget; // Ignore the event if this is coming from a focused light child, since that
    // element will deal with it.

    if (this.isLightDescendant(
    /** @type {Node} */
    target)) return;

    if (this.pressed) {
      this._asyncClick();
    }

    this._setPressed(false);
  },
  // trigger click asynchronously, the asynchrony is useful to allow one
  // event handler to unwind before triggering another event
  _asyncClick: function () {
    this.async(function () {
      this.click();
    }, 1);
  },
  // any of these changes are considered a change to button state
  _pressedChanged: function (pressed) {
    this._changedButtonState();
  },
  _ariaActiveAttributeChanged: function (value, oldValue) {
    if (oldValue && oldValue != value && this.hasAttribute(oldValue)) {
      this.removeAttribute(oldValue);
    }
  },
  _activeChanged: function (active, ariaActiveAttribute) {
    if (this.toggles) {
      this.setAttribute(this.ariaActiveAttribute, active ? 'true' : 'false');
    } else {
      this.removeAttribute(this.ariaActiveAttribute);
    }

    this._changedButtonState();
  },
  _controlStateChanged: function () {
    if (this.disabled) {
      this._setPressed(false);
    } else {
      this._changedButtonState();
    }
  },
  // provide hook for follow-on behaviors to react to button-state
  _changedButtonState: function () {
    if (this._buttonStateChanged) {
      this._buttonStateChanged(); // abstract

    }
  }
};
/** @polymerBehavior */

const IronButtonState = [IronA11yKeysBehavior, IronButtonStateImpl];
var ironButtonState = {
  IronButtonStateImpl: IronButtonStateImpl,
  IronButtonState: IronButtonState
};
var Utility = {
  distance: function (x1, y1, x2, y2) {
    var xDelta = x1 - x2;
    var yDelta = y1 - y2;
    return Math.sqrt(xDelta * xDelta + yDelta * yDelta);
  },
  now: window.performance && window.performance.now ? window.performance.now.bind(window.performance) : Date.now
};
/**
 * @param {HTMLElement} element
 * @constructor
 */

function ElementMetrics(element) {
  this.element = element;
  this.width = this.boundingRect.width;
  this.height = this.boundingRect.height;
  this.size = Math.max(this.width, this.height);
}

ElementMetrics.prototype = {
  get boundingRect() {
    return this.element.getBoundingClientRect();
  },

  furthestCornerDistanceFrom: function (x, y) {
    var topLeft = Utility.distance(x, y, 0, 0);
    var topRight = Utility.distance(x, y, this.width, 0);
    var bottomLeft = Utility.distance(x, y, 0, this.height);
    var bottomRight = Utility.distance(x, y, this.width, this.height);
    return Math.max(topLeft, topRight, bottomLeft, bottomRight);
  }
};
/**
 * @param {HTMLElement} element
 * @constructor
 */

function Ripple(element) {
  this.element = element;
  this.color = window.getComputedStyle(element).color;
  this.wave = document.createElement('div');
  this.waveContainer = document.createElement('div');
  this.wave.style.backgroundColor = this.color;
  this.wave.classList.add('wave');
  this.waveContainer.classList.add('wave-container');
  dom(this.waveContainer).appendChild(this.wave);
  this.resetInteractionState();
}

Ripple.MAX_RADIUS = 300;
Ripple.prototype = {
  get recenters() {
    return this.element.recenters;
  },

  get center() {
    return this.element.center;
  },

  get mouseDownElapsed() {
    var elapsed;

    if (!this.mouseDownStart) {
      return 0;
    }

    elapsed = Utility.now() - this.mouseDownStart;

    if (this.mouseUpStart) {
      elapsed -= this.mouseUpElapsed;
    }

    return elapsed;
  },

  get mouseUpElapsed() {
    return this.mouseUpStart ? Utility.now() - this.mouseUpStart : 0;
  },

  get mouseDownElapsedSeconds() {
    return this.mouseDownElapsed / 1000;
  },

  get mouseUpElapsedSeconds() {
    return this.mouseUpElapsed / 1000;
  },

  get mouseInteractionSeconds() {
    return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds;
  },

  get initialOpacity() {
    return this.element.initialOpacity;
  },

  get opacityDecayVelocity() {
    return this.element.opacityDecayVelocity;
  },

  get radius() {
    var width2 = this.containerMetrics.width * this.containerMetrics.width;
    var height2 = this.containerMetrics.height * this.containerMetrics.height;
    var waveRadius = Math.min(Math.sqrt(width2 + height2), Ripple.MAX_RADIUS) * 1.1 + 5;
    var duration = 1.1 - 0.2 * (waveRadius / Ripple.MAX_RADIUS);
    var timeNow = this.mouseInteractionSeconds / duration;
    var size = waveRadius * (1 - Math.pow(80, -timeNow));
    return Math.abs(size);
  },

  get opacity() {
    if (!this.mouseUpStart) {
      return this.initialOpacity;
    }

    return Math.max(0, this.initialOpacity - this.mouseUpElapsedSeconds * this.opacityDecayVelocity);
  },

  get outerOpacity() {
    // Linear increase in background opacity, capped at the opacity
    // of the wavefront (waveOpacity).
    var outerOpacity = this.mouseUpElapsedSeconds * 0.3;
    var waveOpacity = this.opacity;
    return Math.max(0, Math.min(outerOpacity, waveOpacity));
  },

  get isOpacityFullyDecayed() {
    return this.opacity < 0.01 && this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
  },

  get isRestingAtMaxRadius() {
    return this.opacity >= this.initialOpacity && this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
  },

  get isAnimationComplete() {
    return this.mouseUpStart ? this.isOpacityFullyDecayed : this.isRestingAtMaxRadius;
  },

  get translationFraction() {
    return Math.min(1, this.radius / this.containerMetrics.size * 2 / Math.sqrt(2));
  },

  get xNow() {
    if (this.xEnd) {
      return this.xStart + this.translationFraction * (this.xEnd - this.xStart);
    }

    return this.xStart;
  },

  get yNow() {
    if (this.yEnd) {
      return this.yStart + this.translationFraction * (this.yEnd - this.yStart);
    }

    return this.yStart;
  },

  get isMouseDown() {
    return this.mouseDownStart && !this.mouseUpStart;
  },

  resetInteractionState: function () {
    this.maxRadius = 0;
    this.mouseDownStart = 0;
    this.mouseUpStart = 0;
    this.xStart = 0;
    this.yStart = 0;
    this.xEnd = 0;
    this.yEnd = 0;
    this.slideDistance = 0;
    this.containerMetrics = new ElementMetrics(this.element);
  },
  draw: function () {
    var scale;
    var dx;
    var dy;
    this.wave.style.opacity = this.opacity;
    scale = this.radius / (this.containerMetrics.size / 2);
    dx = this.xNow - this.containerMetrics.width / 2;
    dy = this.yNow - this.containerMetrics.height / 2; // 2d transform for safari because of border-radius and overflow:hidden
    // clipping bug. https://bugs.webkit.org/show_bug.cgi?id=98538

    this.waveContainer.style.webkitTransform = 'translate(' + dx + 'px, ' + dy + 'px)';
    this.waveContainer.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0)';
    this.wave.style.webkitTransform = 'scale(' + scale + ',' + scale + ')';
    this.wave.style.transform = 'scale3d(' + scale + ',' + scale + ',1)';
  },

  /** @param {Event=} event */
  downAction: function (event) {
    var xCenter = this.containerMetrics.width / 2;
    var yCenter = this.containerMetrics.height / 2;
    this.resetInteractionState();
    this.mouseDownStart = Utility.now();

    if (this.center) {
      this.xStart = xCenter;
      this.yStart = yCenter;
      this.slideDistance = Utility.distance(this.xStart, this.yStart, this.xEnd, this.yEnd);
    } else {
      this.xStart = event ? event.detail.x - this.containerMetrics.boundingRect.left : this.containerMetrics.width / 2;
      this.yStart = event ? event.detail.y - this.containerMetrics.boundingRect.top : this.containerMetrics.height / 2;
    }

    if (this.recenters) {
      this.xEnd = xCenter;
      this.yEnd = yCenter;
      this.slideDistance = Utility.distance(this.xStart, this.yStart, this.xEnd, this.yEnd);
    }

    this.maxRadius = this.containerMetrics.furthestCornerDistanceFrom(this.xStart, this.yStart);
    this.waveContainer.style.top = (this.containerMetrics.height - this.containerMetrics.size) / 2 + 'px';
    this.waveContainer.style.left = (this.containerMetrics.width - this.containerMetrics.size) / 2 + 'px';
    this.waveContainer.style.width = this.containerMetrics.size + 'px';
    this.waveContainer.style.height = this.containerMetrics.size + 'px';
  },

  /** @param {Event=} event */
  upAction: function (event) {
    if (!this.isMouseDown) {
      return;
    }

    this.mouseUpStart = Utility.now();
  },
  remove: function () {
    dom(this.waveContainer.parentNode).removeChild(this.waveContainer);
  }
};
/**
Material design: [Surface
reaction](https://www.google.com/design/spec/animation/responsive-interaction.html#responsive-interaction-surface-reaction)

`paper-ripple` provides a visual effect that other paper elements can
use to simulate a rippling effect emanating from the point of contact.  The
effect can be visualized as a concentric circle with motion.

Example:

    <div style="position:relative">
      <paper-ripple></paper-ripple>
    </div>

Note, it's important that the parent container of the ripple be relative
position, otherwise the ripple will emanate outside of the desired container.

`paper-ripple` listens to "mousedown" and "mouseup" events so it would display
ripple effect when touches on it.  You can also defeat the default behavior and
manually route the down and up actions to the ripple element.  Note that it is
important if you call `downAction()` you will have to make sure to call
`upAction()` so that `paper-ripple` would end the animation loop.

Example:

    <paper-ripple id="ripple" style="pointer-events: none;"></paper-ripple>
    ...
    downAction: function(e) {
      this.$.ripple.downAction(e.detail);
    },
    upAction: function(e) {
      this.$.ripple.upAction();
    }

Styling ripple effect:

  Use CSS color property to style the ripple:

    paper-ripple {
      color: #4285f4;
    }

  Note that CSS color property is inherited so it is not required to set it on
  the `paper-ripple` element directly.

By default, the ripple is centered on the point of contact.  Apply the
`recenters` attribute to have the ripple grow toward the center of its
container.

    <paper-ripple recenters></paper-ripple>

You can also  center the ripple inside its container from the start.

    <paper-ripple center></paper-ripple>

Apply `circle` class to make the rippling effect within a circle.

    <paper-ripple class="circle"></paper-ripple>

@group Paper Elements
@element paper-ripple
@hero hero.svg
@demo demo/index.html
*/

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
        position: absolute;
        border-radius: inherit;
        overflow: hidden;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        /* See PolymerElements/paper-behaviors/issues/34. On non-Chrome browsers,
         * creating a node (with a position:absolute) in the middle of an event
         * handler "interrupts" that event handler (which happens when the
         * ripple is created on demand) */
        pointer-events: none;
      }

      :host([animating]) {
        /* This resolves a rendering issue in Chrome (as of 40) where the
           ripple is not properly clipped by its parent (which may have
           rounded corners). See: http://jsbin.com/temexa/4

           Note: We only apply this style conditionally. Otherwise, the browser
           will create a new compositing layer for every ripple element on the
           page, and that would be bad. */
        -webkit-transform: translate(0, 0);
        transform: translate3d(0, 0, 0);
      }

      #background,
      #waves,
      .wave-container,
      .wave {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      #background,
      .wave {
        opacity: 0;
      }

      #waves,
      .wave {
        overflow: hidden;
      }

      .wave-container,
      .wave {
        border-radius: 50%;
      }

      :host(.circle) #background,
      :host(.circle) #waves {
        border-radius: 50%;
      }

      :host(.circle) .wave-container {
        overflow: hidden;
      }
    </style>

    <div id="background"></div>
    <div id="waves"></div>
`,
  is: 'paper-ripple',
  behaviors: [IronA11yKeysBehavior],
  properties: {
    /**
     * The initial opacity set on the wave.
     *
     * @attribute initialOpacity
     * @type number
     * @default 0.25
     */
    initialOpacity: {
      type: Number,
      value: 0.25
    },

    /**
     * How fast (opacity per second) the wave fades out.
     *
     * @attribute opacityDecayVelocity
     * @type number
     * @default 0.8
     */
    opacityDecayVelocity: {
      type: Number,
      value: 0.8
    },

    /**
     * If true, ripples will exhibit a gravitational pull towards
     * the center of their container as they fade away.
     *
     * @attribute recenters
     * @type boolean
     * @default false
     */
    recenters: {
      type: Boolean,
      value: false
    },

    /**
     * If true, ripples will center inside its container
     *
     * @attribute recenters
     * @type boolean
     * @default false
     */
    center: {
      type: Boolean,
      value: false
    },

    /**
     * A list of the visual ripples.
     *
     * @attribute ripples
     * @type Array
     * @default []
     */
    ripples: {
      type: Array,
      value: function () {
        return [];
      }
    },

    /**
     * True when there are visible ripples animating within the
     * element.
     */
    animating: {
      type: Boolean,
      readOnly: true,
      reflectToAttribute: true,
      value: false
    },

    /**
     * If true, the ripple will remain in the "down" state until `holdDown`
     * is set to false again.
     */
    holdDown: {
      type: Boolean,
      value: false,
      observer: '_holdDownChanged'
    },

    /**
     * If true, the ripple will not generate a ripple effect
     * via pointer interaction.
     * Calling ripple's imperative api like `simulatedRipple` will
     * still generate the ripple effect.
     */
    noink: {
      type: Boolean,
      value: false
    },
    _animating: {
      type: Boolean
    },
    _boundAnimate: {
      type: Function,
      value: function () {
        return this.animate.bind(this);
      }
    }
  },

  get target() {
    return this.keyEventTarget;
  },

  /**
   * @type {!Object}
   */
  keyBindings: {
    'enter:keydown': '_onEnterKeydown',
    'space:keydown': '_onSpaceKeydown',
    'space:keyup': '_onSpaceKeyup'
  },
  attached: function () {
    // Set up a11yKeysBehavior to listen to key events on the target,
    // so that space and enter activate the ripple even if the target doesn't
    // handle key events. The key handlers deal with `noink` themselves.
    if (this.parentNode.nodeType == 11) {
      // DOCUMENT_FRAGMENT_NODE
      this.keyEventTarget = dom(this).getOwnerRoot().host;
    } else {
      this.keyEventTarget = this.parentNode;
    }

    var keyEventTarget =
    /** @type {!EventTarget} */
    this.keyEventTarget;
    this.listen(keyEventTarget, 'up', 'uiUpAction');
    this.listen(keyEventTarget, 'down', 'uiDownAction');
  },
  detached: function () {
    this.unlisten(this.keyEventTarget, 'up', 'uiUpAction');
    this.unlisten(this.keyEventTarget, 'down', 'uiDownAction');
    this.keyEventTarget = null;
  },

  get shouldKeepAnimating() {
    for (var index = 0; index < this.ripples.length; ++index) {
      if (!this.ripples[index].isAnimationComplete) {
        return true;
      }
    }

    return false;
  },

  simulatedRipple: function () {
    this.downAction(null); // Please see polymer/polymer#1305

    this.async(function () {
      this.upAction();
    }, 1);
  },

  /**
   * Provokes a ripple down effect via a UI event,
   * respecting the `noink` property.
   * @param {Event=} event
   */
  uiDownAction: function (event) {
    if (!this.noink) {
      this.downAction(event);
    }
  },

  /**
   * Provokes a ripple down effect via a UI event,
   * *not* respecting the `noink` property.
   * @param {Event=} event
   */
  downAction: function (event) {
    if (this.holdDown && this.ripples.length > 0) {
      return;
    }

    var ripple = this.addRipple();
    ripple.downAction(event);

    if (!this._animating) {
      this._animating = true;
      this.animate();
    }
  },

  /**
   * Provokes a ripple up effect via a UI event,
   * respecting the `noink` property.
   * @param {Event=} event
   */
  uiUpAction: function (event) {
    if (!this.noink) {
      this.upAction(event);
    }
  },

  /**
   * Provokes a ripple up effect via a UI event,
   * *not* respecting the `noink` property.
   * @param {Event=} event
   */
  upAction: function (event) {
    if (this.holdDown) {
      return;
    }

    this.ripples.forEach(function (ripple) {
      ripple.upAction(event);
    });
    this._animating = true;
    this.animate();
  },
  onAnimationComplete: function () {
    this._animating = false;
    this.$.background.style.backgroundColor = null;
    this.fire('transitionend');
  },
  addRipple: function () {
    var ripple = new Ripple(this);
    dom(this.$.waves).appendChild(ripple.waveContainer);
    this.$.background.style.backgroundColor = ripple.color;
    this.ripples.push(ripple);

    this._setAnimating(true);

    return ripple;
  },
  removeRipple: function (ripple) {
    var rippleIndex = this.ripples.indexOf(ripple);

    if (rippleIndex < 0) {
      return;
    }

    this.ripples.splice(rippleIndex, 1);
    ripple.remove();

    if (!this.ripples.length) {
      this._setAnimating(false);
    }
  },

  /**
   * Deprecated. Please use animateRipple() instead.
   *
   * This method name conflicts with Element#animate().
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/animate.
   *
   * @suppress {checkTypes}
   */
  animate: function () {
    if (!this._animating) {
      return;
    }

    var index;
    var ripple;

    for (index = 0; index < this.ripples.length; ++index) {
      ripple = this.ripples[index];
      ripple.draw();
      this.$.background.style.opacity = ripple.outerOpacity;

      if (ripple.isOpacityFullyDecayed && !ripple.isRestingAtMaxRadius) {
        this.removeRipple(ripple);
      }
    }

    if (!this.shouldKeepAnimating && this.ripples.length === 0) {
      this.onAnimationComplete();
    } else {
      window.requestAnimationFrame(this._boundAnimate);
    }
  },

  /**
   * An alias for animate() whose name does not conflict with the platform
   * Element.animate() method.
   */
  animateRipple: function () {
    return this.animate();
  },
  _onEnterKeydown: function () {
    this.uiDownAction();
    this.async(this.uiUpAction, 1);
  },
  _onSpaceKeydown: function () {
    this.uiDownAction();
  },
  _onSpaceKeyup: function () {
    this.uiUpAction();
  },
  // note: holdDown does not respect noink since it can be a focus based
  // effect.
  _holdDownChanged: function (newVal, oldVal) {
    if (oldVal === undefined) {
      return;
    }

    if (newVal) {
      this.downAction();
    } else {
      this.upAction();
    }
  }
  /**
  Fired when the animation finishes.
  This is useful if you want to wait until
  the ripple animation finishes to perform some action.
   @event transitionend
  @param {{node: Object}} detail Contains the animated node.
  */

});
const PaperRippleBehavior = {
  properties: {
    /**
     * If true, the element will not produce a ripple effect when interacted
     * with via the pointer.
     */
    noink: {
      type: Boolean,
      observer: '_noinkChanged'
    },

    /**
     * @type {Element|undefined}
     */
    _rippleContainer: {
      type: Object
    }
  },

  /**
   * Ensures a `<paper-ripple>` element is available when the element is
   * focused.
   */
  _buttonStateChanged: function () {
    if (this.focused) {
      this.ensureRipple();
    }
  },

  /**
   * In addition to the functionality provided in `IronButtonState`, ensures
   * a ripple effect is created when the element is in a `pressed` state.
   */
  _downHandler: function (event) {
    IronButtonStateImpl._downHandler.call(this, event);

    if (this.pressed) {
      this.ensureRipple(event);
    }
  },

  /**
   * Ensures this element contains a ripple effect. For startup efficiency
   * the ripple effect is dynamically on demand when needed.
   * @param {!Event=} optTriggeringEvent (optional) event that triggered the
   * ripple.
   */
  ensureRipple: function (optTriggeringEvent) {
    if (!this.hasRipple()) {
      this._ripple = this._createRipple();
      this._ripple.noink = this.noink;
      var rippleContainer = this._rippleContainer || this.root;

      if (rippleContainer) {
        dom(rippleContainer).appendChild(this._ripple);
      }

      if (optTriggeringEvent) {
        // Check if the event happened inside of the ripple container
        // Fall back to host instead of the root because distributed text
        // nodes are not valid event targets
        var domContainer = dom(this._rippleContainer || this);
        var target = dom(optTriggeringEvent).rootTarget;

        if (domContainer.deepContains(
        /** @type {Node} */
        target)) {
          this._ripple.uiDownAction(optTriggeringEvent);
        }
      }
    }
  },

  /**
   * Returns the `<paper-ripple>` element used by this element to create
   * ripple effects. The element's ripple is created on demand, when
   * necessary, and calling this method will force the
   * ripple to be created.
   */
  getRipple: function () {
    this.ensureRipple();
    return this._ripple;
  },

  /**
   * Returns true if this element currently contains a ripple effect.
   * @return {boolean}
   */
  hasRipple: function () {
    return Boolean(this._ripple);
  },

  /**
   * Create the element's ripple effect via creating a `<paper-ripple>`.
   * Override this method to customize the ripple element.
   * @return {!PaperRippleElement} Returns a `<paper-ripple>` element.
   */
  _createRipple: function () {
    var element =
    /** @type {!PaperRippleElement} */
    document.createElement('paper-ripple');
    return element;
  },
  _noinkChanged: function (noink) {
    if (this.hasRipple()) {
      this._ripple.noink = noink;
    }
  }
};
var paperRippleBehavior = {
  PaperRippleBehavior: PaperRippleBehavior
};
const PaperButtonBehaviorImpl = {
  properties: {
    /**
     * The z-depth of this element, from 0-5. Setting to 0 will remove the
     * shadow, and each increasing number greater than 0 will be "deeper"
     * than the last.
     *
     * @attribute elevation
     * @type number
     * @default 1
     */
    elevation: {
      type: Number,
      reflectToAttribute: true,
      readOnly: true
    }
  },
  observers: ['_calculateElevation(focused, disabled, active, pressed, receivedFocusFromKeyboard)', '_computeKeyboardClass(receivedFocusFromKeyboard)'],
  hostAttributes: {
    role: 'button',
    tabindex: '0',
    animated: true
  },
  _calculateElevation: function () {
    var e = 1;

    if (this.disabled) {
      e = 0;
    } else if (this.active || this.pressed) {
      e = 4;
    } else if (this.receivedFocusFromKeyboard) {
      e = 3;
    }

    this._setElevation(e);
  },
  _computeKeyboardClass: function (receivedFocusFromKeyboard) {
    this.toggleClass('keyboard-focus', receivedFocusFromKeyboard);
  },

  /**
   * In addition to `IronButtonState` behavior, when space key goes down,
   * create a ripple down effect.
   *
   * @param {!KeyboardEvent} event .
   */
  _spaceKeyDownHandler: function (event) {
    IronButtonStateImpl._spaceKeyDownHandler.call(this, event); // Ensure that there is at most one ripple when the space key is held down.


    if (this.hasRipple() && this.getRipple().ripples.length < 1) {
      this._ripple.uiDownAction();
    }
  },

  /**
   * In addition to `IronButtonState` behavior, when space key goes up,
   * create a ripple up effect.
   *
   * @param {!KeyboardEvent} event .
   */
  _spaceKeyUpHandler: function (event) {
    IronButtonStateImpl._spaceKeyUpHandler.call(this, event);

    if (this.hasRipple()) {
      this._ripple.uiUpAction();
    }
  }
};
/** @polymerBehavior */

const PaperButtonBehavior = [IronButtonState, IronControlState, PaperRippleBehavior, PaperButtonBehaviorImpl];
var paperButtonBehavior = {
  PaperButtonBehaviorImpl: PaperButtonBehaviorImpl,
  PaperButtonBehavior: PaperButtonBehavior
};
const template = html`
<custom-style>
  <style is="custom-style">
    html {

      --shadow-transition: {
        transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      };

      --shadow-none: {
        box-shadow: none;
      };

      /* from http://codepen.io/shyndman/pen/c5394ddf2e8b2a5c9185904b57421cdb */

      --shadow-elevation-2dp: {
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
      };

      --shadow-elevation-3dp: {
        box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
                    0 1px 8px 0 rgba(0, 0, 0, 0.12),
                    0 3px 3px -2px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-4dp: {
        box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12),
                    0 2px 4px -1px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-6dp: {
        box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                    0 1px 18px 0 rgba(0, 0, 0, 0.12),
                    0 3px 5px -1px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-8dp: {
        box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                    0 3px 14px 2px rgba(0, 0, 0, 0.12),
                    0 5px 5px -3px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-12dp: {
        box-shadow: 0 12px 16px 1px rgba(0, 0, 0, 0.14),
                    0 4px 22px 3px rgba(0, 0, 0, 0.12),
                    0 6px 7px -4px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-16dp: {
        box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
                    0  6px 30px 5px rgba(0, 0, 0, 0.12),
                    0  8px 10px -5px rgba(0, 0, 0, 0.4);
      };

      --shadow-elevation-24dp: {
        box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14),
                    0 9px 46px 8px rgba(0, 0, 0, 0.12),
                    0 11px 15px -7px rgba(0, 0, 0, 0.4);
      };
    }
  </style>
</custom-style>`;
template.setAttribute('style', 'display: none;');
document.head.appendChild(template.content);
const template$1 = html`
<dom-module id="paper-material-styles">
  <template>
    <style>
      html {
        --paper-material: {
          display: block;
          position: relative;
        };
        --paper-material-elevation-1: {
          @apply --shadow-elevation-2dp;
        };
        --paper-material-elevation-2: {
          @apply --shadow-elevation-4dp;
        };
        --paper-material-elevation-3: {
          @apply --shadow-elevation-6dp;
        };
        --paper-material-elevation-4: {
          @apply --shadow-elevation-8dp;
        };
        --paper-material-elevation-5: {
          @apply --shadow-elevation-16dp;
        };
      }
      .paper-material {
        @apply --paper-material;
      }
      .paper-material[elevation="1"] {
        @apply --paper-material-elevation-1;
      }
      .paper-material[elevation="2"] {
        @apply --paper-material-elevation-2;
      }
      .paper-material[elevation="3"] {
        @apply --paper-material-elevation-3;
      }
      .paper-material[elevation="4"] {
        @apply --paper-material-elevation-4;
      }
      .paper-material[elevation="5"] {
        @apply --paper-material-elevation-5;
      }

      /* Duplicate the styles because of https://github.com/webcomponents/shadycss/issues/193 */
      :host {
        --paper-material: {
          display: block;
          position: relative;
        };
        --paper-material-elevation-1: {
          @apply --shadow-elevation-2dp;
        };
        --paper-material-elevation-2: {
          @apply --shadow-elevation-4dp;
        };
        --paper-material-elevation-3: {
          @apply --shadow-elevation-6dp;
        };
        --paper-material-elevation-4: {
          @apply --shadow-elevation-8dp;
        };
        --paper-material-elevation-5: {
          @apply --shadow-elevation-16dp;
        };
      }
      :host(.paper-material) {
        @apply --paper-material;
      }
      :host(.paper-material[elevation="1"]) {
        @apply --paper-material-elevation-1;
      }
      :host(.paper-material[elevation="2"]) {
        @apply --paper-material-elevation-2;
      }
      :host(.paper-material[elevation="3"]) {
        @apply --paper-material-elevation-3;
      }
      :host(.paper-material[elevation="4"]) {
        @apply --paper-material-elevation-4;
      }
      :host(.paper-material[elevation="5"]) {
        @apply --paper-material-elevation-5;
      }
    </style>
  </template>
</dom-module>`;
template$1.setAttribute('style', 'display: none;');
document.head.appendChild(template$1.content);
const template$2 = html$1`
  <style include="paper-material-styles">
    /* Need to specify the same specificity as the styles imported from paper-material. */
    :host {
      @apply --layout-inline;
      @apply --layout-center-center;
      position: relative;
      box-sizing: border-box;
      min-width: 5.14em;
      margin: 0 0.29em;
      background: transparent;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      -webkit-tap-highlight-color: transparent;
      font: inherit;
      text-transform: uppercase;
      outline-width: 0;
      border-radius: 3px;
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-user-select: none;
      user-select: none;
      cursor: pointer;
      z-index: 0;
      padding: 0.7em 0.57em;

      @apply --paper-font-common-base;
      @apply --paper-button;
    }

    :host([elevation="1"]) {
      @apply --paper-material-elevation-1;
    }

    :host([elevation="2"]) {
      @apply --paper-material-elevation-2;
    }

    :host([elevation="3"]) {
      @apply --paper-material-elevation-3;
    }

    :host([elevation="4"]) {
      @apply --paper-material-elevation-4;
    }

    :host([elevation="5"]) {
      @apply --paper-material-elevation-5;
    }

    :host([hidden]) {
      display: none !important;
    }

    :host([raised].keyboard-focus) {
      font-weight: bold;
      @apply --paper-button-raised-keyboard-focus;
    }

    :host(:not([raised]).keyboard-focus) {
      font-weight: bold;
      @apply --paper-button-flat-keyboard-focus;
    }

    :host([disabled]) {
      background: none;
      color: #a8a8a8;
      cursor: auto;
      pointer-events: none;

      @apply --paper-button-disabled;
    }

    :host([disabled][raised]) {
      background: #eaeaea;
    }


    :host([animated]) {
      @apply --shadow-transition;
    }

    paper-ripple {
      color: var(--paper-button-ink-color);
    }
  </style>

  <slot></slot>`;
template$2.setAttribute('strip-whitespace', '');
/**
Material design:
[Buttons](https://www.google.com/design/spec/components/buttons.html)
                                              `paper-button` is a button. When the user touches the button, a ripple effect
emanates from the point of contact. It may be flat or raised. A raised button is
styled with a shadow.
                                              Example:
                                                  <paper-button>Flat button</paper-button>
  <paper-button raised>Raised button</paper-button>
  <paper-button noink>No ripple effect</paper-button>
  <paper-button toggles>Toggle-able button</paper-button>
                                              A button that has `toggles` true will remain `active` after being clicked (and
will have an `active` attribute set). For more information, see the
`IronButtonState` behavior.
                                              You may use custom DOM in the button body to create a variety of buttons. For
example, to create a button with an icon and some text:
                                                  <paper-button>
    <iron-icon icon="favorite"></iron-icon>
    custom button content
  </paper-button>
                                              To use `paper-button` as a link, wrap it in an anchor tag. Since `paper-button`
will already receive focus, you may want to prevent the anchor tag from
receiving focus as well by setting its tabindex to -1.
                                                  <a href="https://www.polymer-project.org/" tabindex="-1">
    <paper-button raised>Polymer Project</paper-button>
  </a>
                                              ### Styling
                                              Style the button with CSS as you would a normal DOM element.
                                                  paper-button.fancy {
    background: green;
    color: yellow;
  }
                                                  paper-button.fancy:hover {
    background: lime;
  }
                                                  paper-button[disabled],
  paper-button[toggles][active] {
    background: red;
  }
                                              By default, the ripple is the same color as the foreground at 25% opacity. You
may customize the color using the `--paper-button-ink-color` custom property.
                                              The following custom properties and mixins are also available for styling:
                                              Custom property | Description | Default
----------------|-------------|----------
`--paper-button-ink-color` | Background color of the ripple | `Based on the button's color`
`--paper-button` | Mixin applied to the button | `{}`
`--paper-button-disabled` | Mixin applied to the disabled button. Note that you can also use the `paper-button[disabled]` selector | `{}`
`--paper-button-flat-keyboard-focus` | Mixin applied to a flat button after it's been focused using the keyboard | `{}`
`--paper-button-raised-keyboard-focus` | Mixin applied to a raised button after it's been focused using the keyboard | `{}`
                                              @demo demo/index.html
*/

Polymer({
  _template: template$2,
  is: 'paper-button',
  behaviors: [PaperButtonBehavior],
  properties: {
    /**
     * If true, the button should be styled with a shadow.
     */
    raised: {
      type: Boolean,
      reflectToAttribute: true,
      value: false,
      observer: '_calculateElevation'
    }
  },
  _calculateElevation: function () {
    if (!this.raised) {
      this._setElevation(0);
    } else {
      PaperButtonBehaviorImpl._calculateElevation.apply(this);
    }
  }
  /**
  Fired when the animation finishes.
  This is useful if you want to wait until
  the ripple animation finishes to perform some action.
   @event transitionend
  Event param: {{node: Object}} detail Contains the animated node.
  */

});
const CAPTURE = 'CAPTURE';
const CLEAR = 'CLEAR';

const capture = payload => {
  return {
    type: CAPTURE,
    payload: payload
  };
};

const clear = () => {
  return {
    type: CLEAR
  };
};

var camera = {
  CAPTURE: CAPTURE,
  CLEAR: CLEAR,
  capture: capture,
  clear: clear
};
const INITIAL_STATE = {
  player: undefined
};

const camera$1 = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CAPTURE:
      return {
        player: action.payload
      };

    case CLEAR:
      return {
        player: undefined
      };

    default:
      return state;
  }
};

var camera$2 = {
  'default': camera$1
};
store.addReducers({
  camera: camera$1
});

class CameraCapture extends LitElement {
  static get styles() {
    // cover the whole screen
    return [SharedStyles, css` 
                #file-input {
                    display: none;
                }
            `];
  }

  render() {
    return html$2`
    
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css">
        <!-- <link rel="stylesheet" href="../../fonts/fontawesome/css/all.css"> -->
        <div class="image-upload">
          <form id="form" action="upload.propp" method="post" enctype="multipart/form-data">
              <label id="label" for="file-input" class="fa fa-camera fa-2x"></label>
              <input id="file-input" type="file" accept="image/*;capture=camera">
          </form>
        </div>        
    `;
  }

  firstUpdated() {
    if (window.IndexedDB) {
      console.log('IndexedDB is supported');
    }

    let fileInputElement = this.shadowRoot.getElementById("file-input");
    let formElement = this.shadowRoot.getElementById("form");

    fileInputElement.onchange = function () {
      formElement.submit();
    };
  }

}

window.customElements.define('camera-capture', CameraCapture);

class CameraViewer extends LitElement {
  static get styles() {
    return [SharedStyles, css`
        :host {
            width: 100vw;
            height: 100vh;  
        }
        canvas {
          width: 100%;
          height: 100%;
        }
      `];
  }

  render() {
    return html$2`
        
        <canvas id="canvas"></canvas>
        <button id="delete" @click="${this._clear}" title="Clear">Clear</button>
        
    `;
  }

  _clear() {
    store.dispatch(clear());
  }

  _showCapture(player) {
    const canvas = this.shadowRoot.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(player, 0, 0, canvas.width, canvas.height);
  }

  firstUpdated() {
    store.subscribe(() => {
      let state = store.getState();

      if (state.camera.player) {
        this._showCapture(state.camera.player);
      }
    });
  }

}

window.customElements.define('camera-viewer', CameraViewer);

class CameraElement extends LitElement {
  static get styles() {
    return [SharedStyles, css`
        host: {
          height: 100%;
          width: 100%;
        }

        [hidden] {
          display: none;
        }
      `];
  }

  render() {
    let state = store.getState();
    return html$2`
        <camera-viewer .hidden=${state.camera.player == undefined}></camera-viewer>  
        <camera-capture .hidden=${state.camera.player != undefined}></camera-capture>
      `;
  }

  firstUpdated() {
    store.subscribe(() => {
      this.requestUpdate();
    });
  }

}

window.customElements.define('camera-element', CameraElement);

class PerformanceIndicator extends LitElement {
  static get properties() {
    return {
      text: {
        type: String
      },
      value: {
        type: String
      }
    };
  }

  constructor() {
    // Always call super() first
    super();
    this.value = '-';
  }

  static get styles() {
    // cover the whole screen
    return [SharedStyles, css` 
            paper-button {
		    
                width: 85%;
                background: linear-gradient(90deg, var(--input-marker-color) 60%, var(--primary-background-color) 40%);
                text-align: center;
                font-weight: bold;
                @apply --tab-color;
            }
    
            paper-button > div.text {
                width: 60%;
                color:	black;
                text-align: center;
            }
            paper-button > div.value {
                width: 40%;
                text-align: center;
            }
    
            `];
  }

  render() {
    return html$2`
        <paper-button raised>
            <div class="text">${this.text}</div>
            <div class="value">${this.value}</div>
        </paper-button>
        `;
  }

}

window.customElements.define('performance-indicator', PerformanceIndicator);

class MyView1 extends PageViewElement {
  static get styles() {
    return [SharedStyles];
  }

  constructor() {
    super();
    this.startPageData = {};
  }

  static get properties() {
    return {
      startPageData: {
        type: Object
      }
    };
  }

  render() {
    return html$2`
    <button @click="${this._login}">logga in</button>
    <button  @click="${this._getPerf}">getperf</button>
    <performance-indicator text="Leverantörsskulder" value="${this.startPageData.accountsPayable}"></performance-indicator>
    `;
  }

  _login() {
    let formData = new FormData();
    formData.append('username', 'magnusson@msoft.se');
    formData.append('password', 'johanm');
    fetch("https://app.firmadm.local/api/user/perform-login", {
      body: formData,
      method: 'POST',
      // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',
      // no-cors, *cors, same-origin
      credentials: 'include'
    }).then(res => {
      console.log("ok " + res);
    }).catch(res => console.log("NOT OK " + res));
  }

  _getPerf() {
    let that = this;
    fetch("https://app.firmadm.local/api/start-page/", {
      mode: 'cors',
      // no-cors, *cors, same-origin
      credentials: 'include' // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached

    }).then(res => {
      console.log("ok " + res);
      res.json().then(data => {
        that.startPageData = data;
        that.requestUpdate();
      });
    }).catch(res => console.log("NOT OK " + res));
  }

}

window.customElements.define('my-view1', MyView1);
export { camera as $camera, camera$2 as $camera$1, camera$1 as $cameraDefault, ironA11yKeysBehavior as $ironA11yKeysBehavior, ironButtonState as $ironButtonState, ironControlState as $ironControlState, paperButtonBehavior as $paperButtonBehavior, paperRippleBehavior as $paperRippleBehavior, CAPTURE, CLEAR, IronA11yKeysBehavior, IronButtonState, IronButtonStateImpl, IronControlState, PaperButtonBehavior, PaperButtonBehaviorImpl, PaperRippleBehavior, capture, clear };
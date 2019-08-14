import {
  LockStatus,
  UnlockWindowNoProtocolYet,
  UnlockWindow,
} from '../windowTypes'
import IframeHandler from './IframeHandler'
import { PostMessages } from '../messageTypes'
import { PaywallConfig } from '../unlockTypes'

interface hasPrototype {
  prototype?: any
}

export const IGNORE_CACHE = 'ignore'

/**
 * This class handles all of the messaging to the window object
 *
 * Specifically, sending the "unlockProtocol" event, creating the
 * "unlockProtocol" object on window, and also all of the showing
 * and hiding of checkout and account iframes
 */
export default class MainWindowHandler {
  private window: UnlockWindowNoProtocolYet
  private iframes: IframeHandler
  private showCheckoutWhenAccountsHides: boolean = false
  private showingCheckout: boolean = false
  private showingAccountsIframe: boolean = false
  private lockStatus: LockStatus = undefined
  private config: PaywallConfig

  constructor(
    window: UnlockWindowNoProtocolYet,
    iframes: IframeHandler,
    config: PaywallConfig
  ) {
    this.window = window
    this.iframes = iframes
    this.config = config
  }

  init() {
    // create window.unlockProtocol
    this.setupUnlockProtocolVariable()

    // this is a cache for the time between script startup and the full load
    // of the data iframe. The data iframe will then send down the current
    // value, overriding this. A bit later, the blockchain handler will update
    // with the actual value, so this is only used for a few milliseconds
    const locked = this.getCachedLockState()
    // note: locked can also be value IGNORE_CACHE in addition to true/false
    // IGNORE_CACHE is used to ignore the cache and not respond to it
    if (locked === true) {
      this.dispatchEvent('locked')
    }
    if (locked === false) {
      this.dispatchEvent('unlocked')
    }

    // respond to "unlocked" and "locked" events by
    // dispatching "unlockProtocol" on the main window
    // and
    this.iframes.data.on(PostMessages.LOCKED, () => {
      this.dispatchEvent('locked')
      this.setCachedLockedState(true)
      // Update the user-facing status with locked/unlocked updates
      this.lockStatus = 'locked'
    })
    this.iframes.data.on(PostMessages.UNLOCKED, () => {
      this.dispatchEvent('unlocked')
      this.setCachedLockedState(false)
      // Update the user-facing status with locked/unlocked updates
      this.lockStatus = 'unlocked'
    })

    // handle display of checkout and account UI
    this.iframes.checkout.on(PostMessages.DISMISS_CHECKOUT, () => {
      this.hideCheckoutIframe()
    })

    this.iframes.checkout.on(PostMessages.READY, () => {
      // TODO: "type" is going to be removed. Instead, we will respond to specific config directives
      // so this code will be removed
      if (this.config && this.config.type === 'paywall') {
        // show the checkout UI
        this.showCheckoutIframe()
      }
    })

    this.iframes.accounts.on(PostMessages.SHOW_ACCOUNTS_MODAL, () => {
      this.showAccountIframe()
    })

    this.iframes.accounts.on(PostMessages.HIDE_ACCOUNTS_MODAL, () => {
      this.hideAccountIframe()
    })
  }

  getCachedLockState() {
    try {
      const cache = this.window.localStorage.getItem('__unlockProtocol.locked')
      if (!cache) return IGNORE_CACHE
      if (cache !== 'true' && cache !== 'false') return IGNORE_CACHE

      return JSON.parse(cache)
    } catch (_) {
      return IGNORE_CACHE
    }
  }

  setCachedLockedState(newState: boolean) {
    try {
      // this is a fast cache. The value will only be used
      // to prevent a flash of ads on startup. If a cheeky
      // user attempts to prevent display of ads by setting
      // the localStorage cache, it will only work for a
      // few milliseconds
      this.window.localStorage.setItem(
        '__unlockProtocol.locked',
        JSON.stringify(newState)
      )
    } catch (e) {
      // ignore
    }
  }

  /**
   * Create window.unlockProtocol
   */
  setupUnlockProtocolVariable() {
    const loadCheckoutModal = () => {
      this.showCheckoutIframe()
    }
    const getState = () => this.lockStatus

    const unlockProtocol: hasPrototype = {}

    const immutable = {
      writable: false, // prevent changing loadCheckoutModal by simple `unlockProtocol.loadCheckoutModal = () => {}`
      configurable: false, // prevent re-defining the writable property
      enumerable: false, // prevent finding it exists via `for ... of`
    }

    Object.defineProperties(unlockProtocol, {
      loadCheckoutModal: {
        value: loadCheckoutModal,
        ...immutable,
      },
      getState: {
        value: getState,
        ...immutable,
      },
    })

    const freeze: (obj: any) => void = Object.freeze || Object

    // if freeze is available, prevents adding or
    // removing the object prototype properties
    // (value, get, set, enumerable, writable, configurable)
    freeze(unlockProtocol.prototype)
    freeze(unlockProtocol)

    // set up the unlockProtocol object on the main window
    // it will be 100% read-only, unchangeable and un-deleteable
    try {
      if (
        !(this.window as UnlockWindow).unlockProtocol ||
        (this.window as UnlockWindow).unlockProtocol.loadCheckoutModal !==
          loadCheckoutModal
      ) {
        Object.defineProperties(this.window, {
          unlockProtocol: {
            value: unlockProtocol,
            ...immutable,
          },
        })
      }
    } catch (e) {
      // TODO: decide whether to be more nuclear here
      // eslint-disable-next-line no-console
      console.error(
        'WARNING: unlockProtocol already defined, cannot re-define it'
      )
    }
  }

  /**
   * Dispatch the unlockProtocol event
   */
  dispatchEvent(detail: any) {
    let event
    try {
      event = new this.window.CustomEvent('unlockProtocol', { detail })
    } catch (e) {
      // older browsers do events this clunky way.
      // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events#The_old-fashioned_way
      // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/initCustomEvent#Parameters
      event = this.window.document.createEvent('customevent')
      event.initCustomEvent(
        'unlockProtocol',
        true /* canBubble */,
        true /* cancelable */,
        detail
      )
    }
    this.window.dispatchEvent(event)
  }

  /**
   * hide the checkout iframe
   */
  hideCheckoutIframe() {
    this.showCheckoutWhenAccountsHides = false
    this.showingCheckout = false
    this.iframes.checkout.hideIframe()
  }

  /**
   * show the checkout iframe, unless the account iframe is visible,
   * then mark it for showing when the account iframe is hidden
   */
  showCheckoutIframe() {
    if (this.showingAccountsIframe) {
      // if the accounts iframe is active, we will
      // wait to show the checkout iframe
      // until it is hidden
      this.showCheckoutWhenAccountsHides = true
      this.showingCheckout = false
    } else {
      // otherwise we will show the checkout iframe immediately
      this.showingCheckout = true
      this.showCheckoutWhenAccountsHides = false
      this.iframes.checkout.showIframe()
    }
  }

  /**
   * show the account iframe
   *
   * If the checkout iframe is visible, hide it and mark it for
   * showing after the account iframe hides
   */
  showAccountIframe() {
    if (this.showingCheckout) {
      // hide the checkout iframe, but mark it as needing
      // to be shown when the accounts iframe hides
      this.showCheckoutWhenAccountsHides = true
      this.showingCheckout = false
      this.iframes.checkout.hideIframe()
    }
    // note: if user accounts are disabled, this is a no-op
    this.showingAccountsIframe = true
    this.iframes.accounts.showIframe()
  }

  /**
   * hide the account iframe
   *
   * If the checkout iframe was visible, show it again
   */
  hideAccountIframe() {
    this.showingAccountsIframe = false
    // note: if user accounts are disabled, this is a no-op
    this.iframes.accounts.hideIframe()
    if (this.showCheckoutWhenAccountsHides) {
      // now that the accounts iframe is hidden, show the checkout iframe
      this.showingCheckout = true
      this.showCheckoutWhenAccountsHides = false
      this.iframes.checkout.showIframe()
    }
  }
}

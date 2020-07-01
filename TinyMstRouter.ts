import { History, Location } from 'history'
import { isEqual } from 'lodash'
import { reaction } from 'mobx'
import { types } from 'mobx-state-tree'

export type ILocation = Partial<Location<any>>

export const TinyMstRouter = types
  .model('TinyMstRouter', {
    location: types.optional(types.frozen<ILocation>(), {}),
    action: '',
  })
  .actions((self) => {
    let history: History

    return {
      _updateLocation(location: ILocation) {
        self.location = { ...location }
        self.action = history.action
      },
      _setHistory(initialHistory: History) {
        history = initialHistory
      },
      push(...args: Parameters<typeof history['push']>) {
        history.push(...args)
      },
      replace(...args: Parameters<typeof history['replace']>) {
        history.replace(...args)
      },
      go(...args: Parameters<typeof history['go']>) {
        history.go(...args)
      },
      goBack() {
        history.back()
      },
      goForward() {
        history.forward()
      },
      block(...args: Parameters<typeof history['block']>) {
        history.block(...args)
      },
    }
  })

/**
 * Sync the history object with the given mst router store
 *
 * @param history - 'History' instance to subscribe and sync to
 * @param store - Router store instance to sync with the history changes
 */
export function syncHistoryWithStore(
  history: History,
  store: typeof TinyMstRouter.Type,
) {
  store._setHistory(history)

  // Handle update from history object
  const handleLocationChange = (location: ILocation) => {
    if (!isEqual(store.location, location)) {
      store._updateLocation(location)
    }
  }

  const unsubscribeFromHistory = history.listen(({ location }) =>
    handleLocationChange(location),
  )

  const unsubscribeFromStoreLocation = reaction(
    () => store.location,
    (location) => {
      if (!isEqual(history.location, location)) {
        history.replace({ ...location })
      }
    },
  )

  handleLocationChange(history.location)

  function unsubscribe() {
    unsubscribeFromHistory()
    unsubscribeFromStoreLocation()
  }

  return {
    unsubscribe,
    unsubscribeFromHistory,
    unsubscribeFromStoreLocation,
    history,
  }
}

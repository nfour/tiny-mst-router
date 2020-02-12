import { History, Location } from 'history';
import { reaction } from 'mobx';
import { types } from 'mobx-state-tree';

export const TinyMstRouter = types
  .model('TinyMstRouter', {
    location: types.optional(types.frozen(), {}),
    action: '',
  })
  .actions((self) => {
    // "volatile" state to store history instance from "history" library
    let history: History;

    return {
      _updateLocation(location: typeof self['location']) {
        self.location = location;
        self.action = history.action;
      },
      _setHistory(initialHistory: History) {
        history = initialHistory;
      },
      push(...args: Parameters<typeof history['push']>) {
        history.push(...args);
      },
      replace(...args: Parameters<typeof history['replace']>) {
        history.replace(...args);
      },
      go(...args: Parameters<typeof history['go']>) {
        history.go(...args);
      },
      goBack() {
        history.goBack();
      },
      goForward() {
        history.goForward();
      },
      block(...args: Parameters<typeof history['block']>) {
        history.block(...args);
      },
    };
  });

/**
 * Sync the history object with the given mst router store
 *
 * @param history - 'History' instance to subscribe and sync to
 * @param routerStore - Router store instance to sync with the history changes
 */
export function syncHistoryWithStore(history: History, routerStore: typeof TinyMstRouter.Type) {
  routerStore._setHistory(history);

  function isLocationEqual(locationA: Location, locationB: Location) {
    return locationA && locationB && locationA.key && locationB.key && locationA.key === locationB.key;
  }

  // Handle update from history object
  const handleLocationChange = (location: Location) => {
    if (!isLocationEqual(routerStore.location, location)) {
      routerStore._updateLocation({ ...location });
    }
  };

  const unsubscribeFromHistory = history.listen(handleLocationChange);
  const unsubscribeFromStoreLocation = reaction(
    () => routerStore.location,
    (location) => {
      if (!isLocationEqual(history.location, location)) {
        history.replace({ ...location });
      }
    },
  );

  handleLocationChange(history.location);

  function unsubscribe() {
    unsubscribeFromHistory();
    unsubscribeFromStoreLocation();
  }

  return { unsubscribe, unsubscribeFromHistory, unsubscribeFromStoreLocation, history };
}

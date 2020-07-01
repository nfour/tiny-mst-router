# Tiny Mobx State Tree Router

It's only [one file](./TinyMstRouter.ts). Based on [/alisd23/mst-react-router](https://github.com/alisd23/mst-react-router)

## Usage

```ts
import { TinyMstRouter } from 'tiny-mst-router';

const router = TinyMstRouter.create({})

router.push('/myroute')

// or add it to your root model

export const RootModel = types.model({
  router: TinyMstRouter,
  // ...
})
```

## Install

- Dont forget the peer dependencies.
- Requires `history@5`

```json
"peerDependencies": {
  "mobx": ">=5",
  "mobx-state-tree": ">=3",
  "history": ">=5"
}
```

`yarn add tiny-mst-router mobx mobx-state-tree history@5`
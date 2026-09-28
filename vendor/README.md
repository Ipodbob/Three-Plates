# Barcode decoder

`zxing-browser-0.2.1.min.js` is the UMD browser bundle from the pinned npm package `@zxing/browser@0.2.1`. It is loaded on demand from this repository rather than a third-party CDN. The source-map directive is removed because the map is not shipped.

Upstream: https://github.com/zxing-js/browser

See the adjacent MIT license for the browser layer and Apache licenses for the decoder/text-encoding dependencies. Update the bundle and dependency lockfile together and rerun the real decoder regression before changing versions.

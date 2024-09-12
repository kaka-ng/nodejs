# @kakang/abstract-send

The code on this package is based on [`@fastify/send`](https://github.com/fastify/send)
and ported to TypeScript with some additional features.

Send is a library for streaming files from the file system as an HTTP response
supporting partial responses (Ranges), conditional-GET negotiation (If-Match,
If-Unmodified-Since, If-None-Match, If-Modified-Since), high test coverage,
and granular events which may be leveraged to take appropriate actions in your
application or framework.

## Installation

```bash
$ npm install @kakang/abstract-send
```

## API

```js
var send = require('@fastify/send')
```

### send(req, path, [options])

Provide `statusCode`, `headers` and `stream` for the given path to send to a
`res`. The `req` is the Node.js HTTP request and the `path `is a urlencoded path
to send (urlencoded, not the actual file-system path).

#### Options

##### acceptRanges

Enable or disable accepting ranged requests, defaults to true.
Disabling this will not send `Accept-Ranges` and ignore the contents
of the `Range` request header.

##### cacheControl

Enable or disable setting `Cache-Control` response header, defaults to
true. Disabling this will ignore the `immutable` and `maxAge` options.

##### dotfiles

Set how "dotfiles" are treated when encountered. A dotfile is a file
or directory that begins with a dot ("."). Note this check is done on
the path itself without checking if the path exists on the
disk. If `root` is specified, only the dotfiles above the root are
checked (i.e. the root itself can be within a dotfile when set
to "deny").

  - `'allow'` No special treatment for dotfiles.
  - `'deny'` Send a 403 for any request for a dotfile.
  - `'ignore'` Pretend like the dotfile does not exist and 404.

The default value is _similar_ to `'ignore'`, with the exception that
this default will not ignore the files within a directory that begins
with a dot, for backward-compatibility.

##### end

Byte offset at which the stream ends, defaults to the length of the file
minus 1. The end is inclusive in the stream, meaning `end: 3` will include
the 4th byte in the stream.

##### etag

Enable or disable etag generation, defaults to true.

##### extensions

If a given file doesn't exist, try appending one of the given extensions,
in the given order. By default, this is disabled (set to `false`). An
example value that will serve extension-less HTML files: `['html', 'htm']`.
This is skipped if the requested file already has an extension.

##### immutable

Enable or disable the `immutable` directive in the `Cache-Control` response
header, defaults to `false`. If set to `true`, the `maxAge` option should
also be specified to enable caching. The `immutable` directive will prevent
supported clients from making conditional requests during the life of the
`maxAge` option to check if the file has changed.

##### index

By default send supports "index.html" files, to disable this
set `false` or to supply a new index pass a string or an array
in preferred order.

##### lastModified

Enable or disable `Last-Modified` header, defaults to true. Uses the file
system's last modified value.

##### maxAge

Provide a max-age in milliseconds for HTTP caching, defaults to 0.
This can also be a string accepted by the
[ms](https://www.npmjs.org/package/ms#readme) module.

##### root

Serve files relative to `path`.

##### start

Byte offset at which the stream starts, defaults to 0. The start is inclusive,
meaning `start: 2` will include the 3rd byte in the stream.

### .mime

The `mime` export is a proxy of global instance
of the [`mime` npm module](https://www.npmjs.com/package/mime).
The methods is transformed to async, to resolve the ESM import
on CommonJS environment.

This is used to configure the MIME types that are associated with file extensions
as well as other options for how to resolve the MIME type of a file (like the
default type to use for an unknown file extension).

#### .mime.getType(path)

```js
import { mime } from '@kakang/abstract-send'
await mime.getType('package.json')
```

#### .mime.getExtension(type)

```js
import { mime } from '@kakang/abstract-send'
await mime.getExtension('application/json')
```

#### .mime.getAllExtensions(type)

```js
import { mime } from '@kakang/abstract-send'
await mime.getAllExtensions('application/json')
```

#### .mime.define(typeMap, force)

```js
import { mime } from '@kakang/abstract-send'
await mime.define({
  'app/new-extension': ['.app']
}, false)
```

#### .mime.default_type

It is the default type used by this package when
`mime` cannot resolve a proper type.

## License

[MIT](LICENSE)

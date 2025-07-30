import { PhpCgiWorker } from "php-cgi-wasm/PhpCgiWorker";

const php = new PhpCgiWorker({
  prefix: "/",
  docroot: "/persist/www",
  types: {
    php: "application/x-httpd-php"
  }
});

self.addEventListener("install", event => php.handleInstallEvent(event));
self.addEventListener("activate", event => php.handleActivateEvent(event));
self.addEventListener("fetch", event => php.handleFetchEvent(event));

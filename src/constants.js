export const Directives = {
  public: "public",
  private: "private",
  "no-cache": "no-cache",
  "no-store": "no-store",
  "max-age": "max-age",
  "s-maxage": "s-maxage",
  "only-if-cached": "only-if-cached",
  "max-stale": "max-stale",
  "min-fresh": "min-fresh",
  "stale-while-revalidate": "stale-while-revalidate",
  "stale-if-error": "stale-if-error",
  "must-revalidate": "must-revalidate",
  "proxy-revalidate": "proxy-revalidate",
  immutable: "immutable",
  "no-transform": "no-transform"
};

export const DirectiveDescriptions = {
  [Directives.public]:
    "Indicates that the response may be cached by any cache, even if the response would normally be non-cacheable (e.g. if the response does not contain a max-age directive or the Expires header).",
  [Directives.private]:
    "Indicates that the response is intended for a single user and must not be stored by a shared cache. A private cache may store the response.",
  [Directives["max-age"]]:
    "Specifies the maximum amount of time a resource will be considered fresh. Contrary to Expires, this directive is relative to the time of the request.",
  [Directives["s-maxage"]]:
    "Takes precedence over max-age or the Expires header, but it only applies to shared caches (e.g., proxies) and is ignored by a private cache.",
  [Directives["no-store"]]:
    "The cache should not store anything about the client request or server response.",
  [Directives["no-cache"]]:
    "Forces caches to submit the request to the origin server for validation before releasing a cached copy.",
  [Directives["only-if-cached"]]:
    "Indicates to not retrieve new data. This being the case, the server wishes the client to obtain a response only once and then cache. From this moment the client should keep releasing a cached copy and avoid contacting the origin-server to see if a newer copy exists.",
  [Directives["must-revalidate"]]:
    "Indicates that once a resource has become stale (e.g. max-age has expired), a cache must not use the response to satisfy subsequent requests for this resource without successful validation on the origin server.",
  [Directives["proxy-revalidate"]]:
    "Same as must-revalidate, but it only applies to shared caches (e.g., proxies) and is ignored by a private cache.",
  [Directives["immutable"]]:
    "Indicates that the response body will not change over time. The resource, if unexpired, is unchanged on the server and therefore the client should not send a conditional revalidation for it (e.g. If-None-Match or If-Modified-Since) to check for updates, even when the user explicitly refreshes the page.",
  [Directives["stale-while-revalidate"]]:
    "Indicates that the client is willing to accept a stale response while asynchronously checking in the background for a fresh one. The seconds value indicates for how long the client is willing to accept a stale response.",
  [Directives["stale-if-error"]]:
    "Indicates that the client is willing to accept a stale response if the check for a fresh one fails. The seconds value indicates for how long the client is willing to accept the stale response after the initial expiration.",
  [Directives["no-transform"]]:
    "No transformations or conversions should be made to the resource. The Content-Encoding, Content-Range, Content-Type headers must not be modified by a proxy. A non- transparent proxy might, for example, convert between image formats in order to save cache space or to reduce the amount of traffic on a slow link. The no-transform directive disallows this.",
  [Directives["min-fresh"]]:
    "Indicates that the client wants a response that will still be fresh for at least the specified number of seconds.",
  [Directives["max-stale"]]:
    "Indicates that the client is willing to accept a response that has exceeded its expiration time. Optionally, you can assign a value in seconds, indicating the time the response must not be expired by."
};

export const Times = {
  secs: "secs",
  hours: "hours",
  days: "days"
};

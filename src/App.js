/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Component } from "react";
import copyToClipboard from "clipboard-copy";

import "normalize.css/normalize.css";
import "./index.css";

const Directives = {
  public: "public",
  private: "private",
  "no-cache": "no-cache",
  "only-if-cached": "only-if-cached",
  "max-age": "max-age",
  "s-maxage": "s-maxage",
  "max-stale": "max-stale",
  "min-fresh": "min-fresh",
  "stale-while-revalidate": "stale-while-revalidate",
  "stale-if-error": "stale-if-error",
  "must-revalidate": "must-revalidate",
  "proxy-revalidate": "proxy-revalidate",
  immutable: "immutable",
  "no-store": "no-store",
  "no-transform": "no-transform"
};

const directivePriority = Object.keys(Directives);

const styles = {
  hide: hide => (hide ? { display: "none" } : {})
};

function Directive({ name, args = [] }) {
  return (
    <span className="HeaderDirective">
      {"  "}
      {name}
      {args.length ? " " + args.join(" ") : ""}
    </span>
  );
}

function Fieldset({ title, description, active, fields }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      <div>
        <p>{description}</p>
        <div>{fields(active)}</div>
      </div>
    </fieldset>
  );
}

export default class App extends Component {
  state = {
    directives: [
      // {
      //   name: Directives.public
      // },
      // {
      //   name: Directives["max-age"],
      //   args: [60 * 60 * 24]
      // }
    ]
  };

  setDirectives(directives) {
    directives = directives.sort((a, b) => {
      return (
        directivePriority.indexOf(a.name) - directivePriority.indexOf(b.name)
      );
    });
    this.setState({ directives });
  }

  hasDirective(directive) {
    return this.state.directives.find(d => d.name === directive);
  }

  directiveArg(name, argIdx) {
    const directive = this.state.directives.find(d => d.name === name);
    if (!directive) {
      return null;
    }
    return directive.args && directive.args[argIdx];
  }

  copyToClipboard() {
    const { directives } = this.state;
    copyToClipboard(
      "Cache-Control: " +
        directives.reduce((str, d, i) => {
          return (
            str +
            d.name +
            (d.args && d.args.length ? " " + d.args.join(" ") : "") +
            (directives.length > 1 && i !== directives.length - 1 ? ", " : "")
          );
        }, "")
    );
  }

  render() {
    return (
      <div className="App">
        <header className="Header">
          <h1 className="Header__heading">Cache-Control Header Builder</h1>
        </header>
        <main className="Main">
          <form action="#" className="Config">
            <Fieldset
              title={Directives.public}
              description={
                <p>
                  Indicates that the response may be cached by any cache, even
                  if the response would normally be non-cacheable (e.g. if the
                  response does not contain a max-age directive or the Expires
                  header).
                </p>
              }
              active={this.hasDirective(Directives.public)}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives.public}
                    type="checkbox"
                    checked={active}
                    onChange={() => {
                      let directives = this.state.directives;
                      if (active) {
                        directives = directives.filter(
                          d => d.name !== Directives.public
                        );
                      } else {
                        directives = directives.filter(
                          d => d.name !== Directives.private
                        );
                        directives.push({ name: Directives.public });
                      }
                      this.setDirectives(directives);
                    }}
                  />
                  public
                </label>
              ]}
            />
            <Fieldset
              title={Directives.private}
              description={
                <p>
                  Indicates that the response is intended for a single user and
                  must not be stored by a shared cache. A private cache may
                  store the response.
                </p>
              }
              active={this.hasDirective(Directives.private)}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives.public}
                    type="checkbox"
                    checked={active}
                    onChange={() => {
                      let directives = this.state.directives;
                      if (active) {
                        directives = directives.filter(
                          d => d.name !== Directives.private
                        );
                      } else {
                        directives = directives.filter(
                          d => d.name !== Directives.public
                        );
                        directives.push({ name: Directives.private });
                      }
                      this.setDirectives(directives);
                    }}
                  />
                  private
                </label>
              ]}
            />
            <Fieldset
              title={Directives["max-age"]}
              description={
                <p>
                  Specifies the maximum amount of time a resource will be
                  considered fresh. Contrary to Expires, this directive is
                  relative to the time of the request.
                </p>
              }
              active={this.hasDirective(Directives["max-age"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["max-age"]}
                    type="checkbox"
                    checked={active}
                    onChange={() => {
                      let directives = this.state.directives;
                      if (active) {
                        directives = directives.filter(
                          d => d.name !== Directives["max-age"]
                        );
                      } else {
                        directives.push({
                          name: Directives["max-age"],
                          args: [60 * 60 * 24]
                        });
                      }
                      this.setDirectives(directives);
                    }}
                  />
                  max-age
                </label>,
                <label key={1} style={styles.hide(!active)}>
                  <br />
                  <input
                    name={Directives["max-age"] + "_arg1"}
                    type="number"
                    min={0}
                    step={60}
                    value={this.directiveArg(Directives["max-age"], 0)}
                    onChange={evt => {
                      if (!active) {
                        return;
                      }
                      const directives = this.state.directives;
                      const directive = directives.find(
                        d => d.name === Directives["max-age"]
                      );
                      directive.args[0] = evt.target.value;
                      this.setDirectives(directives);
                    }}
                  />
                </label>
              ]}
            />
            <Fieldset
              title={Directives["s-maxage"]}
              description={
                <p>
                  Takes precedence over max-age or the Expires header, but it
                  only applies to shared caches (e.g., proxies) and is ignored
                  by a private cache.
                </p>
              }
              active={this.hasDirective(Directives["s-maxage"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["s-maxage"]}
                    type="checkbox"
                    checked={active}
                    onChange={() => {
                      let directives = this.state.directives;
                      if (active) {
                        directives = directives.filter(
                          d => d.name !== Directives["s-maxage"]
                        );
                      } else {
                        directives.push({
                          name: Directives["s-maxage"],
                          args: [60 * 60 * 24]
                        });
                      }
                      this.setDirectives(directives);
                    }}
                  />
                  s-maxage
                </label>,
                <label key={1} style={styles.hide(!active)}>
                  <br />
                  <input
                    name={Directives["s-maxage"] + "_arg1"}
                    type="number"
                    min={0}
                    step={60}
                    value={this.directiveArg(Directives["s-maxage"], 0)}
                    onChange={evt => {
                      if (!active) {
                        return;
                      }
                      const directives = this.state.directives;
                      const directive = directives.find(
                        d => d.name === Directives["s-maxage"]
                      );
                      directive.args[0] = evt.target.value;
                      this.setDirectives(directives);
                    }}
                  />
                </label>
              ]}
            />
            <fieldset>
              <legend>no-store</legend>
              <div>
                <p>
                  The cache should not store anything about the client request
                  or server response.
                </p>
              </div>
            </fieldset>
            <fieldset>
              <legend>no-cache</legend>
              <div>
                <p>
                  Forces caches to submit the request to the origin server for
                  validation before releasing a cached copy.
                </p>
              </div>
            </fieldset>
            <fieldset>
              <legend>only-if-cached</legend>
              <div>
                <p>
                  Indicates to not retrieve new data. This being the case, the
                  server wishes the client to obtain a response only once and
                  then cache. From this moment the client should keep releasing
                  a cached copy and avoid contacting the origin-server to see if
                  a newer copy exists.
                </p>
              </div>
            </fieldset>
            <fieldset>
              <legend>must-revalidate</legend>
              <div>
                <p>
                  Where no-cache will immediately revalidate with the server,
                  and only use a cached copy if the server says it may,
                  must-revalidate is like no-cache with a grace period.
                </p>
                <p>
                  must-revalidate needs an associated max-age directive; above,
                  we’ve set it to ten minutes.
                </p>
              </div>
            </fieldset>
            <fieldset>
              <legend>proxy-revalidate</legend>
              <div>
                <p>
                  In a similar vein to s-maxage, proxy-revalidate is the
                  public-cache specific version of must-revalidate. It is simply
                  ignored by private caches.
                </p>
              </div>
            </fieldset>
            <fieldset>
              <legend>immutable</legend>
              <div>
                <p>
                  immutable is a way of telling the browser that a file will
                  never change—it’s immutable—and therefore never to bother
                  revalidating it. We can completely cut out the overhead of a
                  roundtrip of latency.
                </p>
              </div>
            </fieldset>
            <fieldset>
              <legend>stale-while-revalidate</legend>
              <div>
                <p>
                  Indicates that the client is willing to accept a stale
                  response while asynchronously checking in the background for a
                  fresh one. The seconds value indicates for how long the client
                  is willing to accept a stale response.
                </p>
              </div>
            </fieldset>
          </form>
          <div className="Result" onClick={() => this.copyToClipboard()}>
            <pre className="Result__header">
              Cache-Control:{`\n`}
              {this.state.directives.map(directive => {
                return <Directive key={directive.name} {...directive} />;
              })}
              {!this.state.directives.length ? (
                <span className="Result__placeholder">
                  {"  "}// configure directives
                  <br />
                  {"  "}// using the panel
                  <br />
                  {"  "}// on the left
                </span>
              ) : null}
            </pre>
          </div>
        </main>
        <footer className="Footer">
          <div className="Footer__resources">
            <span>Resources:</span>
            <span>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control"
              >
                Cache-Control on MDN
              </a>
              ,
            </span>
            <span>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://csswizardry.com/2019/03/cache-control-for-civilians/"
              >
                Cache-Control for Civilians
              </a>
            </span>
          </div>
          <div className="Footer__credit">
            created by <a href="https://github.com/sdgluck">sdgluck</a>
          </div>
        </footer>
      </div>
    );
  }
}

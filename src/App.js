/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Component, useState } from "react";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import copyToClipboard from "clipboard-copy";
import SyntaxHighlighter from "react-syntax-highlighter";

import libraryCode from "./lib-code";
import { readInDirectives, createHeaderArg } from "./util";

import "normalize.css/normalize.css";
import "./index.css";

const Directives = {
  public: "public",
  private: "private",
  "max-age": "max-age",
  "s-maxage": "s-maxage",
  "no-cache": "no-cache",
  "only-if-cached": "only-if-cached",
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

const directivePriorities = Object.keys(Directives);

let initialOpenDirectives = window.location.search.includes("s=")
  ? readInDirectives().map(d => d.name)
  : directivePriorities.slice(0, 4);

if (!initialOpenDirectives.length) {
  initialOpenDirectives = directivePriorities.slice(0, 4);
}

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

function Fieldset({ title, description, active, fields = () => {} }) {
  const [open, setOpen] = useState(initialOpenDirectives.includes(title));

  return (
    <div className="Fieldset">
      <div className="Fieldset__header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="Fieldset__header-open-icon">{open ? "–" : "+"}</span>
      </div>
      <div className="Fieldset__body" style={styles.hide(!open)}>
        <div className="Fieldset__description">{description}</div>
        <div className="Fieldset__fields">{fields(active)}</div>
      </div>
    </div>
  );
}

export default class App extends Component {
  state = {
    showLibraryCode: true,
    codeLibrary: "express",
    directives: readInDirectives()
  };

  setDirectives(directives) {
    this.setState({
      directives: directives.sort((a, b) => {
        return (
          directivePriorities.indexOf(a.name) -
          directivePriorities.indexOf(b.name)
        );
      })
    });
  }

  hasDirective(directive) {
    return this.state.directives.find(d => d.name === directive);
  }

  toggleDirective(name, args = [], disables = []) {
    const active = this.hasDirective(name);
    let directives = this.state.directives;
    if (active) {
      directives = directives.filter(d => d.name !== name);
    } else {
      directives = directives.filter(d => !disables.includes(d.name));
      directives.push({ name, args });
    }
    this.setDirectives(directives);
  }

  updateDirecteArg(evt, name, argIdx) {
    const active = this.hasDirective(name);
    if (!active) {
      return;
    }
    const directives = this.state.directives;
    const directive = directives.find(d => d.name === name);
    directive.args[argIdx] = evt.target.value;
    this.setDirectives(directives);
  }

  getDirectiveArg(name, argIdx) {
    const directive = this.state.directives.find(d => d.name === name);
    if (!directive) {
      return null;
    }
    return (directive.args && directive.args[argIdx]) || "";
  }

  copyToClipboard() {
    copyToClipboard("Cache-Control: " + createHeaderArg(this.state.directives));
  }

  render() {
    const domain = window.location.protocol + "//" + window.location.host;
    const shareUrl = `${domain}?s=${btoa(
      JSON.stringify(this.state.directives)
    )}`;

    return (
      <div className="App">
        <header className="Header">
          <div>
            <h1 className="Header__heading">Cache-Control Header Builder</h1>
          </div>
          <ul className="Menu">
            <li className="Menu__item">
              <a
                title="Copy a shareable link for this header configuration"
                href={shareUrl}
                onClick={evt => {
                  evt.preventDefault();
                  copyToClipboard(shareUrl);
                }}
              >
                Share
              </a>
            </li>
            <li className="Menu__item">
              <button
                className="Anchor"
                title="Copy the header text to your clipboard"
                onClick={() => this.copyToClipboard()}
              >
                Copy
              </button>
            </li>
          </ul>
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
                    onChange={() =>
                      this.toggleDirective(
                        Directives.public,
                        [],
                        [Directives.private]
                      )
                    }
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
                    onChange={() =>
                      this.toggleDirective(
                        Directives.private,
                        [],
                        [Directives.public]
                      )
                    }
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
                    onChange={() =>
                      this.toggleDirective(Directives["max-age"], [
                        60 * 60 * 24
                      ])
                    }
                  />
                  max-age
                </label>,
                <label key={1} style={styles.hide(!active)}>
                  <br />
                  <input
                    name={Directives["max-age"] + "_arg0"}
                    type="number"
                    min={0}
                    step={60}
                    value={this.getDirectiveArg(Directives["max-age"], 0)}
                    onChange={evt =>
                      this.updateDirecteArg(evt, Directives["max-age"], 0)
                    }
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
                    onChange={() =>
                      this.toggleDirective(Directives["s-maxage"], [
                        60 * 60 * 24
                      ])
                    }
                  />
                  s-maxage
                </label>,
                <label key={1} style={styles.hide(!active)}>
                  <br />
                  <input
                    name={Directives["s-maxage"] + "_arg0"}
                    type="number"
                    min={0}
                    step={60}
                    value={this.getDirectiveArg(Directives["s-maxage"], 0)}
                    onChange={evt =>
                      this.updateDirecteArg(evt, Directives["s-maxage"], 0)
                    }
                  />
                </label>
              ]}
            />
            <Fieldset
              title={Directives["no-store"]}
              description={
                <p>
                  The cache should not store anything about the client request
                  or server response.
                </p>
              }
              active={this.hasDirective(Directives["no-store"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["no-store"]}
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      this.toggleDirective(Directives["no-store"])
                    }
                  />
                  no-store
                </label>
              ]}
            />
            <Fieldset
              title={Directives["no-cache"]}
              description={
                <p>
                  Forces caches to submit the request to the origin server for
                  validation before releasing a cached copy.
                </p>
              }
              active={this.hasDirective(Directives["no-cache"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["no-cache"]}
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      this.toggleDirective(Directives["no-cache"])
                    }
                  />
                  no-cache
                </label>
              ]}
            />
            <Fieldset
              title={Directives["only-if-cached"]}
              description={
                <p>
                  Indicates to not retrieve new data. This being the case, the
                  server wishes the client to obtain a response only once and
                  then cache. From this moment the client should keep releasing
                  a cached copy and avoid contacting the origin-server to see if
                  a newer copy exists.
                </p>
              }
              active={this.hasDirective(Directives["only-if-cached"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["only-if-cached"]}
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      this.toggleDirective(Directives["only-if-cached"])
                    }
                  />
                  only-if-cached
                </label>
              ]}
            />
            <Fieldset
              title={Directives["must-revalidate"]}
              description={
                <>
                  <p>
                    Where no-cache will immediately revalidate with the server,
                    and only use a cached copy if the server says it may,
                    must-revalidate is like no-cache with a grace period.
                  </p>
                  <p>
                    must-revalidate needs an associated max-age directive;
                    above, we’ve set it to ten minutes.
                  </p>
                </>
              }
              active={this.hasDirective(Directives["must-revalidate"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["must-revalidate"]}
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      this.toggleDirective(Directives["must-revalidate"])
                    }
                  />
                  must-revalidate
                </label>
              ]}
            />
            <Fieldset
              title={Directives["proxy-revalidate"]}
              description={
                <p>
                  In a similar vein to s-maxage, proxy-revalidate is the
                  public-cache specific version of must-revalidate. It is simply
                  ignored by private caches.
                </p>
              }
              active={this.hasDirective(Directives["proxy-revalidate"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["proxy-revalidate"]}
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      this.toggleDirective(Directives["proxy-revalidate"])
                    }
                  />
                  proxy-revalidate
                </label>
              ]}
            />
            <Fieldset
              title={Directives["immutable"]}
              description={
                <p>
                  immutable is a way of telling the browser that a file will
                  never change—it’s immutable—and therefore never to bother
                  revalidating it. We can completely cut out the overhead of a
                  roundtrip of latency.
                </p>
              }
              active={this.hasDirective(Directives["immutable"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["immutable"]}
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      this.toggleDirective(Directives["immutable"])
                    }
                  />
                  immutable
                </label>
              ]}
            />
            <Fieldset
              title={Directives["stale-while-revalidate"]}
              description={
                <p>
                  Indicates that the client is willing to accept a stale
                  response while asynchronously checking in the background for a
                  fresh one. The seconds value indicates for how long the client
                  is willing to accept a stale response.
                </p>
              }
              active={this.hasDirective(Directives["stale-while-revalidate"])}
              fields={active => [
                <label key={0}>
                  <input
                    name={Directives["stale-while-revalidate"]}
                    type="checkbox"
                    checked={active}
                    onChange={() =>
                      this.toggleDirective(Directives["stale-while-revalidate"])
                    }
                  />
                  stale-while-revalidate
                </label>
              ]}
            />
          </form>
          <div className="Result" onClick={() => this.copyToClipboard()}>
            <div className="ResultHeader">
              <pre className="ResultHeader__header">
                Cache-Control:{`\n`}
                {this.state.directives.map(directive => {
                  return <Directive key={directive.name} {...directive} />;
                })}
                {!this.state.directives.length ? (
                  <span className="ResultHeader__placeholder">
                    {"  "}// configure directives
                    <br />
                    {"  "}// using the panel
                    <br />
                    {"  "}// on the left
                  </span>
                ) : null}
              </pre>
            </div>
            <div className="ResultCode">
              <div className="ResultCode__header">
                <div
                  className="ResultCode__header-toggle"
                  onClick={() =>
                    this.setState({
                      showLibraryCode: !this.state.showLibraryCode
                    })
                  }
                >
                  Router Library Code{" "}
                  <span>({this.state.showLibraryCode ? "hide" : "show"})</span>
                </div>
                <div>
                  <select
                    className="ResultCode__header-select"
                    value={this.state.codeLibrary}
                    onChange={evt => {
                      evt.preventDefault();
                      this.setState({
                        showLibraryCode: true,
                        codeLibrary: evt.target.value
                      });
                    }}
                  >
                    {Object.keys(libraryCode).map(lib => {
                      return <option key={lib}>{lib}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div style={styles.hide(!this.state.showLibraryCode)}>
                <SyntaxHighlighter
                  showLineNumbers
                  lineNumberStyle={{ color: "lightgrey" }}
                  className="ResultCode__code"
                  language="javascript"
                  style={docco}
                >
                  {libraryCode[this.state.codeLibrary](
                    createHeaderArg(this.state.directives)
                  )}
                </SyntaxHighlighter>
              </div>
            </div>
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
            created by{" "}
            <a
              href="https://github.com/sdgluck"
              target="_blank"
              rel="noopener noreferrer"
            >
              sdgluck
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

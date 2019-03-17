/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Component, useState } from "react";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import copyToClipboard from "clipboard-copy";
import SyntaxHighlighter from "react-syntax-highlighter";

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

const initialOpenDirectives = directivePriorities.slice(0, 4);

const styles = {
  hide: hide => (hide ? { display: "none" } : {})
};

function readInDirectives() {
  const parts = window.location.search.replace(/^\?/, "").split("&");
  const params = parts.reduce((params, part) => {
    const [key, val] = part.split("=");
    return { ...params, [key]: val };
  }, {});
  try {
    return params.s ? JSON.parse(atob(params.s)) : [];
  } catch (err) {
    return [];
  }
}

const libraryCode = {
  express: directives => {
    let setHeaderCode = "res.set('Cache-Control', '";
    for (let i = 0; i < directives.length; i++) {
      const directive = directives[i];
      setHeaderCode +=
        directive.name +
        (directive.args && directive.args.length
          ? " " + directive.args.join(" ")
          : "");
      if (directives.length > 1 && i !== directives.length - 1) {
        setHeaderCode += ", ";
      }
    }
    setHeaderCode += "');";
    let code = "// for all responses\n";
    code += "app.use((req, res, next) => {\n";
    code += "  " + setHeaderCode + "\n";
    code += "  next();\n";
    code += "});\n\n";
    code += "// for single response\n";
    code += setHeaderCode;
    return code;
  },
  koa: directives => {
    return "";
  }
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

  getDirectiveArg(name, argIdx) {
    const directive = this.state.directives.find(d => d.name === name);
    if (!directive) {
      return null;
    }
    return (directive.args && directive.args[argIdx]) || "";
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
    const shareUrl = `https://cache-control.now.sh?s=${btoa(
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
              <a
                title="Copy the header text to your clipboard"
                href="#"
                onClick={evt => {
                  evt.preventDefault();
                  this.copyToClipboard();
                }}
              >
                Copy
              </a>
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
                    value={this.getDirectiveArg(Directives["max-age"], 0)}
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
                    value={this.getDirectiveArg(Directives["s-maxage"], 0)}
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
                    onChange={() => {
                      let directives = this.state.directives;
                      if (active) {
                        directives = directives.filter(
                          d => d.name !== Directives["no-store"]
                        );
                      } else {
                        directives.push({
                          name: Directives["no-store"]
                        });
                      }
                      this.setDirectives(directives);
                    }}
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
                  Library Code{" "}
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
                  {libraryCode[this.state.codeLibrary](this.state.directives)}
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

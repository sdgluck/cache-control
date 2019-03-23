/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState } from "react";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import copyToClipboard from "clipboard-copy";
import SyntaxHighlighter from "react-syntax-highlighter";

import { libraryCode, libraryComment, libraryLanguage } from "./lib-code";
import { Times, Directives, DirectiveDescriptions } from "./constants";
import { styles, readInDirectives, createHeaderArg } from "./util";

import "normalize.css/normalize.css";
import "./index.css";

const directivePriorities = Object.keys(Directives);

let initialOpenDirectives = window.location.search.includes("s=")
  ? readInDirectives().map(d => d.name)
  : directivePriorities.slice(0, 4);

if (!initialOpenDirectives.length) {
  initialOpenDirectives = directivePriorities.slice(0, 4);
}

function Fieldset({
  title,
  api,
  timeFields = false,
  enables = [],
  disables = []
}) {
  const [open, setOpen] = useState(initialOpenDirectives.includes(title));

  return (
    <div className="Fieldset">
      <div
        className="Fieldset__header"
        onClick={() => setOpen(!open)}
        title={`Click to ${
          open ? "hide" : "show"
        } "${title}" directive options`}
      >
        <span>{title}</span>
        <span className="Fieldset__header-open-icon">{open ? "–" : "+"}</span>
      </div>
      <div className="Fieldset__body" style={styles.hide(!open)}>
        <div className="Fieldset__description">
          <p>{DirectiveDescriptions[title]}</p>
          {enables.length ? (
            <p>
              <strong>Requires</strong>: {enables.map(d => d.name).join(", ")}
            </p>
          ) : null}
          {disables.length ? (
            <p>
              <strong>Cannot be used with</strong>: {disables.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="Fieldset__fields">
          <label key={0}>
            <input
              name={title}
              type="checkbox"
              checked={api.hasDirective(title)}
              onChange={() =>
                api.toggleDirective(
                  title,
                  timeFields ? 86400 : null,
                  disables,
                  enables
                )
              }
            />
            {title}
          </label>
          {timeFields ? (
            <TimeInput
              key={1}
              active={api.hasDirective(title)}
              name={title + "_time"}
              value={api.getDirectiveArg(title) || 0}
              onArgChange={evt => api.updateDirectiveArg(evt, title)}
              onTimeChange={evt => api.updateDirectiveTime(evt, title)}
              time={api.getDirectiveTime(title)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Directive({ directive }) {
  let arg = directive.arg;
  if (arg !== null) {
    if (directive.time === Times.days) {
      arg *= 86400;
    } else if (directive.time === Times.hours) {
      arg *= 3600;
    }
  }
  arg = arg !== null ? " " + arg.toString() : "";
  return `  ${directive.name}${directive.arg !== null ? arg : ""}`;
}

function TimeInput({ name, value, time, onArgChange, onTimeChange, active }) {
  let step = 60;

  if (time !== Times.secs) {
    step = 1;
  }

  return (
    <div className="NumberRadioInput" key={1} style={styles.hide(!active)}>
      <label>
        <br />
        <input
          name={name + "_arg"}
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={onArgChange}
        />
      </label>
      <label className="NumberRadio__radio--first">
        <input
          className="Radio"
          name={name + "_time"}
          type="radio"
          value={Times.secs}
          onChange={onTimeChange}
          checked={time === Times.secs}
        />
        <span>secs</span>
      </label>
      <label>
        <input
          className="Radio"
          name={name + "_time"}
          type="radio"
          value={Times.hours}
          onChange={onTimeChange}
          checked={time === Times.hours}
        />
        <span>hours</span>
      </label>
      <label className="NumberRadio__radio--last">
        <input
          className="Radio"
          name={name + "_time"}
          type="radio"
          value={Times.days}
          onChange={onTimeChange}
          checked={time === Times.days}
        />
        <span>days</span>
      </label>
    </div>
  );
}

export default class App extends React.Component {
  state = {
    showLibraryCode: true,
    codeLibrary: "express",
    directives: [],
    popupMessage: null
  };

  componentDidMount() {
    this.setState({
      directives: readInDirectives({
        onError: () => {
          this.showPopup("Bad share url :(");
        }
      })
    });
  }

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
    return !!this.state.directives.find(d => d.name === directive);
  }

  toggleDirective(name, arg = null, disables = [], enables = []) {
    const active = this.hasDirective(name);
    let directives = this.state.directives;
    if (active) {
      directives = directives.filter(d => d.name !== name);
    } else {
      directives = directives.filter(d => !disables.includes(d.name));
      directives.push({ name, arg, time: Times.secs });
      if (enables.length) {
        enables.forEach(d => {
          if (!this.hasDirective(d.name)) {
            directives.push(d);
          }
        });
      }
    }
    this.setDirectives(directives);
  }

  updateDirectiveArg(evt, name) {
    const active = this.hasDirective(name);
    if (!active) {
      return;
    }

    const directives = this.state.directives;
    const directive = directives.find(d => d.name === name);
    directive.arg = evt.target.value;
    this.setDirectives(directives);
  }

  updateDirectiveTime(evt, name) {
    const active = this.hasDirective(name);
    if (!active) {
      return;
    }

    const directives = this.state.directives;
    const directive = directives.find(d => d.name === name);
    const newTime = evt.target.value;
    const oldTime = directive.time;
    const oldTimeArg = directive.arg;
    let timeArg = oldTimeArg;

    if (oldTime === Times.secs) {
      if (newTime === Times.days) {
        timeArg = oldTimeArg / 86400;
      } else if (newTime === Times.hours) {
        timeArg = oldTimeArg / 3600;
      }
    } else if (oldTime === Times.hours) {
      if (newTime === Times.secs) {
        timeArg = oldTimeArg * 3600;
      } else if (newTime === Times.days) {
        timeArg = oldTimeArg / 24;
      }
    } else if (oldTime === Times.days) {
      if (newTime === Times.secs) {
        timeArg = oldTimeArg * 86400;
      } else if (newTime === Times.hours) {
        timeArg = oldTimeArg * 24;
      }
    }

    directive.time = newTime;
    directive.arg = Math.max(0, Math.round(timeArg));

    this.setDirectives(directives);
  }

  getDirectiveTime(name) {
    const directive = this.state.directives.find(d => d.name === name);
    if (!directive) {
      return false;
    }
    return directive.time;
  }

  getDirectiveArg(name) {
    const directive = this.state.directives.find(d => d.name === name);
    if (!directive) {
      return null;
    }
    return directive.arg || "";
  }

  copyToClipboard() {
    copyToClipboard(
      "Cache-Control: " +
        createHeaderArg(this.state.directives, false, false, "")
    );
  }

  showPopup(popupMessage) {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }
    this.setState({ popupMessage });
    this.popupTimeout = setTimeout(() => {
      this.setState({ popupMessage: null });
    }, 2000);
  }

  render() {
    const domain = window.location.protocol + "//" + window.location.host;
    const shareSearch = `?s=${btoa(JSON.stringify(this.state.directives))}`;
    const shareUrl = `${domain}${shareSearch}`;

    return (
      <div className="App">
        <div
          className={`Popup ${this.state.popupMessage ? "Popup--show" : ""}`}
        >
          {this.state.popupMessage}
        </div>
        <header className="Header">
          <div>
            <h1 className="Header__heading">Cache-Control Header Builder</h1>
          </div>
          <ul className="Menu">
            <li className="Menu__item">
              <a
                title="Copy a shareable link of the current header configuration to your clipboard"
                href={shareUrl}
                onClick={evt => {
                  evt.preventDefault();
                  copyToClipboard(shareUrl);
                  this.showPopup("Link copied to clipboard");
                }}
              >
                Share
              </a>
            </li>
            <li className="Menu__item">
              <button
                className="Anchor"
                title="Copy the current header text to your clipboard"
                onClick={() => {
                  this.copyToClipboard();
                  this.showPopup("Header copied to clipboard");
                }}
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
              api={this}
              disables={[Directives["private"]]}
            />
            <Fieldset
              title={Directives.private}
              api={this}
              disables={[Directives["public"]]}
            />
            <Fieldset title={Directives["no-cache"]} api={this} />
            <Fieldset title={Directives["no-store"]} api={this} />
            <Fieldset title={Directives["max-age"]} api={this} timeFields />
            <Fieldset title={Directives["s-maxage"]} api={this} timeFields />
            <Fieldset title={Directives["max-stale"]} api={this} timeFields />
            <Fieldset title={Directives["min-fresh"]} api={this} timeFields />
            <Fieldset
              title={Directives["stale-while-revalidate"]}
              api={this}
              timeFields
            />
            <Fieldset
              title={Directives["stale-if-error"]}
              api={this}
              timeFields
            />
            <Fieldset
              title={Directives["must-revalidate"]}
              api={this}
              enables={[
                {
                  name: Directives["max-age"],
                  arg: 60 * 60 * 24,
                  time: Times.secs
                }
              ]}
            />
            <Fieldset
              title={Directives["proxy-revalidate"]}
              api={this}
              enables={[
                {
                  name: Directives["max-age"],
                  arg: 60 * 60 * 24,
                  time: Times.secs
                }
              ]}
            />
            <Fieldset title={Directives["immutable"]} api={this} />
            <Fieldset title={Directives["no-transform"]} api={this} />
            <Fieldset title={Directives["only-if-cached"]} api={this} />
          </form>
          <div className="Result" onClick={() => this.copyToClipboard()}>
            <div className="ResultHeader">
              <pre className="ResultHeader__header">
                Cache-Control:{`\n`}
                {this.state.directives.length ? (
                  this.state.directives.map((d, i) => {
                    return (
                      <React.Fragment key={d.name}>
                        <Directive directive={d} />
                        {this.state.directives.length > 1 &&
                        i !== this.state.directives.length - 1
                          ? ",\n"
                          : ""}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <>
                    <span className="ResultHeader__placeholder ResultHeader__placeholder--desktop">
                      {"  "}// configure directives
                      <br />
                      {"  "}// using the panel
                      <br />
                      {"  "}// on the left
                    </span>
                    <span className="ResultHeader__placeholder ResultHeader__placeholder--mobile">
                      {"  "}// configure directives
                      <br />
                      {"  "}// using the panel below
                    </span>
                  </>
                )}
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
                  language={libraryLanguage(this.state.codeLibrary)}
                  style={docco}
                >
                  {libraryCode[this.state.codeLibrary](
                    createHeaderArg(
                      this.state.directives,
                      false,
                      true,
                      libraryComment(this.state.codeLibrary)
                    )
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
            <a
              className="github-button"
              href="https://github.com/sdgluck/cache-control"
              data-icon="octicon-star"
              aria-label="Star sdgluck/cache-control on GitHub"
            >
              Star
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

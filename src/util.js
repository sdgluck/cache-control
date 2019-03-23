import { Times } from "./constants";

export const styles = {
  hide: hide => (hide ? { display: "none" } : {})
};

export function createHeaderArg(
  directives,
  newlines = false,
  quotes = true,
  fallback = ""
) {
  let headerArg = "";
  for (let i = 0; i < directives.length; i++) {
    const directive = directives[i];
    let arg = directive.arg;
    if (arg !== null) {
      if (directive.time === Times.days) {
        arg *= 86400;
      } else if (directive.time === Times.hours) {
        arg *= 3600;
      }
    }
    headerArg += directive.name + (arg !== null ? " " + arg.toString() : "");
    if (directives.length > 1 && i !== directives.length - 1) {
      headerArg = headerArg + "," + (newlines ? "\n" : " ");
    }
  }
  return headerArg.length ? (quotes ? `'${headerArg}'` : headerArg) : fallback;
}

export function readInDirectives() {
  try {
    const parts = window.location.search.replace(/^\?/, "").split("&");
    const params = parts.reduce((params, part) => {
      const [key, val] = part.split("=");
      return { ...params, [key]: val };
    }, {});
    return params.s ? JSON.parse(atob(params.s)) : [];
  } catch (err) {
    return [];
  }
}

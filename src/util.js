export function createHeaderArg(directives) {
  let headerArg = "";
  for (let i = 0; i < directives.length; i++) {
    const directive = directives[i];
    headerArg +=
      directive.name +
      (directive.args && directive.args.length
        ? " " + directive.args.join(" ")
        : "");
    if (directives.length > 1 && i !== directives.length - 1) {
      headerArg += ", ";
    }
  }
  return headerArg;
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

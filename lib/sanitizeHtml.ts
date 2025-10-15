import sanitizeHtml from "sanitize-html"
export function sanitizeForRender(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "span",
      "strong",
      "em",
      "u",
      "s",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "br",
      "hr",
      "a",
      "img",
    ],
    allowedAttributes: {
      span: ["style"],
      code: ["class"],
      pre: ["class"],
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "title", "width", "height", "style"],
    },
    allowedStyles: {
      span: {
        color: [/^#[0-9a-f]{3,6}$/i, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/i],
      },
      img: {
        width: [/^\d+(px|%)$/],
        height: [/^\d+(px|%)$/],
        display: [/^block$/, /^inline-block$/, /^inline$/],
      },
    },
    nonTextTags: ["style", "script", "textarea", "option"],
    parser: {
      lowerCaseTags: true,
    },
  })
}

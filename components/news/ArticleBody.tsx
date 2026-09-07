import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import sanitizeHtml from "sanitize-html";

interface ArticleBodyProps {
  body: object | null;
}

export function ArticleBody({ body }: ArticleBodyProps) {
  if (!body) {
    return (
      <p className="text-sm text-white/40">Conteúdo não disponível.</p>
    );
  }

  let html = "";
  try {
    html = generateHTML(body as any, [StarterKit, Image]);
    html = sanitizeHtml(html, {
      allowedTags: [
        "p",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "strong",
        "em",
        "a",
        "img",
        "br",
        "blockquote",
        "code",
        "pre",
      ],
      allowedAttributes: {
        a: ["href", "target", "rel", "class"],
        img: ["src", "alt", "class"],
      },
      transformTags: {
        a: sanitizeHtml.simpleTransform("a", {
          rel: "noopener noreferrer",
          target: "_blank",
        }),
      },
    });
  } catch (err) {
    console.error("[ArticleBody] generateHTML failed", err);
    return <p className="text-sm text-white/40">Erro ao renderizar conteúdo.</p>;
  }

  return (
    <div
      className="prose-article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

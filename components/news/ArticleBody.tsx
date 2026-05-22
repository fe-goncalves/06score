import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import DOMPurify from "isomorphic-dompurify";

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
    html = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "h2", "h3", "ul", "ol", "li", "strong", "em", "a", "img", "br", "blockquote", "code", "pre"],
      ALLOWED_ATTR: ["href", "src", "alt", "target", "rel", "class"],
      // Garante que links externos abram com noopener para evitar tabnapping
      ADD_ATTR: ["target"],
      FORCE_BODY: false,
    });

    // Garante rel="noopener noreferrer" em todos os links externos
    html = html.replace(/<a\s/g, '<a rel="noopener noreferrer" ');
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

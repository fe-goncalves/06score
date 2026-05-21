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
    html = DOMPurify.sanitize(html);
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
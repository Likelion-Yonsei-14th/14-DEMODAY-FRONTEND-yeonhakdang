import type { PolicyArticle } from "@/lib/policies";

/** The articles of a 약관 / 정책; hook-free for the server pages and the app. */
export function PolicyArticles({ articles }: { articles: PolicyArticle[] }) {
  return articles.map((article) => (
    <section key={article.title} className="flex w-full flex-col gap-[4px]">
      <h3 className="font-bold text-body-m-14">{article.title}</h3>
      {article.body.map((text) => (
        <p key={text} className="text-caption-12 text-text-secondary">
          {text}
        </p>
      ))}
    </section>
  ));
}

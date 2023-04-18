import { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";
import { useState } from "react";

type PropsType = {
  ctx: RenderFieldExtensionCtx;
};

const BuildSlugButton = ({ ctx }: PropsType) => {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    console.log(ctx);
    setLoading(true);
    const response = await fetch("https://graphql.datocms.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Environment": "main-copy-julien",
        Accept: "application/json",
        Authorization: `Bearer ${
          ctx.plugin.attributes.parameters
            ? ctx.plugin.attributes.parameters.readAPIToken
            : ""
        }`,
        "X-Include-Drafts": "true",
      },
      body: JSON.stringify({
        query: `
          query {
            allDpages(locale: en, filter: { parent: { exists: true } }) {
              id
              title
              slug
              parent {
                id
                title
                slug
                parent {
                  id
                  title
                  slug
                  parent {
                    id
                    title
                    slug
                    parent {
                      id
                      title
                      slug
                    }
                  }
                }
              }
            }
          }
        `,
      }),
    });

    if (response.ok) {
      const { data } = await response.json();
      const { allDpages: pages } = data;
      const itemId = ctx.item ? ctx.item.id : null;
      let slugs = [];

      if (itemId) {
        let page = pages.find((p: any) => p.id === itemId);
        slugs.push(page.slug);
        while (page.parent) {
          page = page.parent;
          slugs.push(page.slug);
        }

        console.log(slugs);

        slugs.map((slug) => {
          return slug.toLowerCase().split(" ").join("-");
        });
        slugs.reverse();
        ctx.setFieldValue(ctx.fieldPath, slugs.join("/"));
      }
    }
    setLoading(false);
  };
  return (
    <Canvas ctx={ctx}>
      <button
        className="flex items-center text-gray-500 hover:text-gray-900 leading-6"
        type="button"
        onClick={handleClick}
      >
        {!loading && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M8.34 1.804A1 1 0 019.32 1h1.36a1 1 0 01.98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 011.262.125l.962.962a1 1 0 01.125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 01.804.98v1.361a1 1 0 01-.804.98l-1.473.295a6.95 6.95 0 01-.587 1.416l.834 1.25a1 1 0 01-.125 1.262l-.962.962a1 1 0 01-1.262.125l-1.25-.834a6.953 6.953 0 01-1.416.587l-.294 1.473a1 1 0 01-.98.804H9.32a1 1 0 01-.98-.804l-.295-1.473a6.957 6.957 0 01-1.416-.587l-1.25.834a1 1 0 01-1.262-.125l-.962-.962a1 1 0 01-.125-1.262l.834-1.25a6.957 6.957 0 01-.587-1.416l-1.473-.294A1 1 0 011 10.68V9.32a1 1 0 01.804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 01.125-1.262l.962-.962A1 1 0 015.38 3.03l1.25.834a6.957 6.957 0 011.416-.587l.294-1.473zM13 10a3 3 0 11-6 0 3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Build slug
          </>
        )}
        {loading && (
          <>
            <svg
              className="animate-spin mr-1 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Building...
          </>
        )}
      </button>
    </Canvas>
  );
};

export default SlugWithCollections;

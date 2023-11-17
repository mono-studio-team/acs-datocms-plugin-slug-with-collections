import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import { useEffect, useState } from 'react'

type PropsType = {
  ctx: RenderFieldExtensionCtx
}

type ErrorStateType = null | {
  code: number
  message: string
}

const BuildSlugButton = ({ ctx }: PropsType) => {
  const [fieldApiKey, setFieldApiKey] = useState<string>('')
  const [itemApiKey, setItemApiKey] = useState<string>('')
  const [currentSlug, setCurrentSlug] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorStateType>(null)

  useEffect(() => {
    const allSlugs: any = ctx.formValues.slug
    const localeSlug = allSlugs[ctx.locale]
    setCurrentSlug(localeSlug)
    setFieldApiKey(ctx.field.attributes.api_key)
    setItemApiKey(ctx.itemType.attributes.api_key)
  }, [ctx])

  const handleClick = async () => {
    setLoading(true)

    const query = buildQuery(ctx)

    const { data } = await fetch('https://graphql.datocms.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Environment': ctx.environment,
        Accept: 'application/json',
        Authorization: `Bearer ${
          ctx.plugin.attributes.parameters
            ? ctx.plugin.attributes.parameters.readAPIToken
            : ''
        }`,
        'X-Include-Drafts': 'true',
      },
      body: JSON.stringify({ query }),
    }).then((res) => res.json())

    let page = data[itemApiKey]
    let isSlugParentNull = false
    let slugs = []

    if (Number(ctx.itemType.id) !== 323151) {
      // Split slug by "/" to catch only the end of the path
      const pageSlugSplitted = (page[fieldApiKey] || currentSlug || '').split(
        '/'
      )

      // To avoid duplicating the parent's slug in the final slug
      const pageSlugWithoutParent =
        pageSlugSplitted[pageSlugSplitted.length - 1]

      slugs.push(pageSlugWithoutParent)

      while (page.parent) {
        page = page.parent

        if (!page[fieldApiKey]) {
          isSlugParentNull = true
          break
        }
        let slug = page[fieldApiKey]
        if (slug.includes('/')) {
          slug = slug.split('/')[slug.split('/').length - 1]
        }
        slugs.push(slug)
      }

      if (!isSlugParentNull) {
        slugs.map((slug) => {
          return slug.toLowerCase().split(' ').join('-')
        })
        slugs.reverse()
        ctx.setFieldValue(ctx.fieldPath, slugs.join('/'))
      } else {
        setError({
          code: 404,
          message: `Parent not found. Please, check if you set the slugs for all parent pages with ${ctx.locale.toUpperCase()} locale.`,
        })
      }
    } else {
      slugs.push(data.allBlogPosts[0].category.name)
      slugs.push(data.allBlogPosts[0].slug)

      slugs = slugs.map((slug) => {
        return slug.toLowerCase().split(' ').join('-')
      })

      ctx.setFieldValue(ctx.fieldPath, slugs.join('/'))
    }
    setLoading(false)
  }

  const buildQuery = (ctx: RenderFieldExtensionCtx) => {
    const locale = ctx.locale
    const itemId = ctx.item ? ctx.item.id : null
    const getParams = `
      id
      ${fieldApiKey}
      title
    `

    if (Number(ctx.itemType.id) === 323151) {
      return `
        query {
          allBlogPosts(locale: ${locale}, filter: { id: { eq: "${itemId}"} }) {
            ${getParams}
            category {
              name
              id
              slug
              position
            }
          }
        }
      `
    }

    return `
    query {
      ${itemApiKey}(locale: ${locale}, filter: { id: { eq: "${itemId}"} }) {
       ${getParams}
        parent {
          ${getParams}
          parent {
            ${getParams}
            parent {
              ${getParams}
              parent {
                ${getParams}
                parent {
                  ${getParams}
                }
              }
            }
          }
        }
      }
    }
  `
  }

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
            Build slug with parent pages
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
      {error && (
        <div style={{ color: '#ff5e49', fontSize: '.875rem' }} className="mt-2">
          {error.message}
        </div>
      )}
    </Canvas>
  )
}

export default BuildSlugButton

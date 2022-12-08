import { getApolloClient } from 'lib/apollo-client';

import { QUERY_ALL_TAGS, QUERY_TAG_BY_SLUG, QUERY_TAG_SEO_BY_SLUG } from 'data/tags';

/**
 * tagPathBySlug
 */

export function tagPathBySlug(slug) {
  return `/tags/${slug}`;
}

/**
 * getAllTags
 */

export async function getAllTags() {
  const apolloClient = getApolloClient();

  const data = await apolloClient.query({
    query: QUERY_ALL_TAGS,
  });

  const tags = data?.data.tags.edges.map(({ node = {} }) => node);

  return {
    tags,
  };
}

/**
 * getTagBySlug
 */

export async function getTagBySlug(slug) {
  const apolloClient = getApolloClient();
  const apiHost = new URL(process.env.WORDPRESS_GRAPHQL_ENDPOINT).host;

  let tagData;
  let seoData;

  try {
    tagData = await apolloClient.query({
      query: QUERY_TAG_BY_SLUG,
      variables: {
        slug,
      },
    });
  } catch (e) {
    console.log(`[tags][getTagBySlug] Failed to query tag data: ${e.message}`);
    throw e;
  }

  if (!tagData?.data.tag) return { tag: undefined };

  const tag = mapTagData(tagData?.data.tag);

  // If the SEO plugin is enabled, look up the data
  // and apply it to the default settings

  if (process.env.WORDPRESS_PLUGIN_SEO === true) {
    try {
      seoData = await apolloClient.query({
        query: QUERY_TAG_SEO_BY_SLUG,
        variables: {
          slug,
        },
      });
    } catch (e) {
      console.log(`[tags][getTagBySlug] Failed to query SEO plugin: ${e.message}`);
      console.log('Is the SEO Plugin installed? If not, disable WORDPRESS_PLUGIN_SEO in next.config.js.');
      throw e;
    }

    const { seo = {} } = seoData?.data?.tag || {};

    tag.title = seo.title;
    tag.description = seo.metaDesc;

    // The SEO plugin by default includes a canonical link, but we don't want to use that
    // because it includes the WordPress host, not the site host. We manage the canonical
    // link along with the other metadata, but explicitly check if there's a custom one
    // in here by looking for the API's host in the provided canonical link

    if (seo.canonical && !seo.canonical.includes(apiHost)) {
      tag.canonical = seo.canonical;
    }

    tag.og = {
      author: seo.opengraphAuthor,
      description: seo.opengraphDescription,
      image: seo.opengraphImage,
      modifiedTime: seo.opengraphModifiedTime,
      publishedTime: seo.opengraphPublishedTime,
      publisher: seo.opengraphPublisher,
      title: seo.opengraphTitle,
      type: seo.opengraphType,
    };

    tag.article = {
      author: tag.og.author,
      modifiedTime: tag.og.modifiedTime,
      publishedTime: tag.og.publishedTime,
      publisher: tag.og.publisher,
    };

    tag.robots = {
      nofollow: seo.metaRobotsNofollow,
      noindex: seo.metaRobotsNoindex,
    };

    tag.twitter = {
      description: seo.twitterDescription,
      image: seo.twitterImage,
      title: seo.twitterTitle,
    };
  }

  return {
    tag,
  };
}

/**
 * getTags
 */

export async function getTags({ count } = {}) {
  const { tags } = await getAllTags();
  return {
    categories: tags.slice(0, count),
  };
}

/**
 * mapCategoryData
 */

export function mapTagData(tag = {}) {
  const data = { ...tag };
  return data;
}

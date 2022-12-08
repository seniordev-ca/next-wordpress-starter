import { getPostsByTagId } from 'lib/posts';
import usePageMetadata from 'hooks/use-page-metadata';

import TemplateArchive from 'templates/archive';
import Title from 'components/Title';
import { getTagBySlug } from 'lib/tags';

export default function Category({ category, posts }) {
  const { name, description, slug } = category;

  const { metadata } = usePageMetadata({
    metadata: {
      ...category,
      description: description || category.og?.description || `Read ${posts.length} posts from ${name}`,
    },
  });

  return <TemplateArchive title={name} Title={<Title title={name} />} posts={posts} slug={slug} metadata={metadata} />;
}

export async function getStaticProps({ params = {} } = {}) {
  const { tag } = await getTagBySlug(params?.slug);

  if (!tag) {
    return {
      props: {},
      notFound: true,
    };
  }

  const { posts } = await getPostsByTagId({
    tagId: tag.databaseId,
    queryIncludes: 'archive',
  });

  return {
    props: {
      tag,
      posts,
    },
  };
}

export async function getStaticPaths() {
  // By default, we don't render any Category pages as
  // we're considering them non-critical pages

  // To enable pre-rendering of Category pages:

  // 1. Add import to the top of the file
  //
  // import { getAllCategories, getCategoryBySlug } from 'lib/categories';

  // 2. Uncomment the below
  //
  // const { categories } = await getAllCategories();

  // const paths = categories.map((category) => {
  //   const { slug } = category;
  //   return {
  //     params: {
  //       slug,
  //     },
  //   };
  // });

  // 3. Update `paths` in the return statement below to reference the `paths` constant above

  return {
    paths: [],
    fallback: 'blocking',
  };
}

import Link from 'next/link';
import { Helmet } from 'react-helmet';

import useSite from 'hooks/use-site';
import { categoryPathBySlug } from 'lib/categories';
import { WebpageJsonLd } from 'lib/json-ld';

import Layout from 'components/Layout';
import Header from 'components/Header';
import Section from 'components/Section';
import Container from 'components/Container';
import SectionTitle from 'components/SectionTitle';

import styles from 'styles/pages/Categories.module.scss';
import { getAllTags } from 'lib/tags';

export default function Tags({ tags }) {
  const { metadata = {} } = useSite();
  const { title: siteTitle } = metadata;
  const title = 'Tags';
  const slug = 'tags';
  let metaDescription = `Read ${tags.length} tags at ${siteTitle}.`;

  return (
    <Layout>
      <Helmet>
        <title>Tags</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
      </Helmet>

      <WebpageJsonLd title={title} description={metaDescription} siteTitle={siteTitle} slug={slug} />

      <Header>
        <Container>
          <h1>Tags</h1>
        </Container>
      </Header>

      <Section>
        <Container>
          <SectionTitle>All Tags</SectionTitle>
          <ul className={styles.categories}>
            {tags.map((tag) => {
              return (
                <li key={tag.slug}>
                  <Link href={categoryPathBySlug(tag.slug)}>
                    <a>{tag.name}</a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </Layout>
  );
}

export async function getStaticProps() {
  const { tags } = await getAllTags();

  return {
    props: {
      tags,
    },
  };
}

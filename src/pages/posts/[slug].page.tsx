/* eslint-disable arrow-body-style */
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import {
  Container, PostContent, Title, Time, Article,
} from './page';

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps) {
  return (
    <Container>
      <Head>
        <title>{post.title}</title>
      </Head>

      <PostContent>
        <Title size="large">{post.title}</Title>
        <Time>{post.updatedAt}</Time>
        <Article dangerouslySetInnerHTML={{ __html: post.content }} />
      </PostContent>
    </Container>
  );
}

/*
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: '' } },
    ],
    fallback: 'blocking',
  };
};
*/

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req });
  const { slug } = params!;

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const prismic = getPrismicClient(req);

  const response = await prismic.getByUID<any>('publication', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date!).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };

  return {
    props: {
      post,
    },
  };
};

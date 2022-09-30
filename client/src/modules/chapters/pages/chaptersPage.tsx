import { Flex, Heading, Stack } from '@chakra-ui/layout';
import { NextPage } from 'next';
import React from 'react';
import { Grid, GridItem } from '@chakra-ui/react';
import { LinkButton } from 'chakra-next-link';
import { Loading } from 'components/Loading';
import { ChapterCard } from 'components/ChapterCard';
import { useChaptersQuery } from 'generated/graphql';
import { useAuth } from 'modules/auth/store';

export const ChaptersPage: NextPage = () => {
  const { loading, error, data } = useChaptersQuery();
  const { user } = useAuth();
  const isLoading = loading || !data;
  if (isLoading || error) return <Loading loading={isLoading} error={error} />;

  return (
    <Stack mt={10} mb={5} display={'block'}>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Heading marginBlock={'1em'}>Chapters: </Heading>
        <LinkButton
          href="/dashboard/chapters"
          colorScheme={'blue'}
          isDisabled={user?.id === undefined}
        >
          Chapter Dashboard
        </LinkButton>
      </Flex>
      <Grid gap="1em" width={'80vw'} marginBlock={0}>
        {data.chapters.map((chapter) => (
          <GridItem key={chapter.id}>
            <ChapterCard chapter={chapter} />
          </GridItem>
        ))}
      </Grid>
    </Stack>
  );
};

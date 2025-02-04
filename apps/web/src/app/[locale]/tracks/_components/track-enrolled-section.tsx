import { getServerAuthSession } from '@repo/auth/server';
import { prisma } from '@repo/db';
import Link from 'next/link';
import { Carousel } from '~/components/ui/carousel';
import { PersonalTrackCard } from './personal-track-card';
import { Card } from '@repo/ui/components/card';
import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

const SkeletonTrack = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <Card
    className={clsx(
      'm-auto flex w-[300px] gap-4 bg-white bg-opacity-[.03] p-2 backdrop-blur-xl backdrop-filter md:m-0',
      className,
    )}
    {...rest}
  >
    <div className="h-16 w-16 flex-none rounded-2xl bg-white bg-opacity-5" />
    <div className="flex-1 space-y-3 pt-1">
      <div className="h-3 w-2/3 rounded-lg bg-white bg-opacity-5" />
      <div className="h-2 w-full rounded-lg bg-white bg-opacity-5" />
      <div className="h-2 w-full rounded-lg bg-white bg-opacity-5" />
    </div>
  </Card>
);

export async function EnrolledTrackSection() {
  const tracks = await getUserEnrolledTracks();

  return (
    <div>
      {tracks.length ? (
        <>
          <div className="container flex items-center justify-between gap-3 px-4 pt-5">
            <h2 className="relative text-3xl font-bold tracking-tight">
              <div className="absolute -left-8 -z-10 h-12 w-32 rounded-full bg-blue-300/50 blur-3xl" />
              Your Tracks
            </h2>
          </div>

          <section className="relative flex w-full flex-row gap-4 overflow-hidden rounded-[2.5rem]">
            <Carousel>
              {tracks.map((t) => (
                <Link
                  className="group w-[250px] flex-none snap-center focus:outline-none sm:w-[330px] xl:w-[333px]"
                  href={`/tracks/${t.id}`}
                  key={t.id}
                >
                  <PersonalTrackCard track={t} />
                </Link>
              ))}
            </Carousel>
          </section>
        </>
      ) : (
        <div
          className="relative my-10 grid min-h-[246px] w-full items-center gap-2 px-5  md:grid-cols-2 md:gap-10"
          key="helper-track"
        >
          <div className="text-center md:text-right">
            <h1 className="text-lg font-bold">No Tracks Yet.</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Start your journey by enrolling in a track.
            </p>
          </div>

          <div className="absolute left-2/4 hidden h-full w-[1px] -translate-x-2/4 transform bg-white bg-opacity-5 md:block" />

          <div className="row-start-1 md:row-auto">
            <SkeletonTrack />
            <SkeletonTrack className="bg-opacity-[.01 -translate-y-4 translate-x-10" />
            <div className="absolute top-1/3 -z-10 h-12 w-32 rounded-full bg-blue-300/50 blur-3xl" />
          </div>
        </div>
      )}
    </div>
  );
}

export type EnrolledTracks = Awaited<ReturnType<typeof getUserEnrolledTracks>>;

/**
 * Fetches user enrolled tracks based on current session.
 */
async function getUserEnrolledTracks() {
  const session = await getServerAuthSession();
  return prisma.track.findMany({
    where: {
      enrolledUsers: {
        some: {
          id: session?.user.id,
        },
      },
    },
    include: {
      trackChallenges: {
        include: {
          challenge: {
            include: {
              submission: {
                where: {
                  userId: session?.user.id,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          enrolledUsers: true,
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });
}

import CategoryFilter from '@/components/shared/CategoryFilter';
import Collection from '@/components/shared/Collection'
import Search from '@/components/shared/Search';
import { Button } from '@/components/ui/button'
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';
import Image from 'next/image'
import Link from 'next/link'

export default async function Home({ searchParams }: SearchParamProps) {
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || '';
  const category = (searchParams?.category as string) || '';

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 6
  })

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-6 md:py-12">
        <div className="wrapper grid grid-cols-1 gap-6 md:grid-cols-2 2xl:gap-0 items-center">
          <div className="flex flex-col justify-center gap-6 md:gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-semibold w-fit">
              <span>✨ Host &amp; Book Events Worldwide</span>
            </div>

            <h1 className="h1-bold text-gray-900 leading-tight">
              Host, Connect, Celebrate: <span className="text-primary-500">Your Events</span>, Our Platform!
            </h1>
            <p className="p-regular-20 md:p-regular-24 text-gray-600">
              Create and host your own community events or book tickets to conferences, hackathons, and workshops with instant checkout.
            </p>

            {/* Dual CTAs: Create Event & Book Tickets */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Button size="lg" asChild className="button w-full sm:w-fit shadow-lg shadow-primary-500/25">
                <Link href="/events/create" className="flex items-center gap-2">
                  <span>+ Create Event</span>
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild className="rounded-full w-full sm:w-fit border-2 border-primary-500 text-primary-500 hover:bg-primary-50 hover:text-primary-600 font-semibold py-6 px-8 transition">
                <Link href="#events" className="flex items-center gap-2">
                  <span>🎟️ Book Tickets</span>
                </Link>
              </Button>
            </div>

            {/* Value badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pt-2">
              <span className="flex items-center gap-1.5">✓ 0% Platform Fee on Free RSVPs</span>
              <span className="flex items-center gap-1.5">✓ Instant Ticket Pass</span>
              <span className="flex items-center gap-1.5">✓ Real-time Notifications</span>
            </div>
          </div>

          <Image 
            src="/assets/images/hero.png"
            alt="hero"
            width={1000}
            height={1000}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]"
          />
        </div>
      </section> 

      <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="h2-bold">Trust by <br /> Thousands of Events</h2>

        <div className="flex w-full flex-col gap-5 md:flex-row">
          <Search />
          <CategoryFilter />
        </div>

        <Collection 
          data={events?.data}
          emptyTitle="No Events Found"
          emptyStateSubtext="Come back later"
          collectionType="All_Events"
          limit={6}
          page={page}
          totalPages={events?.totalPages}
        />
      </section>
    </>
  )
}

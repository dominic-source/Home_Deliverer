import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon, AtSymbolIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image'
import ToggleMenu, { Navigation } from '@/app/ui/landing_page/ToggleMenu';
import Search from '@/app/ui/search';
import { Button } from '@/app/ui/button';
import Slidein from '@/app/ui/landing_page/slidein';
import { chooseUs, items, restaurant, testimonials } from '@/app/lib/utils';
import { blue, orange } from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';

export default function Page() {

  return (
    <>
     {/* Desktop Navigation */}
    <Navigation />
    {/* Mobile Navigation */}
    <ToggleMenu />
    <Search placeholder='find desired food(s) / restaurant(s)'/>
    <main className='pt-5 md:pt-0'>
      <section aria-label="hero section" className='relative w-full p-12 bg-orange-50 shadow-md bg-[url("/landing_page/meal_mockup3.jpg")] bg-bottom bg-no-repeat bg-[length:100%_50%] md:bg-right md:bg-[length:65%_130%]'>
        <div className='text-orange-900 w-full md:text-7xl text-4xl md:tracking-wide tracking-normal md:leading-relaxed leading-normal'>Healthy Eating. <br/>Better Living.</div>
        <div className='text-gray-700 w-full md:text-xl text:sm md:tracking-wide leading-normal mb-10'>
          Accomplish your goals with convenient, <br />
          healthy meals delivered to your door.
        </div>
        <div className='flex md:flex-row flex-col md:space-x-2 items-center mb-20'>
          <Button className='bg-orange-500'>Order Now</Button>
          <div className='mt-auto mb-auto text-gray-900 font-bold'> - or - </div>
          <Button>Find restaurant near you</Button>
        </div>
      </section>

      <section aria-label="how it works section" id='how_it_works'>
        <Slidein className="md:text-7xl text-3xl font-medium text-slate-900 pt-10 text-center">How it works</Slidein>
          <Slidein className="w-full p-5 md:p-8 flex flex-col md:flex-row md:items-center">
            {items.map((item, idx) => { return (
            <div className='flex flex-col md:w-1/3 w-full items-center justify-center p-6 rounded-xl cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300' key={idx}>
              <p className='text-orange-900 text-2xl md:leading-normal mb-2 '>{item.header}</p>
              <Image
                src={`/landing_page/${item.name}`}
                width={300}
                height={300}
                alt={item.altText}
                className='rounded-xl shadow-md'
              />
            </div>
          )})}
          </Slidein>
      </section>
      <section aria-label="Featured Restaurants or Dishes" className='w-full bg-orange-100 shadow-2xl'>
        <Slidein className="md:text-7xl text-3xl font-medium text-slate-900 pt-10 text-center">Popular restarants top dishes</Slidein>
        <Slidein className="w-full p-5 md:p-8 flex flex-col md:flex-row flex-wrap md:items-center">
          {restaurant.map((item, idx) => { return (
          <div className='flex flex-col md:w-1/4 w-full justify-center p-6 rounded-xl transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300' key={idx}>
            <div className='shadow-lg rounded-xl p-5 bg-gray-50'>
              <Link href={item.href}>
                <Image
                  src={`/landing_page/${item.image}`}
                  width={300}
                  height={200}
                  alt={item.altText}
                  className='rounded-t-xl cursor-pointer'
                />
              </Link>
              <h1 className='text-xl text-slate-900 md:leading-normal pt-3 pb-3'>{item.name}</h1>
              <p className='text-sm text-slate-500 md:leading-normal'>{item.briefDescription}</p>
              <div className='flex flex-row p-5 flex flex-row justify-center'>
                <Button className='bg-orange-500'>Order from here</Button>
              </div>
            </div>
          </div>
        )})}
        </Slidein>
      </section>
      <section aria-label="Why Choose Us Section" className='w-full bg-slate-100 shadow-2xl'>
        <Slidein className="md:text-7xl text-3xl font-medium text-orange-900 pt-10 text-center">Why Choose Us</Slidein>
        <Slidein className="w-full p-5 md:p-8 flex flex-col md:flex-row flex-wrap md:items-center">
          {chooseUs.map((item, idx) => { return (
          <div className='flex flex-col md:w-1/4 w-full justify-center p-6 rounded-xl transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300' key={idx}>
            <div className='shadow-lg rounded-xl p-5 bg-gray-50 flex flex-col'>
              <div className='text-center'>
                <item.icon sx={{
                fontSize: 50,
                color: orange[900]
                }}/>
              </div>
              <h1 className='text-xl text-blue-900 md:leading-normal pt-3 pb-3 text-center'>{item.header}</h1>
              <p className='text-sm text-blue-500 md:leading-normal text-center'>{item.description}</p>
            </div>
          </div>
        )})}
        </Slidein>
      </section>

      <section aria-label="Register business owners who sell any kind of food products"></section>

      <section aria-label="Customer Testimonials" id='success_stories' className='w-full bg-blue-100 shadow-lg'>
        <Slidein className="md:text-5xl text-lg font-medium text-blue-900 pt-10 text-center">See What customers are saying</Slidein>
        <Slidein className="w-full p-5 md:p-8 flex flex-col md:flex-row flex-wrap md:items-center">
          {testimonials.map((item, idx) => { return (
          <div className='flex flex-col md:w-1/3 w-full justify-center p-6 rounded-xl transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300' key={idx}>
            <div className='shadow-lg rounded-xl p-5 bg-gray-50 flex flex-col'>
              <div className='text-center'>
                <Image
                  src={item.image}
                  width={300}
                  height={300}
                  alt={item.altText}
                  className='rounded-t-xl'
                />
              </div>
              <p className='text-sm text-gray-600 md:leading-normal text-center pt-3'>{item.message}</p>
            </div>
          </div>
        )})}
        </Slidein>
      </section>
    </main>

      <div className='flex flex-col items-center justify-between text-gray-900 w-full md:text-xl text-sm md:tracking-wide leading-normal mb-10'>
        <h3 className='w-full text-center text-orange-800 p-7'><Link href='/' className='cursor-pointer text-blue-700'>Download app</Link> via ios or android</h3>
        <div className='flex flex-row flex-wrap w-full justify-around p-7 md:text-lg text-sm'>
          <Button className='bg-gray-700 m-3'>SignUp</Button>
          <Button className='bg-orange-600 m-3'>Order now</Button>
          <Button className='bg-gray-700 m-3'>Find your Restaurants</Button>
          <Button className='bg-orange-600 m-3'>Explore the market</Button>
        </div>
      </div>
      <footer id='contact' aria-label="" className='w-full bg-orange-700 shadow-2xl flex flex-col md:flex-row p-5 pb-16'>
        <div className='w-full md:w-3/4 flex flex-col md:flex-row justify-around items-center'>
          <div className='flex flex-col text-slate-50'>
            <Typography sx={{ mt: 2, color: blue[900], fontSize: 20 }}>Important Pages</Typography>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>home page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>about page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>app page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>market place</Link>
          </div>

          <div className='flex flex-col text-slate-50'>
            <Typography sx={{ mt: 2, color: blue[900], fontSize: 20 }}>Important Pages</Typography>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>home page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>about page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>app page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>market place</Link>
          </div>

          <div className='flex flex-col text-slate-50'>
            <Typography sx={{ mt: 2, color: blue[900], fontSize: 20 }}>Important Pages</Typography>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>home page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>about page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>app page</Link>
            <Link href='/' className='cursor-pointer hover:text-gray-900 active:text-gray-900 focus:text-gray-900'>market place</Link>
          </div>
        </div>
        <div className="w-full md:w-1/4 flex flex-col justify-around">
          <div>
            <label
              className="mb-3 mt-5 block text-lg font-medium text-slate-50"
              htmlFor="email">
              Subscribe to our Newsletter
            </label>
            <div className="relative mt-2 mb-3">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Subscribe by entering your email"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <Button className='rounded-md'>Submit</Button>
          </div>
        </div>
      </footer>
    </>
    // <main className="flex min-h-screen flex-col p-6">
    //   <div className={styles.shape} />
    //   <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
    //     <AcmeLogo />
    //   </div>
      
    //   <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        
    //     <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
    //       <div className="relative w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black">
    //       </div>
    //       <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
    //         <strong>Welcome to Acme.</strong> This is the example for the{' '}
    //         <a href="https://nextjs.org/learn/" className="text-blue-500">
    //           Next.js Learn Course
    //         </a>
    //         , brought to you by Vercel.
    //       </p>
    //       <Link
    //         href="/login"
    //         className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
    //       >
    //         <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
    //       </Link>
    //     </div>
    //     <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
    //       {/* Add Hero Images Here */}
    //       <Image 
    //         src="/hero-desktop.png"
    //         width={1000}
    //         height={760}
    //         className='hidden md:block'
    //         alt='Screenshots of the dashboard project showing desktop version'
    //       />

    //       <Image
    //         src="/hero-mobile.png"
    //         width={560}
    //         height={620}
    //         className='block md:hidden'
    //         alt='Screenshots of the dashboard project showing mobile version'
    //       />
    //     </div>
    //   </div>
    // </main>
  );
}


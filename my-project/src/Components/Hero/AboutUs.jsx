import { motion } from 'framer-motion';
import { LuCar , LuShieldCheck, LuMapPinned, LuClock3 } from 'react-icons/lu';
import Footer from '../Footer/Footer';
import HeroImage from '../../Images/Bg-clg.jpg';
import { FadeUp, FadeRight } from '../../utility/annimation';

const stats = [
  { value: '24/7', label: 'Platform access' },
  { value: 'Real-time', label: 'Parking visibility' },
  { value: 'Fast', label: 'Spot reservation' },
  { value: 'Secure', label: 'Booking flow' },
];


const features = [
  {
    icon: LuCar ,
    title: 'Parking made simpler',
    description: 'We keep the booking flow focused and fast so users can move from search to reservation without friction.',
  },
  {
    icon: LuShieldCheck,
    title: 'Trusted and reliable',
    description: 'The system is designed to help owners and drivers manage parking with more confidence and less manual work.',
  },
  {
    icon: LuMapPinned,
    title: 'Built for local routes',
    description: 'Find parking near work, home, or in the city with a layout that prioritizes clarity and quick decisions.',
  },
];

const AboutUs = () => {
  console.log("AboutUs rendered");
  return (
    <main className="overflow-x-hidden bg-white">

      <section className="relative isolate overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-white to-secondary/10" />
        <div className="absolute right-0 top-24 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute left-0 top-56 -z-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

        <div className="container grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          <div className="space-y-8">
            <motion.div
              variants={FadeUp(0.2)}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-rose-500 px-4 py-2 text-sm font-semibold text-primary shadow-sm"
            >
              <LuCar  className="text-rose-600" />
              About Valley360 Parking
            </motion.div>

            <motion.h1
              variants={FadeRight(0.35)}
              initial="hidden"
              animate="visible"
              className="max-w-xl text-4xl font-bold leading-tight font-averia text-slate-900 sm:text-5xl lg:text-6xl"
            >
              🚗 Parking, but finally done right.
            </motion.h1>

            <motion.p
              variants={FadeRight(0.5)}
              initial="hidden"
              animate="visible"
              className="max-w-xl text-lg leading-8 text-slate-600"
            >
              Valley360 Parking brings drivers, owners, and administrators into one simple flow. The goal is consistent: make parking easier to find, easier to manage, and easier to trust across every screen.
              <br/>
              No confusion. No chaos. Just a smarter way to park.
              <br/>
              Find faster. Manage easier. Trust completely. ✨
            </motion.p>

            <motion.div
              variants={FadeRight(0.65)}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4"
            >
              <a href="/Login" className="primary-btn inline-flex items-center gap-2">
                <LuClock3 />
                Start Booking
              </a>
              <a
                href="/ContactUs"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary"
              >
                Contact Us
              </a>
            </motion.div>
          </div>

          <motion.img 
            initial={{opacity:0, x:200, rotate:75}}
            animate={{opacity:1, x:0, rotate:0}}
            transition={{duration:1, delay:0.2}}
            src={HeroImage} alt='' className='w-[350px] ms:w=[550px] drop-shadow md:px-10'>

          </motion.img>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={FadeUp(0.2 + index * 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm"
            >
              <p className="text-2xl font-bold text-primary text-secondary sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">✨ Built to feel familiar</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Find it. Book it. Park it.</h2>
            <p className="mt-4 text-slate-600">
              Finding parking shouldn’t feel like a side quest.
              We make it quick, simple, and actually reliable.
            </p>

          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  key={feature.title}
                  variants={FadeUp(0.2 + index * 0.12)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl text-primary">
                    <Icon />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 rounded-[2rem] bg-gradient-to-br from-rose-400 to-orange-300 px-6 py-10 text-slate-800 md:grid-cols-[1.3fr_0.7fr] md:px-10 lg:px-12">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Built for every role</p>
              <h2 className="text-3xl font-bold sm:text-4xl">Drivers, owners, and admins all need the same clarity.</h2>
              <p className="max-w-2xl text-slate-700">
                Valley360 Parking keeps the booking experience simple for users while still giving owners and administrators the tools they need to manage inventory, availability, and access.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-5 backdrop-blur-sm border border-rose-200 shadow-md">
                <p className="text-sm text-slate-500">Driver flow</p>
                <p className="mt-2 text-lg font-semibold">Search, reserve, and confirm in fewer steps.</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-5 backdrop-blur-sm border border-rose-200 shadow-md">
                <p className="text-sm text-slate-500">Owner flow</p>
                <p className="mt-2 text-lg font-semibold">Update parking spaces and manage slots quickly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AboutUs;

import { motion } from "framer-motion";
import { FadeRight } from "../Annimations/annimation";
import { IoCarSportOutline, IoNavigateOutline, IoShieldCheckmarkOutline, IoTimeOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

const featureItems = [
  {
    title: 'Instant Spot Match',
    description: 'Find the right parking option near your destination without the usual search stress.',
    icon: IoCarSportOutline,
  },
  {
    title: 'Guided Parking Route',
    description: 'Get direct smart navigation to your reserved slot and avoid unnecessary detours.',
    icon: IoNavigateOutline,
  },
  {
    title: 'Reliable & Secure',
    description: 'Park confidently with continuous monitoring and secure digital payments.',
    icon: IoShieldCheckmarkOutline,
  },
  {
    title: 'Live Slot Visibility',
    description: 'See open spaces in real time so you can decide faster before you even arrive.',
    icon: IoTimeOutline,
  },
  {
    title: 'Hassle-Free Booking',
    description: 'Reserve in a few taps and skip last-minute parking uncertainty during busy hours.',
    icon: IoCheckmarkCircleOutline,
  },
];

const Banner = () => {
  return (
    <section className='py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50/50 to-white'>
      <div className='container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <span className='inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-medium mb-4'>
            <IoCarSportOutline className='w-4 h-4' />
            Our Features
          </span>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4'>
            Why Choose <span className='bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent'>Valley 360?</span>
          </h2>
          <p className='text-slate-600 max-w-2xl mx-auto text-lg'>
            Parking with Valley360 means less searching, faster booking, and a smoother arrival every time.
          </p>
        </motion.div>

        <div className='grid items-start gap-10 rounded-[28px] border border-rose-100/50 bg-gradient-to-br from-white via-rose-50/30 to-orange-50/30 px-6 py-12 shadow-[0_24px_60px_rgba(244,63,94,0.08)] sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:px-12 lg:py-16'>
          <div className='text-center lg:text-left lg:sticky lg:top-8'>
            <motion.div
              variants={FadeRight(0.5)}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              className='space-y-6'
            >
              <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl shadow-lg shadow-rose-500/25 mb-4'>
                <IoShieldCheckmarkOutline className='w-8 h-8 text-white' />
              </div>
              
              <h3 className='text-[32px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[40px]'>
                Smart Parking,<br />Simplified
              </h3>

              <p className='text-slate-600 text-lg leading-relaxed'>
                From real-time availability to guided navigation and secure checkouts, everything is designed to make parking effortless.
              </p>

              <p className='text-slate-600 leading-relaxed'>
                Your perfect parking spot is just one click away.
              </p>

              <motion.div
                variants={FadeRight(1.0)}
                initial='hidden'
                whileInView='visible'
                viewport={{ once: true }}
                className='pt-4'
              >
                <a href="/AboutUs" className='primary-btn inline-flex items-center gap-2 px-8 py-4'>
                  <span>Learn More</span>
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {featureItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.title}
                  variants={FadeRight(0.6 + index * 0.1)}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`group rounded-2xl border border-white/80 bg-white/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-300 ${index === 4 ? 'sm:col-span-2' : ''}`}
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 group-hover:from-rose-500 group-hover:to-orange-500 group-hover:text-white transition-all duration-300'>
                      <Icon className='text-2xl' />
                    </div>
                    <div>
                      <h4 className='text-lg font-semibold text-slate-900 group-hover:text-rose-600 transition-colors'>{item.title}</h4>
                      <p className='mt-2 text-sm leading-6 text-slate-600'>{item.description}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;

import { motion } from "framer-motion";
import { FadeRight } from "../Annimations/annimation";
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircleOutline, IoLockClosedOutline, IoTimeOutline, IoRocketOutline, IoSparklesOutline } from 'react-icons/io5';

const featureItems = [
  {
    title: 'Easy Booking',
    description: 'Reserve a parking slot without unnecessary steps.',
    icon: IoCheckmarkCircleOutline,
  },
  {
    title: 'Real-time Availability',
    description: 'See updated parking options before you arrive.',
    icon: IoTimeOutline,
  },
  {
    title: 'Secure Payments',
    description: 'Complete transactions with a simple, trusted flow.',
    icon: IoLockClosedOutline,
  },
];

const Banner2 = () => {
  const navigate = useNavigate();

  const handleJoinUs = () => {
    navigate('/SignUp');
  };

  const handleContactUs = () => {
    navigate('/ContactUs');
  };

  return (
    <section className='py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-slate-50'>
      <div className='container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <span className='inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-600 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-rose-100'>
            <IoSparklesOutline className='w-4 h-4' />
            Get Started Today
          </span>
        </motion.div>

        <div className='grid items-center gap-10 rounded-[28px] border border-slate-100 bg-white px-6 py-12 shadow-xl shadow-slate-200/50 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:px-12 lg:py-16 overflow-hidden relative'>
          {/* Background Decoration */}
          <div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-100/50 to-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none' />
          <div className='absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-100/30 to-orange-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none' />

          <div className='text-center lg:text-left relative z-10'>
            <motion.div
              variants={FadeRight(0.5)} 
              initial='hidden' 
              whileInView="visible" 
              viewport={{ once: true }}
              className='flex items-center justify-center lg:justify-start gap-2 mb-6'
            >
              <div className='w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25'>
                <IoRocketOutline className='w-7 h-7 text-white' />
              </div>
            </motion.div>

            <motion.h3
              variants={FadeRight(0.5)} 
              initial='hidden' 
              whileInView="visible" 
              viewport={{ once: true }}
              className='text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight tracking-tight text-slate-900'
            >
              Join the <span className='bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent'>Valley360</span> Community
            </motion.h3>

            <motion.p
              variants={FadeRight(0.7)} 
              initial='hidden' 
              whileInView="visible" 
              viewport={{ once: true }}
              className='mt-4 text-slate-600 text-lg leading-relaxed max-w-lg'
            >
              Explore our user-friendly platform and see how Valley360 Parking can transform your parking experience. From quick stops to long-term solutions, we're here to help you park smarter.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={FadeRight(0.9)} 
              initial='hidden' 
              whileInView='visible'
              viewport={{ once: true }}
              className='mt-8 flex flex-wrap justify-center lg:justify-start gap-4'
            >
              <button 
                className='primary-btn px-8 py-4 flex items-center gap-2' 
                onClick={handleJoinUs}
              >
                <span>Get Started Free</span>
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </button>
              <button 
                className='secondary-btn px-8 py-4 border-2 border-slate-200 hover:border-rose-200 hover:bg-rose-50' 
                onClick={handleContactUs}
              >
                Contact Sales
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={FadeRight(1.1)}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              className='mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-500'
            >
              <div className='flex items-center gap-2'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span>Free to start</span>
              </div>
              <div className='flex items-center gap-2'>
                <svg className='w-5 h-5 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <span>No credit card required</span>
              </div>
            </motion.div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2 relative z-10'>
            {featureItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.title}
                  variants={FadeRight(0.8 + index * 0.15)}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`group rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-6 shadow-sm hover:shadow-lg hover:border-rose-100 transition-all duration-300 ${index === 2 ? 'sm:col-span-2' : ''}`}
                >
                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 group-hover:from-rose-500 group-hover:to-orange-500 group-hover:text-white transition-all duration-300 shadow-sm'>
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

            {/* Stats Card */}
            <motion.div
              variants={FadeRight(1.2)}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              className='sm:col-span-2 grid grid-cols-3 gap-4 p-6 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white'
            >
              {[
                { value: '10K+', label: 'Parking Spots' },
                { value: '50+', label: 'Cities' },
                { value: '99%', label: 'Satisfaction' },
              ].map((stat, idx) => (
                <div key={idx} className='text-center'>
                  <p className='text-2xl md:text-3xl font-bold'>{stat.value}</p>
                  <p className='text-sm text-white/80 mt-1'>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner2;


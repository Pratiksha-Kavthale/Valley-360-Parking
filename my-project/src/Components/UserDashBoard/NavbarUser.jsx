import { LuCar  } from "react-icons/lu";
import {motion} from 'framer-motion'

import { useNavigate } from 'react-router-dom';

const NavbarMenu = [
    {
        id: 1,
        title: "Home",
        link:"/",
    },
    {
        id: 2,
        title: "Profile",
        link:"/Profile",
    },
    {
        id: 3,
        title: "Update Profile",
        link:"/Update",
    },
    {
        id: 4,
        title: "My Bookings",
        link:"/user/bookings",
    },
];
   
const NavbarUser = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.removeItem('user'); // Remove the user's data from session storage
        localStorage.removeItem('token');

        // Redirect to home page
        navigate('/');
    };
    
  return (
    <nav className='bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50'>
        <motion.div 
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{duration:0.5, delay:0.5}}
    
    className="container flex justify-between items-center py-4 md:pt-4 gap-14">
        {/*  Logo section */}
        <div className='text-2xl flex items-center gap-2 font-bold uppercase'>
        <p className="text-primary">User</p>
        <p className="text-primary">Dashboard</p>
       
        <LuCar className='text-primary'/>
        </div>

        <div className='hidden md:block'>
            <ul className='flex items-center gap-6 text-slate-600'>
                {NavbarMenu.map((menu)=>(
                    <li key={menu.id} className='text-xl'>
                        <a href={menu.link}
                        className='inline-block py-1 px-3 hover:text-rose-600 hover:shadow-[0_3px_0_-1px_#FB7185] font-semibold'
                        >{menu.title}</a>
                        </li>
                    ))}
                    <li className='text-xl'>
                        <button
                            onClick={handleLogout}
                            className='inline-block py-1 px-3 hover:text-rose-600 hover:shadow-[0_3px_0_-1px_#FB7185] font-semibold'
                        >
                            Logout
                        </button>
                    </li> 
                    
            </ul>
            
        </div>
           
    </motion.div>

   </nav>

  )
}

export default NavbarUser

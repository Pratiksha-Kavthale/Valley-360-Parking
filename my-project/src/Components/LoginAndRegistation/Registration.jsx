import backgroundImage from '../../Images/Registation_Bg.jpg'; // Adjust the path as needed
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import api from '/src/api';

// Function to validate the password
const validatePassword = (password) => {
    const minLength = 8;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercase = /[A-Z]/;
    const number = /[0-9]/;

    return (
        password.length >= minLength &&
        specialChar.test(password) &&
        uppercase.test(password) &&
        number.test(password)
    );
};

const Registration = () => {
    // State variables for form inputs
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contact, setContact] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [roleId, setRoleId] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Handler for form submission
    const handleSignup = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Validate password
        if (!validatePassword(password)) {
            setPasswordError('Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 special character, and a combination of digits and letters.');
            return;
        } else {
            setPasswordError('');
        }

        try {
            // Send a POST request to the backend with the form data
            await api.post('https://spirited-essence-production.up.railway.app/User/Register', {
                firstName,
                lastName,
                email,
                password,
                contact,
                gender,
                address,
                roleId: parseInt(roleId, 10), // Convert roleId to integer
            })
            .then(() => {
                toast.success("Signup Successful!"); // Display success message
                window.location.href = '/';
            });

        } catch (error) {
            toast.error('There was an error signing up!', error); // Log any errors
        }
    };

    return (
        <div
            className='min-h-screen py-40'
            style={{
                backgroundImage: 'linear-gradient(115deg, #9F7AEA, #FEE2FE)',
                backgroundSize: 'cover', // Ensure the gradient covers the entire background
            }}
        >
            <div className='container mx-auto'>
                <div className='flex w-8/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden p-8'>
                    <div
                        className='w-1/2 bg-cover flex flex-col items-center justify-center py-12 bg-no-repeat bg-center '
                        style={{
                            backgroundImage: `url(${backgroundImage})`, // Apply the imported image
                        }}
                    >
                        <h1 className='text-slate-800 text-3xl mb-3'>Welcome</h1>
                        <h4 className='text-slate-700 mr-3'>Park Smart, Park Easy.</h4>
                        <p className='text-slate-600 pl-4'>Hello! Your perfect parking spot is just a registration away. Join us now!</p>
                    </div>

                    <div className='w-1/2 px-12'>
                        <h2 className='text-3xl mb:4'>Register Here</h2>
                        <p className='mb-4'>Create your account. It's free and only takes a minute</p>

                        <form onSubmit={handleSignup}>

                            <div className='grid grid-cols-2 gap-5'>
                                <input type='text' placeholder='First Name' className='border border-gray-400 py-1 px-2' value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                <input type='text' placeholder='Last Name' className='border border-gray-400 py-1 px-2' value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                            </div>

                            <div className='mt-5'>
                                <input type='email' placeholder='Email' className='border border-gray-400 py-1 px-2 w-full' value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>

                            <div className='mt-5'>
                                <input
                                    type='password'
                                    placeholder='Password'
                                    className='border border-gray-400 py-1 px-2 w-full'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {passwordError && <p className='text-red-500 mt-1'>{passwordError}</p>}
                            </div>

                            <div className='mt-5'>
                                <input type='tel' placeholder='Contact' pattern="[0-9]{10}" title="Please enter a 10-digit phone number" className='border border-gray-400 py-1 px-2 w-full' value={contact} onChange={(e) => setContact(e.target.value)} required />
                            </div>

                            <div className='mt-5'>
                                <input type='text' placeholder='Address' className='border border-gray-400 py-1 px-2 w-full' value={address} onChange={(e) => setAddress(e.target.value)} required />
                            </div>

                            <div className='grid-cols-2 gap-5 mt-5'>
                                <span className='text-black mr-2'>Gender:</span>
                                <select className='border border-gray-400 py-1 pc-2 mr-4' value={gender} onChange={(e) => setGender(e.target.value)} required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select><br />
                            </div>
                            <div className='grid-cols-2 gap-4 mt-4'>
                                <span className='text-black gap-2 mr-2'>Role:</span>
                                <select className='border border-gray-400 py-1 pc-2 mr-4' value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
                                    <option value="">Select Role</option>
                                    <option value="2">Owner</option>
                                    <option value="3">Customer</option>
                                </select>
                            </div>
                            <div className='mt-5'>
                                <button type='submit' className='w-full bg-rose-500 hover:bg-rose-600 py-3 text-center text-white'> Register Now </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
            {/* Optional: Place 'hi' where it fits your layout */}
            <ToastContainer />
        </div>
    );
};

export default Registration;


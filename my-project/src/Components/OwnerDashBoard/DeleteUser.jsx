import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate , useParams} from 'react-router-dom';

const DeleteUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const handleDelete = async (e) => {
        e.preventDefault();

        if (!userId) {
            toast.error('User ID is required');
            return;
        }

        try {
            const response = await api.delete(`http://localhost:8080/User/Delete/${userId}`);

            if (response.status === 200) {
                toast.success('User deleted successfully');
                navigate('/admin/owners'); // Navigate to home or relevant page
            } else {
                toast.error('Unexpected response status');
                console.error('Response status:', response.status);
            }
        } catch (error) {
            toast.error('Error deleting user');
            console.error('Error:', error.response ? error.response.data : error.message); // Enhanced error logging
        }
    };
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center px-4 py-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 text-white flex flex-col justify-center items-center text-center p-6">
                    <h2 className="text-3xl font-bold">Delete User</h2>
                    <p className="mt-3 text-sm sm:text-base text-white/90">Manage user accounts with a consistent experience</p>
                </div>
                <div className="w-full md:w-1/2 p-6">
                <form onSubmit={handleDelete} className="space-y-4">
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 hover:scale-105 hover:shadow-md transition"
                        >
                            Delete User
                        </button>
                    </div>
                </form>
                <ToastContainer position="top-center" />
            </div>
            </div>
        </div>
    );
};

export default DeleteUser;



import adminAxios from '../../../utils/adminAxiosConfig';

// Base URL is already set in adminAxios, so we just need the path


const getAllUsers = async (token, page = 1, search = "") => {
    // Token is ignored as adminAxios will automatically add the auth header
    try {
        const response = await adminAxios.get(
            `/users?page=${page}&limit=10&search=${search}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};


const blockUser = async (token, userId) => {
    // Token is ignored as adminAxios will automatically add the auth header
    try {
        const response = await adminAxios.patch(
            `/users/block/${userId}`,
            {}
        );
        return response.data;
    } catch (error) {
        console.error('Error blocking user:', error);
        throw error;
    }
};

const unblockUser = async (token, userId) => {
    // Token is ignored as adminAxios will automatically add the auth header
    try {
        const response = await adminAxios.patch(
            `/users/unblock/${userId}`,
            {}
        );
        return response.data;
    } catch (error) {
        console.error('Error unblocking user:', error);
        throw error;
    }
};

const usersService = {
    getAllUsers,
    blockUser,
    unblockUser,
};

export default usersService;    
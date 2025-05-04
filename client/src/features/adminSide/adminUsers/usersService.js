import axios from "axios";

const API_URL = "http://localhost:5001/api/admin/users";


const getAllUsers = async (token, page = 1, search = "") => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.get(
        `${API_URL}?page=${page}&limit=10&search=${search}`,
        config
    );

    return response.data;
};


const blockUser = async (token, userId) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.patch(
        `${API_URL}/block/${userId}`,
        {},
        config
    );
    return response.data;
};

const unblockUser = async (token, userId) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.patch(
        `${API_URL}/unblock/${userId}`,
        {},
        config
    );
    return response.data;
};

const usersService = {
    getAllUsers,
    blockUser,
    unblockUser,
};

export default usersService;    
import axios from "axios";

const baseUrl = "http://localhost:3158/api/";

let token = null;
let config = null;

const setToken = (newToken) => {
    token = `Bearer ${newToken}`;
    config = {
        headers: {
            Authorization: token,
        },
    };
};

const handleJWTExpiry = () => {
    localStorage.removeItem("loggedAdmin");
    window.location.reload();
};

const axiosPOST = async (endpoint, data) => {
    try {
        const response = await axios.post(baseUrl + endpoint, data, config);
        return response.data;
    } catch (error) {
        if (error.response.status == 401) {
            handleJWTExpiry();
        } else {
            throw Error(error.response.data.error);
        }
    }
};

const axiosGET = async (endpoint) => {
    try {
        const response = await axios.get(baseUrl + endpoint, config);
        return response.data;
    } catch (error) {
        if (error.response.status == 401) {
            handleJWTExpiry();
        } else {
            throw Error(error.response.data.error);
        }
    }
};

const createAdmin = async (data) => {
    return axiosPOST("admin", data);
};

const createUser = async (data) => {
    return axiosPOST("users", data);
};

const changeAdminPassword = async (data) => {
    return axiosPOST("admin/changepassword", data, config);
};

const changeUserPassword = async (data) => {
    return axiosPOST("users/changepassword", data, config);
}

export default {
    setToken,
    createAdmin,
    createUser,
    changeAdminPassword,
    changeUserPassword,
};

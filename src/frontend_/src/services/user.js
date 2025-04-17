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
    localStorage.removeItem("loggedUser");
    window.location.reload();
};

export default {
    setToken
};
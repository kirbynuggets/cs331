import { redirect } from "react-router-dom";

const getAdminFromLocalStorage = () => {
  const loggedContributorJSON = window.localStorage.getItem("loggedAdmin");
  if (loggedContributorJSON) {
    return JSON.parse(loggedContributorJSON);
  }
  return null;
};

const getUserFromLocalStorage = () => {
    const loggedUserJSON = window.localStorage.getItem("loggedUser");
    if (loggedUserJSON) {
        return JSON.parse(loggedUserJSON);
    }
    return null;
};


const adminUserLoader = async () => {
  const admin = getAdminFromLocalStorage();
  const user = getUserFromLocalStorage();
  if (!admin && !user) {
    return redirect("/admin/signin");
  }
  return { admin, user };
};

export default adminUserLoader;
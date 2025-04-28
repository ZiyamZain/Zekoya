import React from "react";
import {useSelector} from "react-redux";
import { Navigate } from "react-router-dom";



const ProtectedRoute = ({children}) => {
    const {adminInfo} = useSelector((state)=> state.adminAuth);

    return adminInfo ? children : <Navigate to="/admin/login" replace />
}

export default ProtectedRoute;
// src/services/auth.service.js
import api from './axiosClient';

const URL = '/Auth';

export default {
    /**
     * Đăng nhập
     * Payload: { email, password }
     */
    login(data) {
        return api.post(`${URL}/login`, data);
    },

    /**
     * Đăng ký
     * Payload: { username, email, password, phone }
     */
    register(data) {
        return api.post(`${URL}/register`, data);
    },

    /**
     * Làm mới Token
     * Payload: { accessToken, refreshToken }
     */
    refreshToken(data) {
        return api.post(`${URL}/refresh-token`, data);
    },

    /**
     * Quên mật khẩu
     * Payload: { email }
     */
    forgotPassword(data) {
        return api.post(`${URL}/forgot-password`, data);
    },

     /**
     * Đặt lại mật khẩu
     * Payload: { token, newPassword }
     */
    resetPassword(data) {
        return api.post(`${URL}/reset-password`, data);
    }
}
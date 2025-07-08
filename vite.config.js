import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'process.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(process.env.VITE_RAZORPAY_KEY_ID),
    'process.env.VITE_RAZORPAY_KEY_SECRET': JSON.stringify(process.env.VITE_RAZORPAY_KEY_SECRET),
    'process.env.VITE_LOGIN_API': JSON.stringify(process.env.VITE_LOGIN_API),
    'process.env.VITE_PACKAGES_API': JSON.stringify(process.env.VITE_PACKAGES_API),
    'process.env.VITE_SIGNUP_API': JSON.stringify(process.env.VITE_SIGNUP_API),
    'process.env.VITE_ADD_SALON_API': JSON.stringify(process.env.VITE_ADD_SALON_API)
  }
});


import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { registerUser } from '../utils/api';
import { useUser } from '../contexts/userContext';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: ModalProps) => {
  const { login } = useUser();
  const { request: performRegister, error: apiError } = useApi(registerUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await performRegister({ name, email, password });
      await login({ email, password });
      setName('')
      setPassword('')
      setEmail('')
      onClose();
    } catch (err) {
      console.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = ()=>{
      setName('')
      setPassword('')
      setEmail('')
      onClose()
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="register-name">Full Name</label>
            <input 
              id="register-name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="John Doe"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="register-email">Email</label>
            <input 
              id="register-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="register-password">Password</label>
            <input 
              id="register-password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="******************"
              required
              disabled={isSubmitting}
            />
          </div>
          {apiError && <p className="text-red-500 text-xs italic mb-4">{apiError}</p>}
          <div className="flex items-center justify-between">
            <button 
              className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">
            Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-bold text-blue-500 hover:text-blue-700">Log in</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;

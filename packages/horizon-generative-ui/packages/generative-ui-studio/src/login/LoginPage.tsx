import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { checkAuthStatus } from './authService';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        if (isAuthenticated) {
          navigate('/apps'); // Redirect to dashboard if already logged in
        }
      } catch (error) {
        // Continue showing login page if not authenticated
        console.error('Auth check failed:', error);
      }
    };

    verifyAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200 p-8">
      <div className="w-full max-w-5xl flex overflow-hidden rounded-2xl shadow-2xl">
        {/* Left side - Background Image with Overlay */}
        <div className="relative hidden lg:block lg:w-3/5">
          <img 
            src="/screenshots.png" 
            alt="意图UI设计器 Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 to-indigo-600/40 backdrop-blur-sm flex flex-col justify-between p-8">
            <div className="flex items-center">
              <img src="/logo.png" alt="意图UI Logo" className="h-12 mr-4" />
              <h2 className="text-2xl font-bold text-white">意图UI设计器</h2>
            </div>
            
            <div className="mb-8">
              <img 
                src="/login.png" 
                alt="Login Interface" 
                className="rounded-xl shadow-xl max-w-md mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="mt-6 bg-white/10 backdrop-blur-md p-4 rounded-xl max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-white mb-2">专业的对话式UI设计平台</h3>
                <p className="text-white/90">
                  意图UI让您轻松创建、部署和管理智能对话界面，为您的用户提供流畅的交互体验。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Login Form (enlarged) */}
        <div className="w-full lg:w-2/5 bg-white p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="lg:hidden flex items-center mb-6">
              <img src="/logo.png" alt="意图UI Logo" className="h-10 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">意图UI设计器</h1>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 lg:text-center">
              {isRegistering ? '创建账户' : '欢迎回来'}
            </h1>
            <p className="mt-3 text-gray-600 text-center">
              {isRegistering 
                ? '注册您的账户，开启智能对话界面设计之旅' 
                : '登录您的账户，继续创建令人惊叹的对话式UI'}
            </p>
            <div className="w-16 h-1 bg-indigo-500 mt-6 rounded-full"></div>
          </div>

          <div className="w-full">
            {isRegistering ? (
              <RegisterForm onSuccess={() => setIsRegistering(false)} />
            ) : (
              <LoginForm />
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-indigo-600 hover:text-indigo-800 text-base font-medium transition-colors duration-300"
              >
                {isRegistering
                  ? '已有账户？立即登录'
                  : "没有账户？立即注册"}
              </button>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2025 意图UI设计器 - 对话式智能UI开发平台
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
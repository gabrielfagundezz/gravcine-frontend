
import React, { useState, useEffect, useMemo } from 'react';
import { loginUser, registerUser } from '../services/authService';
import type { UserCredentials, CurrentUser, MediaSearchResult } from '../types';
import { TMDB_BACKDROP_IMAGE_BASE_URL, TMDB_PLACEHOLDER_BACKDROP_URL } from '../constants';
import CloseIcon from './icons/CloseIcon';


interface AuthPageProps {
  onAuthSuccess: (user: CurrentUser) => void;
  onClose: () => void;
  popularMoviesForBackground: MediaSearchResult[];
}

type AuthMode = 'login' | 'register';

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onClose, popularMoviesForBackground }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const backgroundImage = useMemo(() => {
    if (popularMoviesForBackground && popularMoviesForBackground.length > 0) {
      const randomIndex = Math.floor(Math.random() * popularMoviesForBackground.length);
      const movie = popularMoviesForBackground[randomIndex];
      return movie.backdrop_path ? `${TMDB_BACKDROP_IMAGE_BASE_URL}${movie.backdrop_path}` : TMDB_PLACEHOLDER_BACKDROP_URL;
    }
    return TMDB_PLACEHOLDER_BACKDROP_URL;
  }, [popularMoviesForBackground]);


  useEffect(() => {
    // Reset fields when mode changes
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const credentials: UserCredentials = mode === 'register' 
      ? { username, email, password, confirmPassword }
      : { email, password };

    try {
      let user: CurrentUser;
      if (mode === 'register') {
        user = await registerUser(credentials);
        setSuccessMessage("Conta criada com sucesso! Redirecionando...");
      } else {
        user = await loginUser(credentials);
        setSuccessMessage("Login bem-sucedido! Redirecionando...");
      }
      // Adiciona um pequeno delay para o usuário ver a mensagem de sucesso
      setTimeout(() => {
        onAuthSuccess(user);
      }, 1000); 
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efeito para fechar com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);


  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-75 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-primary-bg rounded-xl shadow-2xl w-full max-w-4xl h-auto max-h-[90vh] md:h-[70vh] lg:h-[600px] flex overflow-hidden">
        {/* Lado Esquerdo - Imagem e Tagline */}
        <div 
          className="hidden md:block md:w-1/2 bg-cover bg-center relative" 
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Sua jornada cinematográfica começa aqui.
            </h2>
            <p className="text-tmdb-green text-lg">
              Descubra, avalie, divirta-se.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center overflow-y-auto scrollbar-thin scrollbar-thumb-tertiary-bg scrollbar-track-secondary-bg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar autenticação"
          >
            <CloseIcon size={28} />
          </button>
          
          <h2 className="text-3xl font-bold text-tmdb-light-blue mb-6 text-center">
            Bem-vindo ao GravCine
          </h2>

          <div className="flex justify-center mb-6 border-b border-tertiary-bg">
            <button
              onClick={() => setMode('login')}
              className={`px-6 py-3 text-lg font-semibold transition-colors duration-150
                ${mode === 'login' ? 'text-tmdb-green border-b-2 border-tmdb-green' : 'text-gray-400 hover:text-tmdb-light-blue'}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-6 py-3 text-lg font-semibold transition-colors duration-150
                ${mode === 'register' ? 'text-tmdb-green border-b-2 border-tmdb-green' : 'text-gray-400 hover:text-tmdb-light-blue'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Nome de Usuário
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-tertiary-bg border border-gray-600 rounded-md shadow-sm 
                             text-primary-text placeholder-gray-500 
                             focus:ring-2 focus:ring-tmdb-green focus:border-transparent outline-none"
                  placeholder="Seu nome de usuário"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                {mode === 'login' ? 'Email ou Nome de Usuário' : 'Email'}
              </label>
              <input
                id="email"
                name="email"
                type={mode === 'login' ? 'text' : 'email'} // Permite nome de usuário ou email no login
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-tertiary-bg border border-gray-600 rounded-md shadow-sm 
                           text-primary-text placeholder-gray-500 
                           focus:ring-2 focus:ring-tmdb-green focus:border-transparent outline-none"
                placeholder={mode === 'login' ? 'email@exemplo.com ou usuário' : 'email@exemplo.com'}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-tertiary-bg border border-gray-600 rounded-md shadow-sm 
                           text-primary-text placeholder-gray-500 
                           focus:ring-2 focus:ring-tmdb-green focus:border-transparent outline-none"
                placeholder="Sua senha"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-tertiary-bg border border-gray-600 rounded-md shadow-sm 
                             text-primary-text placeholder-gray-500 
                             focus:ring-2 focus:ring-tmdb-green focus:border-transparent outline-none"
                  placeholder="Confirme sua senha"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center">{error}</p>}
            {successMessage && <p className="text-sm text-green-400 bg-green-900/30 p-3 rounded-md text-center">{successMessage}</p>}
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm 
                           text-lg font-semibold text-tmdb-dark-blue bg-tmdb-green 
                           hover:bg-opacity-90 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-offset-primary-bg focus:ring-tmdb-green
                           disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-tmdb-dark-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

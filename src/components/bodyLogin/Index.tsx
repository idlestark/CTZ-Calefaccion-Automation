import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import './Login.css';

function Index() {
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para el formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Hook para redirigir
  const navigate = useNavigate();

  // Función que se ejecuta al presionar "Ingresar"
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue

    // Aquí definimos nuestro usuario hardcodeado
    const hardcodedUser = "admin";
    const hardcodedPass = "admin123";

    if (username === hardcodedUser && password === hardcodedPass) {
      // Si coinciden, limpiamos errores y redirigimos a /employee
      setError('');
      navigate('/employee');
    } else {
      // Si fallan, mostramos un error
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="login-header">
          <div className="logo-container">
            <img src="src\assets\logo.png" alt="" />
          </div>
          <h2>Iniciar Sesión</h2>
          <p className="subtitle">Ingresa con tu usuario para continuar</p>
        </div>

        {/* Agregamos el onSubmit al formulario */}
        <form className="login-form" onSubmit={handleLogin}>
          
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input 
                type="text" 
                id="username" 
                placeholder="Usuario" 
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)} /* Capturamos el usuario */
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)} /* Capturamos la contraseña */
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de error condicional */}
          {error && <p style={{ color: '#ff4c4c', fontSize: '13px', textAlign: 'center', marginTop: '-10px', marginBottom: '10px' }}>{error}</p>}

          <button type="submit" className="btn-submit">Ingresar</button>
        </form>

        <div className="login-footer">
          <a href="#">Si olvidaste tu contraseña, hace click acá</a>
        </div>

      </div>
    </div>
  );
}

export default Index;
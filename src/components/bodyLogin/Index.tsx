import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/logo.png';
import { useAuth, homeFor } from '../../auth';
import Dialog from '../ui/Dialog';
import ConnectionSettings from '../ui/ConnectionSettings';
import { local } from '../../api';

function Index() {
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para el formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [busy, setBusy] = useState(false);
  const [showConn, setShowConn] = useState(false);
  const [mode, setMode] = useState<'host' | 'client'>('host');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    local().info().then((i) => setMode(i.mode)).catch(() => {});
  }, []);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="login-header">
          <div className="logo-container">
            <img src={logo} alt="CTZ" className="logo-img"/>
          </div>
          <h2>Iniciar sesión</h2>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          
          <div className="form-group">
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
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit" className="btn-submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        </form>

        <div className="login-footer">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowConn(true); }}>
            Conexión entre computadoras ({mode === 'host' ? 'principal' : 'secundaria'})
          </a>
        </div>

        {showConn && (
          <Dialog width={520} onClose={() => setShowConn(false)}>
            <h3>Conexión</h3>
            <div className="ctz-dialog-body">
              <ConnectionSettings onClose={() => setShowConn(false)} />
            </div>
          </Dialog>
        )}

      </div>
    </div>
  );
}

export default Index;
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {login} from './login-service';
const gmail = "stephan@gmail.com";
const passwrod = "123"; 
let account;  
let setCurrentUser;
let fetchData;
let setLoading;

describe('Autenticacion', ()=>{
    beforeEach(()=>{
        account = {createEmailPasswordSession: vi.fn(),
            get: vi.fn()
        };
        setCurrentUser = vi.fn();
        fetchData = vi.fn();
        setLoading = vi.fn();
    })

    it('Credenciales Incorrectas', async ()=>{
        account.createEmailPasswordSession.mockRejectedValueOnce({ code: 401 });
        const result = await login({account, setCurrentUser, fetchData, setLoading, gmail, passwrod});
       

        expect(result).toEqual({
            success: false, 
            error: 'Credenciales incorrectas'
        });
        expect(setCurrentUser).not.toHaveBeenCalled();
        expect(fetchData).not.toHaveBeenCalled();
        expect(setLoading).toHaveBeenNthCalledWith(1, true);
        expect(setLoading).toHaveBeenNthCalledWith(2, false);
    })
    it('Demasiados Intentos de autenticacion', async ()=>{
        account.createEmailPasswordSession.mockRejectedValueOnce({ code: 429 });
        const result = await login({account, setCurrentUser, fetchData, setLoading, gmail, passwrod});
       

        expect(result).toEqual({
            success: false, 
            error: 'Demasiados intentos, espere un momento'
        });
        expect(setCurrentUser).not.toHaveBeenCalled();
        expect(fetchData).not.toHaveBeenCalled();
        expect(setLoading).toHaveBeenNthCalledWith(1, true);
        expect(setLoading).toHaveBeenNthCalledWith(2, false);
    })

   it('Intento de autenticacion con cuenta de usuario bloqueada', async ()=>{
        account.createEmailPasswordSession.mockRejectedValueOnce({ code: 403 });
        const result = await login({account, setCurrentUser, fetchData, setLoading, gmail, passwrod});
       

        expect(result).toEqual({
            success: false, 
            error: 'No puede acceder al ssitema. Cuenta de Usuario Bloqueda'
        });
        expect(setCurrentUser).not.toHaveBeenCalled();
        expect(fetchData).not.toHaveBeenCalled();
        expect(setLoading).toHaveBeenNthCalledWith(1, true);
        expect(setLoading).toHaveBeenNthCalledWith(2, false);
    })
    it('Autenticacion fallida por error de conexion', async ()=>{
        const networkError = new Error('Failed to fetch');
        networkError.code = 'ERR_NETWORK';
        account.createEmailPasswordSession.mockRejectedValueOnce(networkError);
        const result = await login({account, setCurrentUser, fetchData, setLoading, gmail, passwrod});
       

        expect(result).toEqual({
            success: false, 
            error: '⚠️ Sin conexión a internet. Verifica tu red e intenta nuevamente.'
        });
        expect(setCurrentUser).not.toHaveBeenCalled();
        expect(fetchData).not.toHaveBeenCalled();
        expect(setLoading).toHaveBeenNthCalledWith(1, true);
        expect(setLoading).toHaveBeenNthCalledWith(2, false);
    })
    it('Flujo exitoso', async ()=>{
        const mockSession = { $id: 'session123' };
        const mockUser = { $id: 'user123', email: 'stephan@gmail.com', name: 'Stephan' };
        
        account.createEmailPasswordSession.mockResolvedValueOnce(mockSession);
        account.get.mockResolvedValueOnce(mockUser);
        const result = await login({account, setCurrentUser, fetchData, setLoading, email: mockUser.email, password: passwrod});
       
        expect(result).toEqual({
            success: true, 
            message: 'Bienvenido'
        });
        expect(account.createEmailPasswordSession).toHaveBeenCalledWith(mockUser.email, passwrod);
        expect(setCurrentUser).toHaveBeenCalledWith(mockUser);
        expect(fetchData).toHaveBeenCalled();
        expect(setLoading).toHaveBeenNthCalledWith(1, true);
        expect(setLoading).toHaveBeenNthCalledWith(2, false);
    })
})
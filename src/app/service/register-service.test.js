import { set } from "date-fns";
import { register } from "./register-service";
import { beforeEach, describe, expect, it, vi } from 'vitest';
let newUser;
let account;
let setCurrentUser; 
let setLoading; 
const mockUser = { $id: 'user123', email: 'stephan@gmail.com', name: 'Stephan', password: 'Contrasena03*', phone: '56748645' };
describe("Registrar Usuario", ()=>{
    beforeEach(()=>{
        account ={create: vi.fn()};
        setCurrentUser = vi.fn();
        setLoading = vi.fn();
    })
    /*it("Flujo Exitoso", async ()=>{
        const mockSession = { $id: 'session123' };
        account.create.mockResolvedValueOnce(mockSession); 

        const result = await register({newUser: mockUser, account, setCurrentUser, setLoading});
        expect(result).toEqual({success: true, message: "Registro exitoso"});
        expect(account.create).toHaveBeenCalledWith(mockUser.$id, mockUser.email, mockUser.password,mockUser.name, mockUser.phone);
        expect(setCurrentUser).toHaveBeenCalledWith(mockUser);
        expect(setLoading).toHaveBeenNthCalledWith(1,true);
        expect(setLoading).toHaveBeenNthCalledWith(2,false);
    })
   it("Correo eltrconico exitente", async ()=>{
    account.create.mockRejectedValueOnce({ code: 409 });
    
    const result = await register({newUser: mockUser, account, setCurrentUser, setLoading})

    expect(result).toEqual({ 
                success: false, 
                error: 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.'
            });
    expect(setCurrentUser).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1,true);
    expect(setLoading).toHaveBeenNthCalledWith(2,false);
   })*/
  it("Intento de Registro sin conexion", async ()=>{
    const networkError = new Error('Failed to fetch');
    networkError.code = 'ERR_NETWORK';
    account.create.mockRejectedValueOnce(networkError);
    
    const result = await register({newUser: mockUser, account, setCurrentUser, setLoading})

    expect(result).toEqual( {
                success: false, 
                error: '⚠️ Sin conexión a internet. Verifica tu red e intenta nuevamente.'
            });
    expect(setCurrentUser).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1,true);
    expect(setLoading).toHaveBeenNthCalledWith(2,false);
  })
})
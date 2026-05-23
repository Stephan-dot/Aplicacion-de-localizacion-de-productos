import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addProduct } from './product-service.js';

describe('addProduct service', () => {
  const currentUser = { $id: 'user-123' };
  const validProduct = {
    producto: 'Paracetamol 500mg',
    tipo: 'medicamento',
    ubicacion: [21.0, -99.0],
    precio: 10.5,
    esDisponible: true,
    comercioId: 'comercio-1',
    fotoUrl: 'https://example.com/img.jpg',
  };

  let databases;
  let fetchProducts;
  let setLoading;

  beforeEach(() => {
    databases = { createDocument: vi.fn() };
    fetchProducts = vi.fn();
    setLoading = vi.fn();
  });

  it('Usuario no autenticado debe devolver error y no llamar a la base de datos', async () => {
    const result = await addProduct({
      product: validProduct,
      currentUser: null,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No hay un usuario logueado' });
    expect(databases.createDocument).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('Producto inválido debe devolver error sin llamar a createDocument', async () => {
    const result = await addProduct({
      product: null,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No se recibieron datos del producto' });
    expect(databases.createDocument).not.toHaveBeenCalled();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('Error en respuesta de base de datos debe retornar error', async () => {
    databases.createDocument.mockRejectedValueOnce(new Error('Base de datos no disponible'));

    const result = await addProduct({
      product: validProduct,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'Base de datos no disponible' });
    expect(databases.createDocument).toHaveBeenCalledOnce();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('Flujo exitoso debe crear producto y refrescar productos', async () => {
    const createResponse = { $id: 'producto-1' };
    databases.createDocument.mockResolvedValueOnce(createResponse);

    const result = await addProduct({
      product: validProduct,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: true, response: createResponse });
    expect(databases.createDocument).toHaveBeenCalledOnce();
    expect(fetchProducts).toHaveBeenCalledOnce();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addProduct } from './product-service.js';
import { obtenerProducto } from './product-service.js';
import { editProduct } from './product-service.js';
import { deleteProduct } from './product-service.js';
const currentUser = { $id: 'user-123', labels: ['admin'] };
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
let setProducts;
describe('OBTENER PRODUCTOS', ()=>{
  beforeEach(() => {
    databases = { listDocuments: vi.fn() };
    setProducts = vi.fn();
    setLoading = vi.fn();
  });
  it('Usuario no autenticado debe devolver error y no llamar a la base de datos', async () => {
    const result = await obtenerProducto({
      currentUser: null,
      databases,
      setLoading,
      setProducts
    });

    expect(result).toEqual({ success: false, error: 'No hay un usuario logueado' });
    expect(databases.listDocuments).not.toHaveBeenCalled();
    expect(setProducts).not.toHaveBeenCalled(); 
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('Admin debe obtener todos los productos sin filtros', async () => {
    const adminUser = { $id: 'admin-123', labels: ['admin'] };
    const mockResponse = { documents: ['producto1', 'producto2'] };
    databases.listDocuments.mockResolvedValueOnce(mockResponse);

    await obtenerProducto({
      currentUser: adminUser,
      databases,
      setLoading,
      setProducts
    });

    expect(databases.listDocuments).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
  });

  it('Flujo exitoso debe devolver productos y refrescar los productos', async ()=>{
    const createResponse = {documents: ['producto 1', 'producto 2', 'producto 3']}
    databases.listDocuments.mockResolvedValueOnce(createResponse);

    const result = await obtenerProducto({
      currentUser,
      databases,
      setLoading,
      setProducts
    });

    expect(result).toEqual({ success: true, response: createResponse });
    expect(databases.listDocuments).toHaveBeenCalledOnce();
    expect(setProducts).toHaveBeenCalledWith(createResponse.documents);
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  })

})

describe('AGREGAR PRODUCTO', () => {
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

// product-service.test.js - Añadir dentro del describe principal o crear nuevo describe

describe('editProduct service', () => {
  beforeEach(() => {
    databases = { updateDocument: vi.fn() };
    fetchProducts = vi.fn();
    setLoading = vi.fn();
  });

  const validProductId = 'product-123';
  const validProductUpdate = {
    producto: 'Paracetamol 500mg - Actualizado',
    tipo: 'medicamento',
    ubicacion: [21.0, -99.0],
    precio: 12.5,
    esDisponible: true,
  };

  
  it('Usuario no autenticado debe devolver error y no llamar a updateDocument', async () => {
    const result = await editProduct({
      productId: validProductId,
      product: validProductUpdate,
      currentUser: null,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No hay un usuario logueado' });
    expect(databases.updateDocument).not.toHaveBeenCalled();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  
  it('ProductId faltante debe devolver error sin llamar a updateDocument', async () => {
    const result = await editProduct({
      productId: null,
      product: validProductUpdate,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No se recibió el ID del producto' });
    expect(databases.updateDocument).not.toHaveBeenCalled();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  
  it('Producto inválido debe devolver error sin llamar a updateDocument', async () => {
    const result = await editProduct({
      productId: validProductId,
      product: null,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No se recibieron datos del producto' });
    expect(databases.updateDocument).not.toHaveBeenCalled();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  // Test 4: Error en base de datos
  it('Error en respuesta de base de datos debe retornar error', async () => {
    databases.updateDocument.mockRejectedValueOnce(new Error('Base de datos no disponible'));

    const result = await editProduct({
      productId: validProductId,
      product: validProductUpdate,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'Base de datos no disponible' });
    expect(databases.updateDocument).toHaveBeenCalledOnce();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('Flujo exitoso debe actualizar producto y refrescar productos', async () => {
    const updateResponse = { 
      $id: validProductId,
      ...validProductUpdate,
      fechaModificacion: expect.any(Date),
      $updatedAt: '2024-01-01T00:00:00.000Z'
    };
    
    databases.updateDocument.mockResolvedValueOnce(updateResponse);

    const result = await editProduct({
      productId: validProductId,
      product: validProductUpdate,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: true, response: updateResponse });
    expect(databases.updateDocument).toHaveBeenCalledOnce();
    expect(fetchProducts).toHaveBeenCalledOnce();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

});

describe('ELIMINAR PRODUCTO', () => {
  beforeEach(() => {
    databases = { deleteDocument: vi.fn() };
    fetchProducts = vi.fn();
    setLoading = vi.fn();
  });
  const validProductId = 'product-123';
  const validProductUpdate = {
    producto: 'Paracetamol 500mg - Actualizado',
    tipo: 'medicamento',
    ubicacion: [21.0, -99.0],
    precio: 12.5, }
  
  it('Usuario no autenticado debe devolver error y no llamar a deleteDocument', async () => {
    const result = await deleteProduct({
      productId: validProductId,
      currentUser: null,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No hay un usuario logueado' });
    expect(databases.deleteDocument).not.toHaveBeenCalled();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('ProductId faltante debe devolver error sin llamar a deleteDocument', async () => {
    const result = await deleteProduct({
      productId: null,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No se recibió el ID del producto' });
    expect(databases.deleteDocument).not.toHaveBeenCalled();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });

  it('Error en respuesta de base de datos debe retornar error', async () => {
    databases.deleteDocument.mockRejectedValueOnce(new Error('No se pudo eliminar el producto')); 

    const result = await deleteProduct({
      productId: validProductId,
      currentUser,
      databases,
      fetchProducts,
      setLoading,
    });

    expect(result).toEqual({ success: false, error: 'No se pudo eliminar el producto' });
    expect(databases.deleteDocument).toHaveBeenCalledOnce();
    expect(fetchProducts).not.toHaveBeenCalled();
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenNthCalledWith(2, false);
  });
});

import { describe, it, expect } from 'vitest';
import { searchProducts, calcularDistancia } from './search-service.js';

describe('search-service', () => {
  const products = [
    {
      $id: '1',
      producto: 'Pan Integral',
      tipo: 'alimento',
      precio: 5,
      verificaciones: 2,
      ubicacion: [20.0, -99.0],
    },
    {
      $id: '2',
      producto: 'Agua Mineral',
      tipo: 'bebida',
      precio: 2,
      verificaciones: 5,
      ubicacion: [20.001, -99.001],
    },
    {
      $id: '3',
      producto: 'Pan Dulce',
      tipo: 'alimento',
      precio: 8,
      verificaciones: 1,
      ubicacion: [21.0, -100.0],
    },
  ];

  it('calcularDistancia devuelve 0 para el mismo punto', () => {
    const distance = calcularDistancia(20, -99, 20, -99);
    expect(distance).toBeCloseTo(0, 5);
  });

  it('filtra por query, tipo y precio correctamente', () => {
    const result = searchProducts(products, 'Pan', 'alimento', 6, null);

    expect(result).toHaveLength(1);
    expect(result[0].producto).toBe('Pan Integral');
  });

  it('filtra por ubicación y ordena por votos y distancia', () => {
    const userLocation = { lat: 20.0, lng: -99.0 };
    const result = searchProducts(products, '', 'todos', 0, userLocation, 200);

    expect(result).toHaveLength(3);
    expect(result[0].producto).toBe('Agua Mineral'); // más votos primero
    expect(result[1].producto).toBe('Pan Integral');
    expect(result[2].producto).toBe('Pan Dulce');
  });

  it('excluye productos fuera del rango de distancia', () => {
    const userLocation = { lat: 20.0, lng: -99.0 };
    const result = searchProducts(products, '', 'todos', 0, userLocation, 1);

    expect(result).toHaveLength(2);
    expect(result.some(p => p.producto === 'Pan Dulce')).toBe(false);
  });
});

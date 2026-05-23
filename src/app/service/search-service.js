export const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const searchProducts = (products, query, type, maxPrice, userLocation, maxDistance = 10) => {
  if (!Array.isArray(products)) return [];

  const filteredProducts = products.filter(product => {
    const matchesQuery = !query || query === '' ||
      product.producto.toLowerCase().includes(query.toLowerCase());

    const matchesType = !type || type === 'todos' || product.tipo === type;

    const matchesPrice = !maxPrice || maxPrice === 0 || product.precio <= maxPrice;

    let matchesLocation = true;
    if (userLocation && userLocation.lat != null && userLocation.lng != null) {
      const distancia = calcularDistancia(
        userLocation.lat,
        userLocation.lng,
        product.ubicacion[0],
        product.ubicacion[1]
      );
      matchesLocation = distancia <= maxDistance;
    }

    return matchesQuery && matchesType && matchesPrice && matchesLocation;
  });

  return filteredProducts.sort((a, b) => {
    const votosDiff = (b.verificaciones || 0) - (a.verificaciones || 0);
    if (votosDiff !== 0) return votosDiff;

    if (userLocation && userLocation.lat != null && userLocation.lng != null) {
      const distanciaA = calcularDistancia(
        userLocation.lat,
        userLocation.lng,
        a.ubicacion[0],
        a.ubicacion[1]
      );
      const distanciaB = calcularDistancia(
        userLocation.lat,
        userLocation.lng,
        b.ubicacion[0],
        b.ubicacion[1]
      );
      return distanciaA - distanciaB;
    }

    return 0;
  });
};

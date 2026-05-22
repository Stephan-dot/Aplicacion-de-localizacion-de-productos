import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApp } from '../contexts/AppContext';
import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';

// GRASP: Information Expert - este componente sabe cómo agrupar mapas y marcadores según productos y comercios.
export default function CubaMap() {

// Solucionar problema de iconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapMarkers({ onProductSelect, selectedProductFromSearch }) {
  const { products, commerces } = useApp();
  const [commerceGroups, setCommerceGroups] = useState([]);

  useEffect(() => {
    const groups = new Map();
    
    // Determinar si filtrar por un comercio específico
    const selectedCommerceId = selectedProductFromSearch 
      ? products.find(p => p.$id === selectedProductFromSearch)?.comercioId 
      : null;
    
    products.forEach(product => {
      const commerceId = product.comercioId;
      
      if (!commerceId) return;
      
      // Si hay filtro, solo incluir productos del comercio seleccionado
      if (selectedCommerceId && commerceId !== selectedCommerceId) return;
      
      const commerce = commerces.find(c => c.$id === commerceId);
      if (!commerce || !commerce.ubicacion || !Array.isArray(commerce.ubicacion)) return;
      
      if (!groups.has(commerceId)) {
        groups.set(commerceId, {
          commerce: commerce,
          location: [parseFloat(commerce.ubicacion[0]), parseFloat(commerce.ubicacion[1])],
          direccion: commerce.direccion,
          products: [],
          count: 0
        });
      }
      
      const group = groups.get(commerceId);
      group.products.push(product);
      group.count = group.products.length;
    });
    
    setCommerceGroups(Array.from(groups.values()));
  }, [products, commerces, selectedProductFromSearch]);

  const createCommerceIcon = (commerceName, productCount) => {
    const escapedName = commerceName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    // Elegir color según cantidad
    let bgColor = 'linear-gradient(to bottom right, #b5b7be, )';
    
    
    return new L.DivIcon({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; position: relative;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ebebee80" stroke="black" stroke-width="2">
              <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>

          <div style="
            background: rgba(0, 0, 0, 0.61);
            color: white;
            padding: 3px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: bold;
            margin-top: 4px;
            white-space: nowrap;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">
            ${escapedName.length > 14 ? escapedName.substring(0, 10) + '...' : escapedName}
          </div>
        </div>
      `,
      className: 'custom-commerce-icon',
      iconSize: [70, 80],
      iconAnchor: [35, 70],
      popupAnchor: [0, -70],
    });
  };

  return (
    <>
      {commerceGroups.map((group, idx) => (
        <Marker
          key={idx}
          position={[group.location[0], group.location[1]]}
          icon={createCommerceIcon(group.commerce.nombre, group.count)}
          eventHandlers={{
            click: () => {
              if (group.count === 1) {
                onProductSelect(group.products[0].$id);
              }
            },
          }}
        >
          <Popup>
            <div className="min-w-[250px] max-h-[400px] overflow-y-auto p-2">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <Store className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-bold text-gray-800">{group.commerce.nombre}</p>
                  <p className="text-xs text-gray-500">
                    📍 {group.direccion}
                  </p>
                </div>
              </div>
              
              <p className="text-sm font-semibold text-gray-700 mb-2">
                🛍️ {group.count} producto{group.count > 1 ? 's' : ''}
              </p>
              
              <div className="space-y-2">
                {group.products.map((product) => (
                  <div 
                    key={product.$id}
                    className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer border border-gray-200"
                    onClick={() => {
                      onProductSelect(product.$id);
                      const popup = document.querySelector('.leaflet-popup');
                      if (popup) popup.remove();
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-800">{product.producto}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.tipo === 'medicamento' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.tipo === 'medicamento' ? '💊' : '🍎'}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-600 font-bold mt-1">
                      ${typeof product.precio === 'number' ? product.precio.toFixed(2) : product.precio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function CubaMap({ onProductSelect, selectedProductFromSearch }) {
  return (
    <MapContainer 
      center={[21.5, -77.5]} 
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
      dragging={true}
      touchZoom={true}
      doubleClickZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onProductSelect && <MapMarkers onProductSelect={onProductSelect} selectedProductFromSearch={selectedProductFromSearch} />}
    </MapContainer>
  );}
}
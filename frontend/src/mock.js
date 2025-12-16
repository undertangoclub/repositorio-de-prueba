// Mock data para la aplicación de sorteos de milonga

export const mockRitmos = [
  'Tango',
  'Vals',
  'Milonga',
  'Forró',
  'Rock and Roll',
  'Axé',
  'Lambada',
  'Sertanejo',
  'Funky',
  'Salsa',
  'Cumbia',
  'Bachata',
  'Merengue',
  'Chacarera',
  'Zamba',
  'Cuarteto',
  'Reggaeton',
  'Swing',
  'Blues',
  'Samba',
  'Bolero',
  'Chamamé',
  'Paso Doble',
  'Mambo',
  'Cha Cha Cha'
];

export let mockPremios = [
  { id: 1, nombre: 'Caja de 6 huevos', ganado: false },
  { id: 2, nombre: 'Cuadro', ganado: false },
  { id: 3, nombre: 'Libro', ganado: false }
];

export let mockBailarines = [];

export const obtenerPremios = () => {
  return mockPremios;
};

export const marcarPremioGanado = (premioId, ganador) => {
  const premio = mockPremios.find(p => p.id === premioId);
  if (premio) {
    premio.ganado = true;
    premio.ganador = ganador;
  }
  return mockPremios;
};

// Funciones para simular operaciones de backend
export const agregarBailarin = (nombre) => {
  const nuevoBailarin = {
    id: Date.now(),
    nombre: nombre,
    numero: mockBailarines.length + 1,
    activo: true
  };
  mockBailarines.push(nuevoBailarin);
  return nuevoBailarin;
};

export const obtenerBailarines = () => {
  return mockBailarines.filter(b => b.activo);
};

export const eliminarBailarin = (id) => {
  const bailarin = mockBailarines.find(b => b.id === id);
  if (bailarin) {
    bailarin.activo = false;
  }
};

export const sortearBailarines = (cantidad) => {
  const activos = obtenerBailarines();
  if (cantidad === 'todos') {
    return activos;
  }
  const shuffled = [...activos].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(cantidad, activos.length));
};

export const sortearRitmo = () => {
  return mockRitmos[Math.floor(Math.random() * mockRitmos.length)];
};

export const sortearPremio = (premioId) => {
  const activos = obtenerBailarines();
  if (activos.length === 0) return null;
  return activos[Math.floor(Math.random() * activos.length)];
};
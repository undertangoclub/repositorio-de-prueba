# Contratos API - Milonga Sorteo App

## Configuración de Horarios
- **Fecha del evento:** 21 de Diciembre de 2024
- **Sorteo de Baile:** Desbloqueado a las 22:30 PM (21/12/2024)
- **Sorteo de Premios:** Desbloqueado a las 00:00 AM (22/12/2024 - medianoche del 21)
- **Registro de bailarines:** Siempre disponible (desde ya)

## Modelos de Datos

### Bailarin
```json
{
  "_id": "ObjectId",
  "nombre": "string",
  "numero": "integer (auto-incrementado)",
  "activo": "boolean",
  "fecha_registro": "datetime",
  "created_at": "datetime"
}
```

### SorteoBaile
```json
{
  "_id": "ObjectId",
  "bailarines": ["array de bailarines con {id, nombre, numero}"],
  "ritmo": "string",
  "cantidad": "integer o 'todos'",
  "fecha": "datetime",
  "created_at": "datetime"
}
```

### SorteoPremio
```json
{
  "_id": "ObjectId",
  "premio_id": "integer (1, 2, 3)",
  "premio_nombre": "string",
  "ganador": {
    "id": "string",
    "nombre": "string",
    "numero": "integer"
  },
  "fecha": "datetime",
  "created_at": "datetime"
}
```

### Configuracion
```json
{
  "_id": "ObjectId",
  "tipo": "horarios",
  "sorteo_baile_inicio": "datetime (2024-12-21 22:30:00)",
  "sorteo_premios_inicio": "datetime (2024-12-22 00:00:00)"
}
```

## Endpoints API

### Bailarines
- `POST /api/bailarines` - Registrar nuevo bailarín
- `GET /api/bailarines` - Obtener todos los bailarines activos
- `DELETE /api/bailarines/{id}` - Eliminar bailarín (marcar como inactivo)

### Sorteo de Baile
- `GET /api/sorteo-baile/disponible` - Verificar si sorteo está desbloqueado
- `POST /api/sorteo-baile` - Realizar sorteo de baile
- `GET /api/sorteo-baile/historial` - Obtener historial de sorteos

### Sorteo de Premios
- `GET /api/sorteo-premios/disponible` - Verificar si sorteo está desbloqueado
- `GET /api/sorteo-premios` - Obtener estado de premios
- `POST /api/sorteo-premios/{premio_id}` - Realizar sorteo de premio específico

### Configuración
- `GET /api/config/horarios` - Obtener configuración de horarios

## Lógica de Negocio

### Registro de Bailarines
1. Validar que el nombre no esté vacío
2. Asignar número automático (último número + 1)
3. Guardar en MongoDB con activo=true
4. Retornar bailarín con su número

### Sorteo de Baile
1. Verificar que sea >= 21/12/2024 22:30
2. Validar que haya bailarines registrados
3. Sortear bailarines según cantidad solicitada
4. Sortear ritmo aleatorio
5. Guardar resultado en historial
6. Retornar resultado

### Sorteo de Premios
1. Verificar que sea >= 22/12/2024 00:00
2. Verificar que el premio no haya sido sorteado
3. Validar que haya bailarines registrados
4. Sortear ganador aleatorio
5. Guardar resultado
6. Retornar ganador

## Migración desde Mock
- Reemplazar todas las llamadas a mock.js
- Usar axios para llamadas API
- Mantener la misma interfaz de usuario
- Agregar mensajes de bloqueo cuando sorteos no estén disponibles

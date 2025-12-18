from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List

from models import (
    BailarinCreate, Bailarin,
    RitmoCreate, Ritmo,
    SorteoBaileCreate, SorteoBaile, BailarinSorteado,
    Premio, SorteoPremio, Ganador,
    DisponibilidadResponse
)
from utils import (
    sorteo_baile_disponible, sorteo_premios_disponible,
    sortear_ritmo, sortear_bailarines, sortear_ganador,
    SORTEO_BAILE_INICIO, SORTEO_PREMIOS_INICIO, PREMIOS,
    obtener_hora_actual_argentina
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
bailarines_collection = db.bailarines
ritmos_collection = db.ritmos
sorteos_baile_collection = db.sorteos_baile
sorteos_premios_collection = db.sorteos_premios

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== RITMOS ENDPOINTS ====================

@api_router.post("/ritmos", response_model=Ritmo)
async def crear_ritmo(ritmo_input: RitmoCreate):
    """Registrar un nuevo ritmo"""
    if not ritmo_input.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre del ritmo no puede estar vacío")
    
    # Verificar si ya existe
    existente = await ritmos_collection.find_one({
        "nombre": {"$regex": f"^{ritmo_input.nombre.strip()}$", "$options": "i"},
        "activo": True
    })
    
    if existente:
        raise HTTPException(status_code=400, detail="Este ritmo ya existe")
    
    # Crear ritmo
    ritmo = Ritmo(nombre=ritmo_input.nombre.strip())
    
    # Guardar en DB
    await ritmos_collection.insert_one(ritmo.dict())
    
    logger.info(f"Ritmo registrado: {ritmo.nombre}")
    return ritmo

@api_router.get("/ritmos", response_model=List[Ritmo])
async def obtener_ritmos():
    """Obtener todos los ritmos activos"""
    ritmos = await ritmos_collection.find(
        {"activo": True}
    ).sort("nombre", 1).to_list(1000)
    
    return [Ritmo(**r) for r in ritmos]

@api_router.delete("/ritmos/{ritmo_id}")
async def eliminar_ritmo(ritmo_id: str):
    """Eliminar un ritmo (marcar como inactivo)"""
    result = await ritmos_collection.update_one(
        {"id": ritmo_id},
        {"$set": {"activo": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ritmo no encontrado")
    
    logger.info(f"Ritmo eliminado: {ritmo_id}")
    return {"mensaje": "Ritmo eliminado exitosamente"}

@api_router.post("/ritmos/inicializar")
async def inicializar_ritmos():
    """Inicializar ritmos por defecto si no hay ninguno"""
    count = await ritmos_collection.count_documents({"activo": True})
    
    if count == 0:
        ritmos_default = [
            'Tango', 'Vals', 'Milonga', 'Forró', 'Rock and Roll',
            'Axé', 'Lambada', 'Sertanejo', 'Funky', 'Salsa',
            'Cumbia', 'Bachata', 'Merengue', 'Chacarera', 'Zamba',
            'Cuarteto', 'Reggaeton', 'Swing', 'Blues', 'Samba',
            'Bolero', 'Chamamé', 'Paso Doble', 'Mambo', 'Cha Cha Cha'
        ]
        
        for nombre in ritmos_default:
            ritmo = Ritmo(nombre=nombre)
            await ritmos_collection.insert_one(ritmo.dict())
        
        logger.info(f"Inicializados {len(ritmos_default)} ritmos por defecto")
        return {"mensaje": f"Se inicializaron {len(ritmos_default)} ritmos", "count": len(ritmos_default)}
    
    return {"mensaje": "Los ritmos ya están inicializados", "count": count}

# ==================== BAILARINES ENDPOINTS ====================

@api_router.post("/bailarines", response_model=Bailarin)
async def crear_bailarin(bailarin_input: BailarinCreate):
    """Registrar un nuevo bailarín"""
    if not bailarin_input.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    
    # Crear bailarín sin número (se calculará dinámicamente en frontend)
    bailarin = Bailarin(
        nombre=bailarin_input.nombre.strip(),
        numero=0  # Número temporal, se calculará en frontend
    )
    
    # Guardar en DB
    await bailarines_collection.insert_one(bailarin.dict())
    
    logger.info(f"Bailarín registrado: {bailarin.nombre}")
    return bailarin

@api_router.get("/bailarines", response_model=List[Bailarin])
async def obtener_bailarines():
    """Obtener todos los bailarines activos"""
    bailarines = await bailarines_collection.find(
        {"activo": True}
    ).sort("created_at", 1).to_list(1000)
    
    # Asignar números dinámicamente basándose en el orden
    bailarines_con_numero = []
    for idx, b in enumerate(bailarines, start=1):
        bailarin = Bailarin(**b)
        bailarin.numero = idx  # Número dinámico basado en posición
        bailarines_con_numero.append(bailarin)
    
    return bailarines_con_numero

@api_router.delete("/bailarines/{bailarin_id}")
async def eliminar_bailarin(bailarin_id: str):
    """Eliminar un bailarín (marcar como inactivo)"""
    result = await bailarines_collection.update_one(
        {"id": bailarin_id},
        {"$set": {"activo": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Bailarín no encontrado")
    
    logger.info(f"Bailarín eliminado: {bailarin_id}")
    return {"mensaje": "Bailarín eliminado exitosamente"}

# ==================== SORTEO BAILE ENDPOINTS ====================

@api_router.get("/sorteo-baile/disponible", response_model=DisponibilidadResponse)
async def verificar_sorteo_baile_disponible():
    """Verificar si el sorteo de baile está disponible"""
    disponible = await sorteo_baile_disponible(db)
    
    if disponible:
        return DisponibilidadResponse(
            disponible=True,
            mensaje="El sorteo de baile está disponible"
        )
    else:
        return DisponibilidadResponse(
            disponible=False,
            mensaje=f"El sorteo de baile se habilitará el 21 de diciembre a las 22:30",
            fecha_desbloqueo=SORTEO_BAILE_INICIO
        )

@api_router.post("/sorteo-baile", response_model=SorteoBaile)
async def realizar_sorteo_baile(sorteo_input: SorteoBaileCreate):
    """Realizar sorteo de baile"""
    # Verificar disponibilidad
    if not await sorteo_baile_disponible(db):
        raise HTTPException(
            status_code=403, 
            detail="El sorteo de baile aún no está disponible. Se habilitará el 21 de diciembre a las 22:30"
        )
    
    # Obtener bailarines activos
    bailarines = await bailarines_collection.find(
        {"activo": True}
    ).to_list(1000)
    
    if not bailarines:
        raise HTTPException(status_code=400, detail="No hay bailarines registrados")
    
    # Sortear bailarines y ritmo
    bailarines_sorteados = sortear_bailarines(bailarines, sorteo_input.cantidad)
    ritmo_sorteado = sortear_ritmo()
    
    # Crear objeto de sorteo
    sorteo = SorteoBaile(
        bailarines=[
            BailarinSorteado(
                id=b['id'],
                nombre=b['nombre'],
                numero=b['numero']
            ) for b in bailarines_sorteados
        ],
        ritmo=ritmo_sorteado,
        cantidad=sorteo_input.cantidad
    )
    
    # Guardar en historial
    await sorteos_baile_collection.insert_one(sorteo.dict())
    
    logger.info(f"Sorteo de baile realizado: {ritmo_sorteado} - {len(bailarines_sorteados)} bailarín(es)")
    return sorteo

@api_router.get("/sorteo-baile/historial", response_model=List[SorteoBaile])
async def obtener_historial_sorteo_baile():
    """Obtener historial de sorteos de baile"""
    sorteos = await sorteos_baile_collection.find().sort("created_at", -1).to_list(100)
    return [SorteoBaile(**s) for s in sorteos]

# ==================== SORTEO PREMIOS ENDPOINTS ====================

@api_router.get("/sorteo-premios/disponible", response_model=DisponibilidadResponse)
async def verificar_sorteo_premios_disponible():
    """Verificar si el sorteo de premios está disponible"""
    disponible = await sorteo_premios_disponible(db)
    
    if disponible:
        return DisponibilidadResponse(
            disponible=True,
            mensaje="El sorteo de premios está disponible"
        )
    else:
        return DisponibilidadResponse(
            disponible=False,
            mensaje=f"El sorteo de premios se habilitará a la medianoche (00:00)",
            fecha_desbloqueo=SORTEO_PREMIOS_INICIO
        )

@api_router.get("/sorteo-premios", response_model=List[Premio])
async def obtener_estado_premios():
    """Obtener estado de todos los premios"""
    # Obtener premios ya sorteados
    premios_sorteados = await sorteos_premios_collection.find().to_list(100)
    premios_sorteados_ids = {p['premio_id'] for p in premios_sorteados}
    
    # Crear lista de premios con estado
    resultado = []
    for premio_config in PREMIOS:
        if premio_config['id'] in premios_sorteados_ids:
            # Premio ya sorteado
            sorteo = next(p for p in premios_sorteados if p['premio_id'] == premio_config['id'])
            resultado.append(Premio(
                id=premio_config['id'],
                nombre=premio_config['nombre'],
                ganado=True,
                ganador=Ganador(**sorteo['ganador'])
            ))
        else:
            # Premio disponible
            resultado.append(Premio(
                id=premio_config['id'],
                nombre=premio_config['nombre'],
                ganado=False
            ))
    
    return resultado

@api_router.post("/sorteo-premios/{premio_id}", response_model=SorteoPremio)
async def realizar_sorteo_premio(premio_id: int):
    """Realizar sorteo de un premio específico"""
    # Verificar disponibilidad
    if not await sorteo_premios_disponible(db):
        raise HTTPException(
            status_code=403,
            detail="El sorteo de premios aún no está disponible. Se habilitará a la medianoche (00:00)"
        )
    
    # Verificar que el premio existe
    premio_config = next((p for p in PREMIOS if p['id'] == premio_id), None)
    if not premio_config:
        raise HTTPException(status_code=404, detail="Premio no encontrado")
    
    # Verificar que el premio no haya sido sorteado
    premio_existente = await sorteos_premios_collection.find_one({"premio_id": premio_id})
    if premio_existente:
        raise HTTPException(status_code=400, detail="Este premio ya ha sido sorteado")
    
    # Obtener bailarines activos
    bailarines = await bailarines_collection.find(
        {"activo": True}
    ).to_list(1000)
    
    if not bailarines:
        raise HTTPException(status_code=400, detail="No hay participantes para el sorteo")
    
    # Sortear ganador
    ganador_data = sortear_ganador(bailarines)
    ganador = Ganador(
        id=ganador_data['id'],
        nombre=ganador_data['nombre'],
        numero=ganador_data['numero']
    )
    
    # Crear objeto de sorteo
    sorteo_premio = SorteoPremio(
        premio_id=premio_id,
        premio_nombre=premio_config['nombre'],
        ganador=ganador
    )
    
    # Guardar en DB
    await sorteos_premios_collection.insert_one(sorteo_premio.dict())
    
    logger.info(f"Premio sorteado: {premio_config['nombre']} - Ganador: {ganador.nombre} (N° {ganador.numero})")
    return sorteo_premio

# ==================== CONFIGURACIÓN ENDPOINTS ====================

@api_router.get("/config/horarios")
async def obtener_horarios():
    """Obtener configuración de horarios"""
    return {
        "sorteo_baile_inicio": SORTEO_BAILE_INICIO.isoformat(),
        "sorteo_premios_inicio": SORTEO_PREMIOS_INICIO.isoformat(),
        "hora_actual_servidor": obtener_hora_actual_argentina().isoformat()
    }

# ==================== OVERRIDE SECRETO ====================

@api_router.post("/config/override-unlock")
async def forzar_desbloqueo():
    """Forzar desbloqueo de sorteos (botón secreto)"""
    # Guardar override en la colección de configuración
    await db.config.update_one(
        {"tipo": "override"},
        {"$set": {
            "tipo": "override",
            "sorteos_desbloqueados": True,
            "fecha_override": obtener_hora_actual_argentina()
        }},
        upsert=True
    )
    
    logger.warning("⚠️ OVERRIDE ACTIVADO - Sorteos desbloqueados manualmente")
    return {"mensaje": "Sorteos desbloqueados exitosamente", "override_activo": True}

@api_router.get("/config/override-status")
async def verificar_override():
    """Verificar si el override está activo"""
    override = await db.config.find_one({"tipo": "override"})
    if override and override.get("sorteos_desbloqueados"):
        return {"override_activo": True}
    return {"override_activo": False}

@api_router.delete("/config/override-unlock")
async def desactivar_override():
    """Desactivar override (restaurar comportamiento normal)"""
    await db.config.delete_one({"tipo": "override"})
    logger.info("Override desactivado - sorteos vuelven a horario normal")
    return {"mensaje": "Override desactivado", "override_activo": False}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
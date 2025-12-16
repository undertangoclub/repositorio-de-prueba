from datetime import datetime
import pytz
import random

# Configuración de horarios (hora de Argentina)
ARGENTINA_TZ = pytz.timezone('America/Argentina/Buenos_Aires')

# Fecha y hora de desbloqueo
SORTEO_BAILE_INICIO = datetime(2025, 12, 21, 22, 30, 0)
SORTEO_PREMIOS_INICIO = datetime(2025, 12, 22, 0, 0, 0)

# Lista de ritmos
RITMOS = [
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
]

# Premios disponibles
PREMIOS = [
    {'id': 1, 'nombre': 'Caja de 6 huevos'},
    {'id': 2, 'nombre': 'Cuadro'},
    {'id': 3, 'nombre': 'Libro'}
]

def obtener_hora_actual_argentina():
    """Obtiene la hora actual en zona horaria de Argentina"""
    return datetime.now(ARGENTINA_TZ).replace(tzinfo=None)

async def sorteo_baile_disponible(db):
    """Verifica si el sorteo de baile está disponible"""
    # Verificar si hay override activo
    override = await db.config.find_one({"tipo": "override"})
    if override and override.get("sorteos_desbloqueados"):
        return True
    
    ahora = obtener_hora_actual_argentina()
    return ahora >= SORTEO_BAILE_INICIO

async def sorteo_premios_disponible(db):
    """Verifica si el sorteo de premios está disponible"""
    # Verificar si hay override activo
    override = await db.config.find_one({"tipo": "override"})
    if override and override.get("sorteos_desbloqueados"):
        return True
    
    ahora = obtener_hora_actual_argentina()
    return ahora >= SORTEO_PREMIOS_INICIO

def sortear_ritmo():
    """Sortea un ritmo aleatorio"""
    return random.choice(RITMOS)

def sortear_bailarines(bailarines_list, cantidad):
    """Sortea bailarines de la lista"""
    if cantidad == 'todos':
        return bailarines_list
    
    cantidad_int = int(cantidad) if isinstance(cantidad, str) else cantidad
    cantidad_sortear = min(cantidad_int, len(bailarines_list))
    
    return random.sample(bailarines_list, cantidad_sortear)

def sortear_ganador(bailarines_list):
    """Sortea un ganador aleatorio"""
    return random.choice(bailarines_list) if bailarines_list else None
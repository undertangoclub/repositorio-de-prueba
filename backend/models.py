from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime
import uuid

# Bailarín Models
class BailarinCreate(BaseModel):
    nombre: str

class Bailarin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    numero: int
    activo: bool = True
    fecha_registro: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Sorteo Baile Models
class BailarinSorteado(BaseModel):
    id: str
    nombre: str
    numero: int

class SorteoBaileCreate(BaseModel):
    cantidad: Union[int, str]  # número o 'todos'

class SorteoBaile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bailarines: List[BailarinSorteado]
    ritmo: str
    cantidad: Union[int, str]
    fecha: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Ritmo Models
class RitmoCreate(BaseModel):
    nombre: str

class Ritmo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    activo: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Premio Models
class Ganador(BaseModel):
    id: str
    nombre: str
    numero: int

class Premio(BaseModel):
    id: int
    nombre: str
    ganado: bool = False
    ganador: Optional[Ganador] = None

class SorteoPremio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    premio_id: int
    premio_nombre: str
    ganador: Ganador
    fecha: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Disponibilidad Models
class DisponibilidadResponse(BaseModel):
    disponible: bool
    mensaje: str
    fecha_desbloqueo: Optional[datetime] = None
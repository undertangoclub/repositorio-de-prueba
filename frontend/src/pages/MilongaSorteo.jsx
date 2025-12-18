import React, { useState, useEffect } from 'react';
import { Music, Users, Gift, Plus, Trash2, Shuffle, Sparkles, Clock, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';
import axios from 'axios';
import { playDrumRoll, playCymbalCrash, playWinSound } from '../utils/soundEffects';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MilongaSorteo = () => {
  const [nombreInput, setNombreInput] = useState('');
  const [bailarines, setBailarines] = useState([]);
  const [cantidadBailarines, setCantidadBailarines] = useState(2);
  const [resultadoSorteo, setResultadoSorteo] = useState(null);
  const [premios, setPremios] = useState([]);
  const [sorteoActivo, setSorteoActivo] = useState(false);
  const [premioSeleccionado, setPremioSeleccionado] = useState(null);
  const [updateKey, setUpdateKey] = useState(0);
  const [sorteoBaileDisponible, setSorteoBaileDisponible] = useState(false);
  const [sorteoPremiosDisponible, setSorteoPremiosDisponible] = useState(false);
  const [mensajeBaile, setMensajeBaile] = useState('');
  const [mensajePremios, setMensajePremios] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [overrideActivo, setOverrideActivo] = useState(false);

  useEffect(() => {
    cargarDatos();
    // Verificar disponibilidad cada minuto
    const interval = setInterval(() => {
      verificarDisponibilidad();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    await cargarBailarines();
    await cargarPremios();
    await verificarDisponibilidad();
  };

  const verificarDisponibilidad = async () => {
    try {
      // Verificar sorteo de baile
      const respBaile = await axios.get(`${API}/sorteo-baile/disponible`);
      setSorteoBaileDisponible(respBaile.data.disponible);
      setMensajeBaile(respBaile.data.mensaje);

      // Verificar sorteo de premios
      const respPremios = await axios.get(`${API}/sorteo-premios/disponible`);
      setSorteoPremiosDisponible(respPremios.data.disponible);
      setMensajePremios(respPremios.data.mensaje);

      // Verificar si override está activo
      const respOverride = await axios.get(`${API}/config/override-status`);
      setOverrideActivo(respOverride.data.override_activo);
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
    }
  };

  const handleFooterClick = () => {
    setClickCount(prev => prev + 1);
    
    // Triple clic para activar/desactivar el override secreto (toggle)
    if (clickCount + 1 === 3) {
      toggleOverrideSecreto();
      setClickCount(0);
    }
    
    // Resetear contador después de 2 segundos
    setTimeout(() => setClickCount(0), 2000);
  };

  const toggleOverrideSecreto = async () => {
    try {
      if (overrideActivo) {
        // Desactivar override
        await axios.delete(`${API}/config/override-unlock`);
        await verificarDisponibilidad();
        
        toast({
          title: "🔒 Sorteos Bloqueados",
          description: "Volviendo al horario programado.",
          duration: 5000
        });
      } else {
        // Activar override
        await axios.post(`${API}/config/override-unlock`);
        await verificarDisponibilidad();
        
        toast({
          title: "🔓 Sorteos Desbloqueados",
          description: "Modo administrador activado. Todos los sorteos están disponibles.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error en toggle override:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del desbloqueo",
        variant: "destructive"
      });
    }
  };

  const cargarBailarines = async () => {
    try {
      const response = await axios.get(`${API}/bailarines`);
      setBailarines(response.data);
    } catch (error) {
      console.error('Error cargando bailarines:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los bailarines",
        variant: "destructive"
      });
    }
  };

  const cargarPremios = async () => {
    try {
      const response = await axios.get(`${API}/sorteo-premios`);
      setPremios(response.data);
    } catch (error) {
      console.error('Error cargando premios:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los premios",
        variant: "destructive"
      });
    }
  };

  const handleAgregarBailarin = async () => {
    if (!nombreInput.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post(`${API}/bailarines`, {
        nombre: nombreInput.trim()
      });
      
      await cargarBailarines();
      setNombreInput('');
      
      toast({
        title: "¡Bailarín registrado!",
        description: `${response.data.nombre} - Número ${response.data.numero}`
      });
    } catch (error) {
      console.error('Error agregando bailarín:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "No se pudo registrar el bailarín",
        variant: "destructive"
      });
    }
  };

  const handleEliminarBailarin = async (id) => {
    try {
      await axios.delete(`${API}/bailarines/${id}`);
      await cargarBailarines();
      toast({
        title: "Bailarín eliminado",
        description: "Se ha eliminado el bailarín de la lista"
      });
    } catch (error) {
      console.error('Error eliminando bailarín:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el bailarín",
        variant: "destructive"
      });
    }
  };

  const sortearCantidad = () => {
    // Reproducir sonido de tambor
    playDrumRoll();
    
    // Esperar un poco para el suspenso
    setTimeout(() => {
      const opciones = [1, 2, 3, 4, 5, 6, 7, 8, 'todos'];
      const cantidadSorteada = opciones[Math.floor(Math.random() * opciones.length)];
      setCantidadBailarines(cantidadSorteada);
      
      // Sonido de platillo al final
      playCymbalCrash();
      
      toast({
        title: "Cantidad sorteada",
        description: `Se seleccionó: ${cantidadSorteada === 'todos' ? 'Todos' : cantidadSorteada + ' bailarín(es)'}`
      });
    }, 1700);
  };

  const handleSortearBaile = async () => {
    if (bailarines.length === 0) {
      toast({
        title: "Error",
        description: "No hay bailarines registrados",
        variant: "destructive"
      });
      return;
    }

    if (!sorteoBaileDisponible) {
      toast({
        title: "Sorteo no disponible",
        description: mensajeBaile,
        variant: "destructive"
      });
      return;
    }

    setSorteoActivo(true);
    
    // Reproducir sonido de tambores
    playDrumRoll();
    
    // Animación de sorteo con suspenso
    setTimeout(async () => {
      try {
        const response = await axios.post(`${API}/sorteo-baile`, {
          cantidad: cantidadBailarines
        });
        
        // Platillo al revelar resultado
        playCymbalCrash();
        
        setResultadoSorteo({
          bailarines: response.data.bailarines,
          ritmo: response.data.ritmo
        });
        
        setSorteoActivo(false);
        
        // Sonido de victoria
        setTimeout(() => playWinSound(), 300);
        
        toast({
          title: "¡A bailar!",
          description: `${response.data.ritmo} - ${response.data.bailarines.length} bailarín(es)`
        });
      } catch (error) {
        setSorteoActivo(false);
        console.error('Error en sorteo de baile:', error);
        toast({
          title: "Error",
          description: error.response?.data?.detail || "No se pudo realizar el sorteo",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const handleSortearPremio = async (premio) => {
    if (bailarines.length === 0) {
      toast({
        title: "Error",
        description: "No hay participantes para el sorteo",
        variant: "destructive"
      });
      return;
    }

    if (premio.ganado) {
      toast({
        title: "Premio ya sorteado",
        description: "Este premio ya tiene un ganador",
        variant: "destructive"
      });
      return;
    }

    if (!sorteoPremiosDisponible) {
      toast({
        title: "Sorteo no disponible",
        description: mensajePremios,
        variant: "destructive"
      });
      return;
    }

    setPremioSeleccionado(premio.id);
    
    // Reproducir sonido de tambores
    playDrumRoll();
    
    // Animación de sorteo con suspenso
    setTimeout(async () => {
      try {
        const response = await axios.post(`${API}/sorteo-premios/${premio.id}`);
        
        // Platillo y victoria
        playCymbalCrash();
        setTimeout(() => playWinSound(), 400);
        
        await cargarPremios();
        setUpdateKey(prev => prev + 1);
        
        setPremioSeleccionado(null);
        
        toast({
          title: "¡Tenemos ganador!",
          description: `${response.data.ganador.nombre} (N° ${response.data.ganador.numero}) ganó: ${premio.nombre}`
        });
      } catch (error) {
        setPremioSeleccionado(null);
        console.error('Error en sorteo de premio:', error);
        toast({
          title: "Error",
          description: error.response?.data?.detail || "No se pudo realizar el sorteo",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Casa Under Tango</h1>
          <p className="text-lg md:text-xl text-amber-100">Gran Milonga de Fin de Año - 21 de Diciembre</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Registro de Bailarines */}
        <Card className="mb-8 border-2 border-amber-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-2 text-2xl text-amber-900">
              <Users className="w-7 h-7" />
              Registro de Bailarines
            </CardTitle>
            <CardDescription>Registra tu nombre para participar en los sorteos</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Nombre del bailarín"
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAgregarBailarin()}
                className="flex-1 border-amber-300 focus:border-amber-500"
              />
              <Button
                onClick={handleAgregarBailarin}
                className="bg-amber-600 hover:bg-amber-700 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {bailarines.map((bailarin) => (
                <div
                  key={bailarin.id}
                  className="flex items-center justify-between p-3 bg-white border-2 border-amber-200 rounded-lg hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-600 text-white font-bold px-3 py-1">
                      #{bailarin.numero}
                    </Badge>
                    <span className="font-medium text-gray-800">{bailarin.nombre}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminarBailarin(bailarin.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {bailarines.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No hay bailarines registrados aún</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sorteo de Baile */}
        <Card className="mb-8 border-2 border-orange-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-rose-50">
            <CardTitle className="flex items-center gap-2 text-2xl text-orange-900">
              <Music className="w-7 h-7" />
              Sorteo de Baile
            </CardTitle>
            <CardDescription>Sortea bailarines y el ritmo que bailarán</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Cantidad de bailarines:
                </label>
                <Button
                  onClick={sortearCantidad}
                  variant="outline"
                  size="sm"
                  className="border-orange-400 text-orange-700 hover:bg-orange-50"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Sortear Cantidad
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <Button
                    key={num}
                    variant={cantidadBailarines === num ? 'default' : 'outline'}
                    onClick={() => setCantidadBailarines(num)}
                    className={`transition-all duration-300 ${
                      cantidadBailarines === num
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'border-orange-300 hover:border-orange-500'
                    }`}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant={cantidadBailarines === 'todos' ? 'default' : 'outline'}
                  onClick={() => setCantidadBailarines('todos')}
                  className={`transition-all duration-300 ${
                    cantidadBailarines === 'todos'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'border-orange-300 hover:border-orange-500'
                  }`}
                >
                  Todos
                </Button>
              </div>
            </div>

            {!sorteoBaileDisponible && (
              <div className="mb-4 p-4 bg-amber-100 border-2 border-amber-300 rounded-lg flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-700" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">{mensajeBaile}</p>
                  <p className="text-xs text-amber-700">El sorteo se habilitará el 21 de diciembre a las 22:30</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSortearBaile}
              disabled={sorteoActivo || !sorteoBaileDisponible}
              className={`w-full font-bold py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                !sorteoBaileDisponible 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white'
              }`}
            >
              {sorteoActivo ? (
                <>
                  <Shuffle className="w-5 h-5 mr-2 animate-spin" />
                  Sorteando...
                </>
              ) : !sorteoBaileDisponible ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Sorteo Bloqueado
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5 mr-2" />
                  Sortear Baile
                </>
              )}
            </Button>

            {resultadoSorteo && (
              <div className="mt-6 p-6 bg-gradient-to-br from-orange-100 to-rose-100 rounded-lg border-2 border-orange-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                    <Music className="w-5 h-5 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-900">
                      {resultadoSorteo.ritmo}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 text-center mb-3">
                    Bailarines seleccionados:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {resultadoSorteo.bailarines.map((bailarin) => (
                      <div
                        key={bailarin.id}
                        className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm"
                      >
                        <Badge className="bg-orange-600 text-white font-bold">
                          #{bailarin.numero}
                        </Badge>
                        <span className="font-medium text-gray-800">{bailarin.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sorteo de Premios */}
        <Card className="border-2 border-rose-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
            <CardTitle className="flex items-center gap-2 text-2xl text-rose-900">
              <Gift className="w-7 h-7" />
              Sorteo de Premios
            </CardTitle>
            <CardDescription>Sortea los premios entre los participantes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!sorteoPremiosDisponible && (
              <div className="mb-6 p-4 bg-rose-100 border-2 border-rose-300 rounded-lg flex items-center gap-3">
                <Clock className="w-5 h-5 text-rose-700" />
                <div>
                  <p className="text-sm font-semibold text-rose-900">{mensajePremios}</p>
                  <p className="text-xs text-rose-700">El sorteo se habilitará a la medianoche (00:00)</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {premios.map((premio) => (
                <div
                  key={`${premio.id}-${updateKey}`}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                    premio.ganado
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-lg'
                  }`}
                >
                  <div className="text-center mb-4">
                    <Gift className={`w-12 h-12 mx-auto mb-2 ${
                      premio.ganado ? 'text-green-500' : 'text-rose-500'
                    }`} />
                    <h3 className="font-bold text-lg text-gray-800">{premio.nombre}</h3>
                  </div>

                  {premio.ganado ? (
                    <div className="text-center space-y-2">
                      <Badge className="bg-green-600 text-white">
                        ¡Ganado!
                      </Badge>
                      <div className="p-3 bg-white rounded-lg border border-green-300">
                        <p className="font-semibold text-green-900">{premio.ganador.nombre}</p>
                        <p className="text-sm text-green-700">N° {premio.ganador.numero}</p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSortearPremio(premio)}
                      disabled={premioSeleccionado === premio.id || !sorteoPremiosDisponible}
                      className={`w-full transition-all duration-300 ${
                        !sorteoPremiosDisponible
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {premioSeleccionado === premio.id ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Sorteando...
                        </>
                      ) : !sorteoPremiosDisponible ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Bloqueado
                        </>
                      ) : (
                        <>
                          <Shuffle className="w-4 h-4 mr-2" />
                          Sortear
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer con botón secreto */}
      <div 
        className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-white py-6 mt-12 cursor-pointer select-none"
        onClick={handleFooterClick}
        title="Triple clic para desbloqueo de emergencia"
      >
        <div className="max-w-6xl mx-auto text-center px-4">
          <p className="text-amber-100">
            ¡Nos vemos en la pista! 🎵
            {overrideActivo && <span className="ml-3 text-xs opacity-50">🔓</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MilongaSorteo;
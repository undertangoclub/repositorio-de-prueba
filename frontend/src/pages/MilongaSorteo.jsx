import React, { useState, useEffect } from 'react';
import { Music, Users, Gift, Plus, Trash2, Shuffle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';
import {
  agregarBailarin,
  obtenerBailarines,
  eliminarBailarin,
  sortearBailarines,
  sortearRitmo,
  sortearPremio,
  obtenerPremios,
  marcarPremioGanado
} from '../mock';

const MilongaSorteo = () => {
  const [nombreInput, setNombreInput] = useState('');
  const [bailarines, setBailarines] = useState([]);
  const [cantidadBailarines, setCantidadBailarines] = useState(2);
  const [resultadoSorteo, setResultadoSorteo] = useState(null);
  const [premios, setPremios] = useState([]);
  const [sorteoActivo, setSorteoActivo] = useState(false);
  const [premioSeleccionado, setPremioSeleccionado] = useState(null);

  useEffect(() => {
    cargarBailarines();
    cargarPremios();
  }, []);

  const cargarPremios = () => {
    const premiosActuales = obtenerPremios();
    setPremios(premiosActuales);
  };

  const cargarBailarines = () => {
    const bailarinesActivos = obtenerBailarines();
    setBailarines(bailarinesActivos);
  };

  const handleAgregarBailarin = () => {
    if (!nombreInput.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre",
        variant: "destructive"
      });
      return;
    }

    const nuevoBailarin = agregarBailarin(nombreInput.trim());
    cargarBailarines();
    setNombreInput('');
    
    toast({
      title: "¡Bailarín registrado!",
      description: `${nuevoBailarin.nombre} - Número ${nuevoBailarin.numero}`
    });
  };

  const handleEliminarBailarin = (id) => {
    eliminarBailarin(id);
    cargarBailarines();
    toast({
      title: "Bailarín eliminado",
      description: "Se ha eliminado el bailarín de la lista"
    });
  };

  const handleSortearBaile = () => {
    if (bailarines.length === 0) {
      toast({
        title: "Error",
        description: "No hay bailarines registrados",
        variant: "destructive"
      });
      return;
    }

    setSorteoActivo(true);
    
    // Animación de sorteo
    setTimeout(() => {
      const bailarinesSorteados = sortearBailarines(cantidadBailarines);
      const ritmoSorteado = sortearRitmo();
      
      setResultadoSorteo({
        bailarines: bailarinesSorteados,
        ritmo: ritmoSorteado
      });
      
      setSorteoActivo(false);
      
      toast({
        title: "¡A bailar!",
        description: `${ritmoSorteado} - ${bailarinesSorteados.length} bailarín(es)`
      });
    }, 2000);
  };

  const handleSortearPremio = (premio) => {
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

    setPremioSeleccionado(premio.id);
    
    // Animación de sorteo
    setTimeout(() => {
      const ganador = sortearPremio(premio.id);
      
      const premiosActualizados = marcarPremioGanado(premio.id, ganador);
      setPremios([...premiosActualizados]);
      
      setPremioSeleccionado(null);
      
      toast({
        title: "¡Tenemos ganador!",
        description: `${ganador.nombre} (N° ${ganador.numero}) ganó: ${premio.nombre}`
      });
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cantidad de bailarines:
              </label>
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

            <Button
              onClick={handleSortearBaile}
              disabled={sorteoActivo}
              className="w-full bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-bold py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {sorteoActivo ? (
                <>
                  <Shuffle className="w-5 h-5 mr-2 animate-spin" />
                  Sorteando...
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {premios.map((premio) => (
                <div
                  key={premio.id}
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
                      disabled={premioSeleccionado === premio.id}
                      className="w-full bg-rose-600 hover:bg-rose-700 transition-all duration-300"
                    >
                      {premioSeleccionado === premio.id ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Sorteando...
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

      {/* Footer */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto text-center px-4">
          <p className="text-amber-100">¡Nos vemos en la pista! 🎵</p>
        </div>
      </div>
    </div>
  );
};

export default MilongaSorteo;
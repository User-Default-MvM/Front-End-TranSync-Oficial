// src/pages/Drivers.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Filter, Phone, Calendar } from "lucide-react";
import driversAPI from "../utilidades/driversAPI";
import toast from 'react-hot-toast';

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ title, value, colorClass = 'text-white' }) => (
    <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
        <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">{label}</label>
        <input {...props} className="w-full p-2 rounded-md bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const SelectField = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">{label}</label>
        <select {...props} className="w-full p-2 rounded-md bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500">
            {options.map(opt => 
                typeof opt === 'object' 
                ? <option key={opt.value} value={opt.value}>{opt.label}</option>
                : <option key={opt} value={opt}>{opt === '' ? 'Todos' : opt.replace(/_/g, ' ')}</option>
            )}
        </select>
    </div>
);

const DriverForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(initialData);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nombre" name="nomUsuario" value={formData.nomUsuario} onChange={handleChange} required />
                <InputField label="Apellido" name="apeUsuario" value={formData.apeUsuario} onChange={handleChange} required />
                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                <InputField label="Documento" name="numDocUsuario" value={formData.numDocUsuario} onChange={handleChange} required />
                <InputField label="Teléfono" name="telUsuario" value={formData.telUsuario} onChange={handleChange} />
                <InputField label="Vencimiento Licencia" name="fecVenLicConductor" value={formData.fecVenLicConductor} onChange={handleChange} type="date" required />
                <SelectField label="Tipo Licencia" name="tipLicConductor" value={formData.tipLicConductor} onChange={handleChange} options={['B1', 'B2', 'B3', 'C1', 'C2', 'C3']} />
                {initialData.idConductor && (
                    <SelectField label="Estado" name="estConductor" value={formData.estConductor} onChange={handleChange} options={['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES']} />
                )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg border-gray-600 hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
            </div>
        </form>
    );
};

const getStatusStyles = (status) => {
    const styles = {
        ACTIVO: 'bg-green-800 text-green-300',
        INACTIVO: 'bg-red-800 text-red-300',
        DIA_DESCANSO: 'bg-blue-800 text-blue-300',
        INCAPACITADO: 'bg-yellow-800 text-yellow-300',
        DE_VACACIONES: 'bg-purple-800 text-purple-300',
    };
    return styles[status] || 'bg-gray-700 text-gray-300';
};


// --- COMPONENTE PRINCIPAL ---
const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState({ type: null, data: null });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ estConductor: '', tipLicConductor: '', conVehiculo: '' });

    const loadDrivers = useCallback(async () => {
        setLoading(true);
        try {
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
            const data = await driversAPI.getAll(activeFilters);
            setDrivers(data || []);
        } catch (err) {
            toast.error("Error al cargar los conductores.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { loadDrivers(); }, [loadDrivers]);

    const stats = useMemo(() => {
        const total = drivers.length;
        const activos = drivers.filter(c => c.estConductor === 'ACTIVO').length;
        const conVehiculo = drivers.filter(c => c.plaVehiculo).length;
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        
        const licenciaPorVencer = drivers.filter(c => {
            const vencimiento = new Date(c.fecVenLicConductor);
            return vencimiento > today && vencimiento <= next30Days;
        }).length;

        const licenciaVencida = drivers.filter(c => new Date(c.fecVenLicConductor) < today).length;
        const inactivos = drivers.filter(c => c.estConductor === 'INACTIVO').length;

        return { total, activos, conVehiculo, licenciaPorVencer, licenciaVencida, inactivos };
    }, [drivers]);

    const filteredDrivers = useMemo(() => drivers.filter(driver =>
        `${driver.nomUsuario} ${driver.apeUsuario}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.numDocUsuario?.includes(searchTerm)
    ), [drivers, searchTerm]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const handleSave = (formData) => {
        const isCreating = modal.type === 'create';
        const apiCall = isCreating ? driversAPI.create(formData) : driversAPI.update(modal.data.idConductor, formData);
        
        const promise = apiCall.then(() => {
            setModal({ type: null, data: null });
            loadDrivers();
        }).catch(error => {
            console.error("Error al guardar:", error);
            throw error;
        });

        toast.promise(promise, {
            loading: `${isCreating ? 'Creando' : 'Actualizando'} conductor...`,
            success: `Conductor ${isCreating ? 'creado' : 'actualizado'}.`,
            error: (err) => `Error: ${err.message || 'No se pudo completar la operación.'}`,
        });
    };

    const handleDelete = (driver) => {
        toast((t) => (
            <div className="text-white">
                <p>¿Eliminar a <strong>{driver.nomUsuario}</strong>?</p>
                <div className="flex gap-2 mt-2">
                    <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => {
                        toast.dismiss(t.id);
                        const promise = driversAPI.delete(driver.idConductor).then(() => loadDrivers());
                        toast.promise(promise, { loading: 'Eliminando...', success: 'Conductor eliminado.', error: 'No se pudo eliminar.' });
                    }}>Eliminar</button>
                    <button className="bg-gray-600 text-white px-3 py-1 rounded" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
                </div>
            </div>
        ));
    };

    if (loading) return <div className="p-8 bg-gray-900 min-h-full text-center">Cargando...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-900 text-white min-h-full">
            <h1 className="text-2xl md:text-3xl font-bold">Gestión de Conductores</h1>
            
            {/* === BLOQUE DE TARJETAS AÑADIDO === */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-6">
                <StatCard title="Total" value={stats.total} />
                <StatCard title="Activos" value={stats.activos} colorClass="text-green-400" />
                <StatCard title="Con Vehículo" value={stats.conVehiculo} colorClass="text-blue-400" />
                <StatCard title="Licencia por Vencer" value={stats.licenciaPorVencer} colorClass="text-yellow-400" />
                <StatCard title="Licencia Vencida" value={stats.licenciaVencida} colorClass="text-red-400" />
                <StatCard title="Inactivos" value={stats.inactivos} />
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                        <input type="text" placeholder="Buscar por nombre o documento..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-72 pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            <Filter size={16} /> Filtros
                        </button>
                        <button onClick={() => setModal({ type: 'create', data: { nomUsuario: '', apeUsuario: '', email: '', numDocUsuario: '', telUsuario: '', tipLicConductor: 'B1', fecVenLicConductor: '' }})} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                            <Plus size={16} /> Nuevo Conductor
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-700">
                        <SelectField label="Estado" name="estConductor" value={filters.estConductor} onChange={handleFilterChange} options={['', 'ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES']} />
                        <SelectField label="Tipo de licencia" name="tipLicConductor" value={filters.tipLicConductor} onChange={handleFilterChange} options={['', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3']} />
                        <SelectField label="Asignación de vehículo" name="conVehiculo" value={filters.conVehiculo} onChange={handleFilterChange} options={[{value:'', label:'Todos'}, {value:'true', label:'Con vehículo'}, {value:'false', label:'Sin vehículo'}]} />
                    </div>
                )}
            </div>
            
            {modal.type && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700">
                        <h2 className="text-xl font-bold p-6 border-b border-gray-700">{modal.type === 'create' ? 'Crear' : 'Editar'} Conductor</h2>
                        <DriverForm initialData={modal.data} onSave={handleSave} onCancel={() => setModal({ type: null, data: null })}/>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto bg-gray-800 rounded-lg mt-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400">
                            <th className="p-4 font-semibold">Nombre</th>
                            <th className="p-4 font-semibold">Documento</th>
                            <th className="p-4 font-semibold">Licencia</th>
                            <th className="p-4 font-semibold">Contacto</th>
                            <th className="p-4 font-semibold">Estado</th>
                            <th className="p-4 font-semibold">Vehículo</th>
                            <th className="p-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="7" className="text-center p-8 text-gray-400">Cargando...</td></tr>}
                        {!loading && filteredDrivers.map(driver => (
                            <tr key={driver.idConductor} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4 font-medium">{driver.nomUsuario} {driver.apeUsuario}</td>
                                <td className="p-4 text-gray-400">{driver.numDocUsuario}</td>
                                <td className="p-4">
                                    <div className="font-medium">{driver.tipLicConductor}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar size={12} /><span>Vence: {formatDate(driver.fecVenLicConductor)}</span></div>
                                </td>
                                <td className="p-4">
                                    <a href={`tel:${driver.telUsuario}`} className="flex items-center gap-2 text-blue-400 hover:underline"><Phone size={14} />{driver.telUsuario || 'N/A'}</a>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyles(driver.estConductor)}`}>
                                        {driver.estConductor.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400">{driver.plaVehiculo || 'Sin asignar'}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => setModal({ type: 'edit', data: { ...driver, fecVenLicConductor: driver.fecVenLicConductor.split('T')[0] }})} className="p-2 text-blue-400 hover:bg-gray-700 rounded-full"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(driver)} className="p-2 text-red-400 hover:bg-gray-700 rounded-full"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Drivers;
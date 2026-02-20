import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaBox, FaFileInvoice, FaShoppingCart, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
  const links = [
    { to: '/', label: 'Dashboard', icon: <FaHome /> },
    { to: '/clientes', label: 'Clientes', icon: <FaUsers /> },
    { to: '/productos', label: 'Productos', icon: <FaBox /> },
    { to: '/cotizaciones', label: 'Cotizaciones', icon: <FaFileInvoice /> },
    { to: '/notas-venta', label: 'Notas de Venta', icon: <FaShoppingCart /> },
    { to: '/reportes', label: 'Reportes', icon: <FaChartBar /> },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4 text-2xl font-bold border-b">RIMPE NP</div>
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? 'bg-gray-300 font-semibold' : ''
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
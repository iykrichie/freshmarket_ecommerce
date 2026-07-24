import React from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { DashboardOverview } from './DashboardOverview';
import { ProductManagement } from './ProductManagement';
import { InventoryManagement } from './InventoryManagement';
import { OrderManagement } from './OrderManagement';
import { DeliveryZoneManagement } from './DeliveryZoneManagement';
import { CouponManagement } from './CouponManagement';
import { CustomerManagement } from './CustomerManagement';
import { ReportsSection } from './ReportsSection';
import { SettingsSection } from './SettingsSection';

export const AdminLayout: React.FC = () => {
  const { activeAdminTab } = useStore();

  const renderActiveSection = () => {
    switch (activeAdminTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'products':
        return <ProductManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'zones':
        return <DeliveryZoneManagement />;
      case 'coupons':
        return <CouponManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <AdminHeader />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        <AdminSidebar />

        <main className="flex-1 min-w-0">{renderActiveSection()}</main>
      </div>
    </div>
  );
};

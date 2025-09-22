'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Edit,
  Eye,
  Truck,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';

export default function SupplyOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Mock data - replace with API calls
  const supplyOrders = [
    {
      id: 'SO001',
      orderNumber: 'LAB-2024-001',
      supplier: 'MedLab Supplies Inc.',
      category: 'Reagents',
      status: 'PENDING',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-18',
      totalAmount: 2850.00,
      priority: 'HIGH',
      items: [
        { name: 'CBC Reagent Kit', quantity: 5, unit: 'Kit', unitPrice: 450.00 },
        { name: 'Troponin Test Strips', quantity: 10, unit: 'Box', unitPrice: 125.00 }
      ],
      requestedBy: 'Dr. Sarah Johnson',
      notes: 'Urgent order - running low on CBC reagents'
    },
    {
      id: 'SO002',
      orderNumber: 'LAB-2024-002',
      supplier: 'DiagnosticCorp',
      category: 'Equipment',
      status: 'APPROVED',
      orderDate: '2024-01-14',
      expectedDelivery: '2024-01-20',
      totalAmount: 15750.00,
      priority: 'MEDIUM',
      items: [
        { name: 'Centrifuge Rotor', quantity: 1, unit: 'Unit', unitPrice: 8500.00 },
        { name: 'Pipette Tips (1000μL)', quantity: 20, unit: 'Box', unitPrice: 362.50 }
      ],
      requestedBy: 'Michael Chen',
      notes: 'Replacement for damaged centrifuge rotor'
    },
    {
      id: 'SO003',
      orderNumber: 'LAB-2024-003',
      supplier: 'BioTech Solutions',
      category: 'Consumables',
      status: 'DELIVERED',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-15',
      deliveredDate: '2024-01-15',
      totalAmount: 890.00,
      priority: 'LOW',
      items: [
        { name: 'Sample Tubes', quantity: 50, unit: 'Pack', unitPrice: 12.50 },
        { name: 'Gloves (Nitrile)', quantity: 10, unit: 'Box', unitPrice: 26.50 }
      ],
      requestedBy: 'Dr. Sarah Johnson',
      notes: 'Monthly consumables restocking'
    },
    {
      id: 'SO004',
      orderNumber: 'LAB-2024-004',
      supplier: 'ChemLab Express',
      category: 'Reagents',
      status: 'CANCELLED',
      orderDate: '2024-01-12',
      totalAmount: 1250.00,
      priority: 'LOW',
      items: [
        { name: 'Buffer Solutions', quantity: 8, unit: 'Bottle', unitPrice: 156.25 }
      ],
      requestedBy: 'Michael Chen',
      notes: 'Cancelled due to supplier quality issues',
      cancelledReason: 'Quality concerns with supplier batch'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'DELIVERED':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredOrders = supplyOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || order.category.toLowerCase() === filterCategory.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = [
    {
      title: 'Total Orders',
      value: supplyOrders.length.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Orders',
      value: supplyOrders.filter(o => o.status === 'PENDING').length.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'This Month Spend',
      value: `$${supplyOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'High Priority',
      value: supplyOrders.filter(o => o.priority === 'HIGH').length.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supply Orders</h1>
            <p className="text-gray-600 mt-1">Manage laboratory supply orders and inventory</p>
          </div>
          <button 
            onClick={() => setShowNewOrderModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="reagents">Reagents</option>
              <option value="equipment">Equipment</option>
              <option value="consumables">Consumables</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(order.priority)}`}>
                    {order.priority} PRIORITY
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Order Date: {order.orderDate}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">Order Number</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.supplier}</p>
                  <p className="text-xs text-gray-500">Supplier</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.category}</p>
                  <p className="text-xs text-gray-500">Category</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">${order.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Amount</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Requested by {order.requestedBy}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Expected: {order.expectedDelivery}
                      {order.deliveredDate && ` • Delivered: ${order.deliveredDate}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Items ({order.items.length})</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-700">
                        {item.name} × {item.quantity} {item.unit}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(item.quantity * item.unitPrice).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Notes</p>
                <p className="text-sm text-blue-800">{order.notes}</p>
                {order.cancelledReason && (
                  <>
                    <p className="text-sm font-medium text-red-900 mt-2 mb-1">Cancellation Reason</p>
                    <p className="text-sm text-red-800">{order.cancelledReason}</p>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Order ID: {order.id}
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  {order.status === 'PENDING' && (
                    <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                      <Edit className="h-4 w-4" />
                      <span>Edit Order</span>
                    </button>
                  )}
                  {order.status === 'APPROVED' && (
                    <button className="flex items-center space-x-1 px-3 py-2 bg-purple-50 text-purple-600 text-sm font-medium rounded-md hover:bg-purple-100 transition-colors">
                      <Truck className="h-4 w-4" />
                      <span>Track Delivery</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search criteria.' 
                : 'No supply orders available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

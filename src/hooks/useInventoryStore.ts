
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Department {
  id: string;
  name: string;
  notes?: string;
}

export interface InventoryItem {
  sku: string;
  name: string;
  departmentId: string;
  department: string;
  unit: string;
  quantity: number;
  reorderPoint: number;
  condition: 'New' | 'Good' | 'Fair' | 'Needs Repair' | 'Expired';
  description?: string;
  billName?: string;
  billNumber?: string;
}

export interface Transaction {
  id: string;
  sku: string;
  itemName: string;
  quantity: number;
  type: 'check-in' | 'check-out';
  user: string;
  date: string;
  notes?: string;
}

interface InventoryStore {
  items: InventoryItem[];
  departments: Department[];
  transactions: Transaction[];
  searchTerm: string;
  departmentFilter: string;
  
  // Computed values
  lowStockItems: InventoryItem[];
  filteredItems: InventoryItem[];
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'department'>) => void;
  updateItem: (sku: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (sku: string) => void;
  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  setSearchTerm: (term: string) => void;
  setDepartmentFilter: (filter: string) => void;
  refreshData: () => void;
  exportInventory: () => void;
  exportTransactions: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialDepartments: Department[] = [
  { id: '1', name: 'Electronics', notes: 'Electronic components and devices' },
  { id: '2', name: 'Office Supplies', notes: 'General office supplies' },
  { id: '3', name: 'Tools', notes: 'Hardware and maintenance tools' },
];

const initialItems: InventoryItem[] = [
  {
    sku: 'ELEC001',
    name: 'Arduino Uno',
    departmentId: '1',
    department: 'Electronics',
    unit: 'pcs',
    quantity: 15,
    reorderPoint: 10,
    condition: 'New',
    description: 'Microcontroller board',
    billName: 'TechSupply Co',
    billNumber: 'INV-2024-001'
  },
  {
    sku: 'OFF001',
    name: 'A4 Paper',
    departmentId: '2',
    department: 'Office Supplies',
    unit: 'reams',
    quantity: 5,
    reorderPoint: 20,
    condition: 'New',
    description: 'White copy paper',
    billName: 'Office Depot',
    billNumber: 'INV-2024-002'
  },
  {
    sku: 'TOOL001',
    name: 'Screwdriver Set',
    departmentId: '3',
    department: 'Tools',
    unit: 'sets',
    quantity: 3,
    reorderPoint: 5,
    condition: 'Good',
    description: 'Phillips and flathead set',
    billName: 'Hardware Store',
    billNumber: 'INV-2024-003'
  }
];

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: initialItems,
      departments: initialDepartments,
      transactions: [],
      searchTerm: '',
      departmentFilter: '',
      
      get lowStockItems() {
        return get().items.filter(item => 
          item.quantity <= item.reorderPoint && item.reorderPoint > 0
        );
      },
      
      get filteredItems() {
        const { items, searchTerm, departmentFilter } = get();
        return items.filter(item => {
          const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesDepartment = !departmentFilter || item.departmentId === departmentFilter;
          
          return matchesSearch && matchesDepartment;
        });
      },
      
      addItem: (item) => set((state) => {
        const department = state.departments.find(d => d.id === item.departmentId);
        const newItem: InventoryItem = {
          ...item,
          department: department?.name || 'Unknown'
        };
        return { items: [...state.items, newItem] };
      }),
      
      updateItem: (sku, updates) => set((state) => ({
        items: state.items.map(item => 
          item.sku === sku ? { ...item, ...updates } : item
        )
      })),
      
      deleteItem: (sku) => set((state) => ({
        items: state.items.filter(item => item.sku !== sku)
      })),
      
      addDepartment: (department) => set((state) => ({
        departments: [...state.departments, { ...department, id: generateId() }]
      })),
      
      updateDepartment: (id, updates) => set((state) => ({
        departments: state.departments.map(dept => 
          dept.id === id ? { ...dept, ...updates } : dept
        )
      })),
      
      deleteDepartment: (id) => set((state) => ({
        departments: state.departments.filter(dept => dept.id !== id),
        items: state.items.filter(item => item.departmentId !== id)
      })),
      
      addTransaction: (transaction) => set((state) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          date: new Date().toLocaleString()
        };
        
        // Update item quantity
        const updatedItems = state.items.map(item => {
          if (item.sku === transaction.sku) {
            const quantityChange = transaction.type === 'check-in' 
              ? transaction.quantity 
              : -transaction.quantity;
            return { ...item, quantity: Math.max(0, item.quantity + quantityChange) };
          }
          return item;
        });
        
        return {
          transactions: [newTransaction, ...state.transactions],
          items: updatedItems
        };
      }),
      
      setSearchTerm: (term) => set({ searchTerm: term }),
      setDepartmentFilter: (filter) => set({ departmentFilter: filter }),
      
      refreshData: () => {
        // In a real app, this would fetch from an API
        set((state) => ({ ...state }));
      },
      
      exportInventory: () => {
        const { items } = get();
        const csvContent = [
          ['SKU', 'Name', 'Department', 'Unit', 'Quantity', 'Reorder Point', 'Condition', 'Description', 'Bill Name', 'Bill Number'],
          ...items.map(item => [
            item.sku, item.name, item.department, item.unit, item.quantity,
            item.reorderPoint, item.condition, item.description || '',
            item.billName || '', item.billNumber || ''
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      
      exportTransactions: () => {
        const { transactions } = get();
        const csvContent = [
          ['ID', 'SKU', 'Item Name', 'Quantity', 'Type', 'User', 'Date', 'Notes'],
          ...transactions.map(txn => [
            txn.id, txn.sku, txn.itemName, txn.quantity, txn.type,
            txn.user, txn.date, txn.notes || ''
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }),
    {
      name: 'inventory-store'
    }
  )
);

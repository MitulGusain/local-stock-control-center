
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Plus, AlertTriangle, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import InventoryTable from "@/components/InventoryTable";
import AddItemDialog from "@/components/AddItemDialog";
import TransactionDialog from "@/components/TransactionDialog";
import DepartmentManager from "@/components/DepartmentManager";
import { useInventoryStore } from "@/hooks/useInventoryStore";

const Index = () => {
  const { toast } = useToast();
  const {
    items,
    departments,
    transactions,
    lowStockItems,
    searchTerm,
    departmentFilter,
    setSearchTerm,
    setDepartmentFilter,
    refreshData,
    exportInventory,
    exportTransactions
  } = useInventoryStore();

  const [showAddItem, setShowAddItem] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (lowStockItems.length > 0) {
      toast({
        title: "Low Stock Alert",
        description: `${lowStockItems.length} items are running low on stock!`,
        variant: "destructive",
      });
    }
  }, [lowStockItems, toast]);

  const handleExportInventory = () => {
    exportInventory();
    toast({
      title: "Export Successful",
      description: "Inventory data has been exported to CSV",
    });
  };

  const handleExportTransactions = () => {
    exportTransactions();
    toast({
      title: "Export Successful", 
      description: "Transaction data has been exported to CSV",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Inventory Management System
            </h1>
            <p className="text-muted-foreground">Manage your stock efficiently</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportInventory}>
              <Download className="h-4 w-4 mr-2" />
              Export Inventory
            </Button>
            <Button variant="outline" onClick={handleExportTransactions}>
              <Download className="h-4 w-4 mr-2" />
              Export Transactions
            </Button>
            <Button onClick={() => setShowAddItem(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{lowStockItems.length} items</strong> are at or below their reorder point!
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts {lowStockItems.length > 0 && <Badge className="ml-2">{lowStockItems.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Inventory Items</CardTitle>
                    <CardDescription>Manage your stock items and quantities</CardDescription>
                  </div>
                  <Button onClick={refreshData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="flex gap-4 mt-4">
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <InventoryTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Stock Transactions</CardTitle>
                    <CardDescription>Check in and check out inventory items</CardDescription>
                  </div>
                  <Button onClick={() => setShowTransaction(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Transaction
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.itemName}</p>
                        <p className="text-sm text-muted-foreground">SKU: {transaction.sku}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={transaction.type === 'check-in' ? 'default' : 'secondary'}>
                          {transaction.type === 'check-in' ? '+' : '-'}{transaction.quantity}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Items that need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No low stock items</p>
                ) : (
                  <div className="space-y-4">
                    {lowStockItems.map((item) => (
                      <div key={item.sku} className="flex justify-between items-center p-4 border rounded-lg border-red-200 bg-red-50">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-medium">
                            {item.quantity} / {item.reorderPoint} {item.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <DepartmentManager />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddItemDialog open={showAddItem} onOpenChange={setShowAddItem} />
        <TransactionDialog open={showTransaction} onOpenChange={setShowTransaction} />
      </div>
    </div>
  );
};

export default Index;

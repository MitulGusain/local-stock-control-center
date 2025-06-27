
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";

const InventoryTable = () => {
  const { filteredItems, deleteItem } = useInventoryStore();

  const getRowColor = (item: any) => {
    if (item.quantity <= item.reorderPoint && item.reorderPoint > 0) {
      return 'bg-red-50 hover:bg-red-100';
    }
    if (item.condition === 'Needs Repair' || item.condition === 'Expired') {
      return 'bg-yellow-50 hover:bg-yellow-100';
    }
    return '';
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition) {
      case 'New': return 'default';
      case 'Good': return 'secondary';
      case 'Fair': return 'outline';
      case 'Needs Repair': return 'destructive';
      case 'Expired': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Bill Name</TableHead>
            <TableHead>Bill Number</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.sku} className={getRowColor(item)}>
              <TableCell className="font-mono">{item.sku}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.department}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>
                <span className={item.quantity <= item.reorderPoint && item.reorderPoint > 0 ? 'text-red-600 font-semibold' : ''}>
                  {item.quantity}
                </span>
              </TableCell>
              <TableCell>{item.reorderPoint}</TableCell>
              <TableCell>
                <Badge variant={getConditionBadgeVariant(item.condition)}>
                  {item.condition}
                </Badge>
              </TableCell>
              <TableCell>{item.billName || '-'}</TableCell>
              <TableCell>{item.billNumber || '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteItem(item.sku)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items found
        </div>
      )}
    </div>
  );
};

export default InventoryTable;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { useToast } from "@/hooks/use-toast";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransactionDialog = ({ open, onOpenChange }: TransactionDialogProps) => {
  const { items, addTransaction } = useInventoryStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    sku: '',
    quantity: '',
    type: 'check-in' as 'check-in' | 'check-out',
    notes: ''
  });

  const selectedItem = items.find(item => item.sku === formData.sku);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.quantity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'check-out' && selectedItem && quantity > selectedItem.quantity) {
      toast({
        title: "Validation Error",
        description: "Cannot check out more items than available",
        variant: "destructive"
      });
      return;
    }

    addTransaction({
      sku: formData.sku,
      itemName: selectedItem?.name || '',
      quantity,
      type: formData.type,
      user: 'Admin',
      notes: formData.notes
    });

    toast({
      title: "Success",
      description: `Transaction processed: ${formData.type === 'check-in' ? 'Added' : 'Removed'} ${quantity} items`
    });

    setFormData({
      sku: '',
      quantity: '',
      type: 'check-in',
      notes: ''
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Transaction</DialogTitle>
          <DialogDescription>
            Check in or check out inventory items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku">Item SKU *</Label>
            <Select value={formData.sku} onValueChange={(value) => setFormData(prev => ({ ...prev, sku: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.sku} value={item.sku}>
                    {item.sku} - {item.name} (Current: {item.quantity} {item.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedItem && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm"><strong>Item:</strong> {selectedItem.name}</p>
              <p className="text-sm"><strong>Current Stock:</strong> {selectedItem.quantity} {selectedItem.unit}</p>
              <p className="text-sm"><strong>Department:</strong> {selectedItem.department}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="1"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-in">Check In (Add Stock)</SelectItem>
                  <SelectItem value="check-out">Check Out (Remove Stock)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Transaction notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Process Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;

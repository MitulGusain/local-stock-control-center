
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { useToast } from "@/hooks/use-toast";

const DepartmentManager = () => {
  const { departments, addDepartment, deleteDepartment } = useInventoryStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Department name is required",
        variant: "destructive"
      });
      return;
    }

    addDepartment({
      name: formData.name.trim(),
      notes: formData.notes.trim()
    });

    toast({
      title: "Success",
      description: "Department added successfully"
    });

    setFormData({ name: '', notes: '' });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the department "${name}"? This will also remove all items in this department.`)) {
      deleteDepartment(id);
      toast({
        title: "Success",
        description: "Department deleted successfully"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department Management</CardTitle>
          <CardDescription>
            Manage departments for organizing your inventory items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deptName">Department Name *</Label>
                <Input
                  id="deptName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Electronics, Office Supplies, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deptNotes">Notes</Label>
                <Textarea
                  id="deptNotes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Department description..."
                  rows={2}
                />
              </div>
            </div>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>{department.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(department.id, department.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {departments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No departments found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentManager;

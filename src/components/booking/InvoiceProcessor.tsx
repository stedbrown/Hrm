import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Printer,
  Download,
  Mail,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Home,
  CheckCircle,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface Invoice {
  id: string;
  quoteId?: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  invoiceDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  paymentMethod?: string;
  notes?: string;
}

interface InvoiceProcessorProps {
  invoice?: Invoice;
  onSave?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onProcessPayment?: (invoice: Invoice, method: string) => void;
}

const InvoiceProcessor = ({
  invoice: initialInvoice,
  onSave = () => {},
  onSend = () => {},
  onProcessPayment = () => {},
}: InvoiceProcessorProps) => {
  const defaultInvoice: Invoice = {
    id: `INV-${new Date().getTime().toString().slice(-8)}`,
    quoteId: `QT-${new Date().getTime().toString().slice(-6)}`,
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    customerAddress: "123 Main St, Anytown, AT 12345",
    invoiceDate: new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    items: [
      {
        id: "1",
        description: "Deluxe Room - 3 nights",
        quantity: 3,
        unitPrice: 150,
        taxRate: 10,
        total: 450,
      },
      {
        id: "2",
        description: "Room Service",
        quantity: 2,
        unitPrice: 50,
        taxRate: 10,
        total: 100,
      },
      {
        id: "3",
        description: "Airport Transfer",
        quantity: 1,
        unitPrice: 75,
        taxRate: 10,
        total: 75,
      },
    ],
    subtotal: 625,
    taxTotal: 62.5,
    total: 687.5,
    status: "draft",
    notes: "Thank you for your business!",
  };

  const [invoice, setInvoice] = useState<Invoice>(
    initialInvoice || defaultInvoice,
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 10,
  });

  const handleSaveInvoice = () => {
    onSave(invoice);
    setIsEditing(false);
  };

  const handleSendInvoice = () => {
    const updatedInvoice = { ...invoice, status: "sent" as const };
    setInvoice(updatedInvoice);
    onSend(updatedInvoice);
  };

  const handleProcessPayment = () => {
    const updatedInvoice = {
      ...invoice,
      status: "paid" as const,
      paymentMethod,
    };
    setInvoice(updatedInvoice);
    onProcessPayment(updatedInvoice, paymentMethod);
    setShowPaymentDialog(false);
  };

  const handleAddItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitPrice) return;

    const total = (newItem.quantity || 0) * (newItem.unitPrice || 0);
    const newItemComplete: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: newItem.description || "",
      quantity: newItem.quantity || 0,
      unitPrice: newItem.unitPrice || 0,
      taxRate: newItem.taxRate || 0,
      total,
    };

    const updatedItems = [...invoice.items, newItemComplete];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const taxTotal = updatedItems.reduce(
      (sum, item) => sum + (item.total * item.taxRate) / 100,
      0,
    );

    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxTotal,
      total: subtotal + taxTotal,
    });

    setNewItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 10,
    });
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = invoice.items.filter((item) => item.id !== id);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    const taxTotal = updatedItems.reduce(
      (sum, item) => sum + (item.total * item.taxRate) / 100,
      0,
    );

    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxTotal,
      total: subtotal + taxTotal,
    });
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "sent":
        return <Badge variant="secondary">Sent</Badge>;
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full h-full bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Invoice #{invoice.id}</h1>
            {invoice.quoteId && (
              <p className="text-gray-500">
                Generated from Quote #{invoice.quoteId}
              </p>
            )}
            <div className="mt-2 flex items-center">
              {getStatusBadge(invoice.status)}
            </div>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={invoice.status === "paid"}
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
                <Button variant="outline" onClick={() => {}}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                {invoice.status === "draft" && (
                  <Button onClick={handleSendInvoice}>
                    <Mail className="h-4 w-4 mr-2" /> Send Invoice
                  </Button>
                )}
                {(invoice.status === "sent" ||
                  invoice.status === "overdue") && (
                  <Button onClick={() => setShowPaymentDialog(true)}>
                    <CreditCard className="h-4 w-4 mr-2" /> Process Payment
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveInvoice}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name">Name</Label>
                    <Input
                      id="customer-name"
                      value={invoice.customerName}
                      onChange={(e) =>
                        setInvoice({ ...invoice, customerName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={invoice.customerEmail}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          customerEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-address">Address</Label>
                    <Input
                      id="customer-address"
                      value={invoice.customerAddress}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          customerAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{invoice.customerName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{invoice.customerEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{invoice.customerAddress}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invoice-date">Invoice Date</Label>
                    <Input
                      id="invoice-date"
                      type="date"
                      value={format(invoice.invoiceDate, "yyyy-MM-dd")}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          invoiceDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={format(invoice.dueDate, "yyyy-MM-dd")}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          dueDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      Invoice Date: {format(invoice.invoiceDate, "PPP")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Due Date: {format(invoice.dueDate, "PPP")}</span>
                  </div>
                  {invoice.status === "paid" && invoice.paymentMethod && (
                    <div className="flex items-center mt-4">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>
                        Paid via {invoice.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Invoice Items</CardTitle>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      newItem.description &&
                      newItem.quantity &&
                      newItem.unitPrice
                    ) {
                      handleAddItem();
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {isEditing && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.taxRate}%</TableCell>
                    <TableCell className="text-right">
                      ${item.total.toFixed(2)}
                    </TableCell>
                    {isEditing && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}

                {isEditing && (
                  <TableRow>
                    <TableCell>
                      <Input
                        placeholder="Item description"
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            quantity: parseInt(e.target.value),
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-8"
                          value={newItem.unitPrice}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              unitPrice: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={newItem.taxRate}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              taxRate: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      $
                      {(
                        (newItem.quantity || 0) * (newItem.unitPrice || 0)
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleAddItem}
                        disabled={
                          !newItem.description ||
                          !newItem.quantity ||
                          !newItem.unitPrice
                        }
                      >
                        <Plus className="h-4 w-4 text-green-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={isEditing ? 4 : 3}>Subtotal</TableCell>
                  <TableCell className="text-right">
                    ${invoice.subtotal.toFixed(2)}
                  </TableCell>
                  {isEditing && <TableCell />}
                </TableRow>
                <TableRow>
                  <TableCell colSpan={isEditing ? 4 : 3}>Tax</TableCell>
                  <TableCell className="text-right">
                    ${invoice.taxTotal.toFixed(2)}
                  </TableCell>
                  {isEditing && <TableCell />}
                </TableRow>
                <TableRow>
                  <TableCell colSpan={isEditing ? 4 : 3}>
                    <div className="font-bold">Total</div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${invoice.total.toFixed(2)}
                  </TableCell>
                  {isEditing && <TableCell />}
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Additional information for the customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Input
                value={invoice.notes || ""}
                onChange={(e) =>
                  setInvoice({ ...invoice, notes: e.target.value })
                }
                placeholder="Add notes for the customer"
              />
            ) : (
              <p className="text-gray-600">{invoice.notes}</p>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <p>Payment Terms: Due within 30 days</p>
                <p>Please include the invoice number with your payment</p>
              </div>
              {invoice.status !== "paid" && (
                <div className="text-right">
                  <p className="font-semibold">Amount Due</p>
                  <p className="text-2xl font-bold">
                    ${invoice.total.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Payment Processing Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Record payment for Invoice #{invoice.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">Invoice Total:</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProcessPayment}>
              <CheckCircle className="h-4 w-4 mr-2" /> Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceProcessor;

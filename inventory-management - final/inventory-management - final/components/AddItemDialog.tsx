"use client";

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Upload, Search, Loader2 } from 'lucide-react'
import Image from "next/image"
import ConfirmSharedItemDialog from './ConfirmSharedItemDialog'
import { useItems } from '@/hooks/useItems'
import { useToast } from '@/hooks/use-toast'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

interface Item {
  id: string
  name: string
  product_id: string
  sizes: Array<{ size: string; quantity: number }>
  image_url: string | null
  original_quantity: number
  inCirculation?: number
  total?: number
  brand_id?: string
  is_active?: boolean
  is_shared?: boolean
}

interface Brand {
  name: string
  itemCount: number
}

interface AddItemDialogProps {
  showDialog: boolean
  setShowDialog: (show: boolean) => void
  brandId: string
}

export default function AddItemDialog({ showDialog, setShowDialog, brandId }: AddItemDialogProps) {
  const { addItem, items, refreshItems } = useItems(brandId);
  const { toast } = useToast();
  
  const [newItem, setNewItem] = useState({ 
    name: "", 
    productId: "", 
    sizes: [{ size: "Einheitsgröße", quantity: 0 }], 
    image: "/placeholder.svg" 
  })
  const [multipleSizes, setMultipleSizes] = useState(false)
  const [sharedItemInput, setSharedItemInput] = useState("")
  const [sharedItemResults, setSharedItemResults] = useState<Item[]>([])
  const [selectedSharedItem, setSelectedSharedItem] = useState<Item | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (showDialog) {
      setNewItem({ 
        name: "", 
        productId: "", 
        sizes: [{ size: "Einheitsgröße", quantity: 0 }], 
        image: "/placeholder.svg" 
      })
      setMultipleSizes(false)
      setSharedItemInput("")
      setSharedItemResults([])
      setSelectedSharedItem(null)
      setImageFile(null)
    }
  }, [showDialog])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewItem({ ...newItem, image: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Search for shared items
  const searchSharedItems = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSharedItemResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // Search by name or product_id
      const { data, error } = await supabase
        .from('items')
        .select('id, name, product_id, image_url, original_quantity, is_shared')
        .or(`name.ilike.%${searchTerm}%,product_id.ilike.%${searchTerm}%`)
        .limit(10);
        
      if (error) {
        console.error('Error searching items:', error);
        throw error;
      }
      
      // For each item, fetch its sizes
      const itemsWithSizes = await Promise.all(data.map(async (item) => {
        const { data: sizesData, error: sizesError } = await supabase
          .from('item_sizes')
          .select('size, original_quantity')
          .eq('item_id', item.id);
          
        if (sizesError) {
          console.error('Error fetching item sizes:', sizesError);
          return {
            ...item,
            sizes: [{ size: 'Einheitsgröße', quantity: item.original_quantity }]
          };
        }
        
        return {
          ...item,
          sizes: sizesData.map(s => ({ size: s.size, quantity: s.original_quantity }))
        };
      }));
      
      setSharedItemResults(itemsWithSizes);
    } catch (error) {
      console.error('Error searching items:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSharedItems(sharedItemInput);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [sharedItemInput]);

  const handleAdd = async () => {
    try {
      setIsSubmitting(true)
      
      // Validate input
      if (!newItem.name.trim()) {
        toast({
          title: "Error",
          description: "Bitte geben Sie einen Namen für den Artikel ein.",
          variant: "destructive",
        })
        return
      }
      
      // Generate a random product ID if not provided
      let productIdToUse = newItem.productId.trim();
      if (!productIdToUse) {
        productIdToUse = uuidv4();
      }

      // Validate quantity
      const totalQuantity = newItem.sizes.reduce((sum, size) => sum + size.quantity, 0)
      if (totalQuantity <= 0) {
        toast({
          title: "Error",
          description: "Die Menge muss größer als 0 sein.",
          variant: "destructive",
        })
        return
      }
      
      // Validate that all sizes have names when using multiple sizes
      if (multipleSizes) {
        // Check for empty size names
        for (const size of newItem.sizes) {
          if (!size.size.trim()) {
            toast({
              title: "Error",
              description: "Alle Größen müssen einen Namen haben.",
              variant: "destructive",
            })
            return
          }
        }
        
        // Check for duplicate size names
        const sizeNames = newItem.sizes.map(size => size.size.trim())
        const uniqueSizeNames = new Set(sizeNames)
        if (sizeNames.length !== uniqueSizeNames.size) {
          toast({
            title: "Error",
            description: "Jede Größe muss einen eindeutigen Namen haben.",
            variant: "destructive",
          })
          return
        }
      }
      
      // Create the item
      await addItem(
        newItem.name,
        productIdToUse,
        totalQuantity,
        imageFile,
        false, // not shared
        multipleSizes ? newItem.sizes : undefined // Pass sizes array if multiple sizes are enabled
      )
      
      // Reset form and close dialog
      setNewItem({ 
        name: "", 
        productId: "", 
        sizes: [{ size: "Einheitsgröße", quantity: 0 }], 
        image: "/placeholder.svg" 
      })
      setImageFile(null)
      setShowDialog(false)
      
      toast({
        title: "Erfolg",
        description: "Artikel wurde erfolgreich hinzugefügt.",
      })
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: "Error",
        description: "Fehler beim Hinzufügen des Artikels. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSharedItemSelect = (item: Item) => {
    setSelectedSharedItem(item);
    setSharedItemInput(item.name);
    setSharedItemResults([]);
    
    // Set the newItem values based on the selected shared item
    setNewItem({
      name: item.name,
      productId: item.product_id,
      sizes: item.sizes || [{ size: "Einheitsgröße", quantity: item.original_quantity }],
      image: item.image_url || "/placeholder.svg"
    });
    
    // Show the confirm dialog
    setShowConfirmDialog(true);
  };

  return (
    <>
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Artikel hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sharedItem" className="text-right">
              Shared Item
            </Label>
            <div className="col-span-3 relative">
              <div className="flex w-full items-center space-x-2">
                <div className="relative flex-grow">
                  <Input
                    id="sharedItem"
                    value={sharedItemInput}
                    onChange={(e) => {
                      setSharedItemInput(e.target.value);
                      setSelectedSharedItem(null);
                    }}
                    placeholder="Nach Artikel suchen (Name oder Produkt-ID)"
                    className="pr-8"
                  />
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  ) : (
                    <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  )}
                </div>
              </div>
              
              {sharedItemResults.length > 0 && !selectedSharedItem && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {sharedItemResults.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => handleSharedItemSelect(item)}
                    >
                      <div className="w-8 h-8 mr-2 flex-shrink-0">
                        <Image
                          src={item.image_url || "/placeholder.svg"}
                          alt=""
                          width={32}
                          height={32}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">ID: {item.product_id}</div>
                      </div>
                      {item.is_shared && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Shared
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {selectedSharedItem ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{newItem.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Produkt-ID</Label>
                <div className="col-span-3">{newItem.productId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Größen und Mengen</Label>
                <div className="col-span-3">
                  {newItem.sizes.map((size, index) => (
                    <div key={index} className="mb-2">
                      {size.size}: {size.quantity}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Bild</Label>
                <div className="col-span-3">
                  <Image
                    src={newItem.image}
                    alt="Artikelbild"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="size-mode"
                  checked={multipleSizes}
                  onCheckedChange={(checked) => {
                    setMultipleSizes(checked)
                    if (checked) {
                      setNewItem({...newItem, sizes: [{ size: '', quantity: 0 }]})
                    } else {
                      setNewItem({...newItem, sizes: [{ size: 'Einheitsgröße', quantity: 0 }]})
                    }
                  }}
                />
                <Label htmlFor="size-mode">Mehrere Größen</Label>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productId" className="text-right">
                  Produkt-ID
                </Label>
                <Input
                  id="productId"
                  value={newItem.productId}
                  onChange={(e) => setNewItem({...newItem, productId: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  {multipleSizes ? 'Größen und Mengen' : 'Menge'}
                </Label>
                <div className="col-span-3">
                  {multipleSizes ? (
                    newItem.sizes.map((size, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Input
                          placeholder="Größe"
                          value={size.size}
                          onChange={(e) => {
                            const newSizes = [...newItem.sizes];
                            newSizes[index].size = e.target.value;
                            setNewItem({...newItem, sizes: newSizes});
                          }}
                          className="w-1/2"
                        />
                        <Input
                          type="number"
                          placeholder="Menge"
                          value={size.quantity}
                          onChange={(e) => {
                            const newSizes = [...newItem.sizes];
                            newSizes[index].quantity = parseInt(e.target.value);
                            setNewItem({...newItem, sizes: newSizes});
                          }}
                          className="w-1/2"
                        />
                      </div>
                    ))
                  ) : (
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.sizes[0].quantity}
                      onChange={(e) => setNewItem({...newItem, sizes: [{ size: 'Einheitsgröße', quantity: parseInt(e.target.value) }]})}
                    />
                  )}
                  
                  {multipleSizes && (
                    <Button
                      onClick={() => setNewItem({...newItem, sizes: [...newItem.sizes, { size: '', quantity: 0 }]})}
                      variant="outline"
                      className="mt-2"
                    >
                      Größe hinzufügen
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemImage" className="text-right">
                  Bild
                </Label>
                <div className="col-span-3">
                  <Input
                    id="itemImage"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" /> Bild hochladen
                  </Button>
                </div>
              </div>
              {newItem.image && newItem.image !== "/placeholder.svg" && (
                <div className="mt-2">
                  <Image
                    src={newItem.image}
                    alt="Vorschau"
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
              )}
            </>
          )}
        </div>
        <Button 
          onClick={handleAdd} 
          disabled={selectedSharedItem !== null || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird hinzugefügt...
            </>
          ) : (
            "Hinzufügen"
          )}
        </Button>
      </DialogContent>
    </Dialog>
    {showConfirmDialog && selectedSharedItem && (
      <ConfirmSharedItemDialog
        item={selectedSharedItem}
        brandId={brandId}
        onConfirm={(item) => {
          setShowConfirmDialog(false);
          setSelectedSharedItem(null);
          setSharedItemInput("");
          refreshItems();
          setShowDialog(false);
        }}
        onCancel={() => {
          setShowConfirmDialog(false);
          setSelectedSharedItem(null);
          setSharedItemInput("");
        }}
      />
    )}
    </>
  )
}
